from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, Form
from fastapi.staticfiles import StaticFiles
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timedelta
from jose import jwt, JWTError
from passlib.context import CryptContext
import shutil

# Create uploads directory - use absolute path
UPLOADS_DIR = Path(__file__).parent / "uploads"
UPLOADS_DIR.mkdir(exist_ok=True)

# In-memory storage (data will be lost when server restarts)
users_db = {}
products_db = {}
status_checks_db = []

# Create default user
default_user = {
    "id": str(uuid.uuid4()),
    "email": "seanm@phoenixtrailers.ca",
    "password_hash": None,  # Will be set when password hashing is initialized
    "created_at": datetime.utcnow(),
}
users_db[default_user["email"]] = default_user

# Create the main app without a prefix
app = FastAPI(title="Phoenix Trailers API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security / Auth setup
SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-change-me")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


# Initialize default user password hash
default_user["password_hash"] = get_password_hash("123")
print("Default user created: seanm@phoenixtrailers.ca / 123")


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


# ------------------ Models ------------------
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class StatusCheckCreate(BaseModel):
    client_name: str


class UserCreate(BaseModel):
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class Product(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    images: List[str] = []  # Can be URLs or uploaded file paths
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class ProductCreate(BaseModel):
    title: str
    description: str
    images: List[str] = []  # Can be URLs or uploaded file paths


# ------------------ Routes ------------------
@api_router.get("/")
async def root():
    return {"message": "Phoenix Trailers API is running"}


@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_obj = StatusCheck(**input.dict())
    status_checks_db.append(status_obj.dict())
    return status_obj


@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    return [StatusCheck(**status_check) for status_check in status_checks_db]


# ---- Auth endpoints ----
@api_router.post("/auth/register", response_model=TokenResponse)
async def register(payload: UserCreate):
    if payload.email in users_db:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = {
        "id": str(uuid.uuid4()),
        "email": payload.email,
        "password_hash": get_password_hash(payload.password),
        "created_at": datetime.utcnow(),
    }
    users_db[payload.email] = user
    token = create_access_token({"sub": user["id"], "email": user["email"]})
    return TokenResponse(access_token=token)


@api_router.post("/auth/login", response_model=TokenResponse)
async def login(payload: UserLogin):
    user = users_db.get(payload.email)
    if not user or not verify_password(payload.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": user["id"], "email": user["email"]})
    return TokenResponse(access_token=token)


# Dependency to enforce auth via simple header token in request
from fastapi import Header

async def require_auth(authorization: Optional[str] = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization header")
    try:
        scheme, token = authorization.split(" ", 1)
        if scheme.lower() != "bearer":
            raise ValueError("Invalid scheme")
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")


# ---- Products CRUD ----
@api_router.get("/products", response_model=List[Product])
async def list_products():
    return [Product(**doc) for doc in products_db.values()]


@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    doc = products_db.get(product_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Product not found")
    return Product(**doc)


@api_router.post("/products", response_model=Product)
async def create_product(product: ProductCreate, user=Depends(require_auth)):
    prod = Product(**product.dict())
    products_db[prod.id] = prod.dict()
    return prod


@api_router.put("/products/{product_id}", response_model=Product)
async def update_product(product_id: str, product: ProductCreate, user=Depends(require_auth)):
    if product_id not in products_db:
        raise HTTPException(status_code=404, detail="Product not found")
    now = datetime.utcnow()
    update_doc = {**product.dict(), "id": product_id, "updated_at": now}
    products_db[product_id] = update_doc
    return Product(**update_doc)


@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str, user=Depends(require_auth)):
    if product_id not in products_db:
        raise HTTPException(status_code=404, detail="Product not found")
    del products_db[product_id]
    return {"ok": True}


# File upload endpoint
@api_router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    # Generate unique filename
    file_extension = Path(file.filename).suffix
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = UPLOADS_DIR / unique_filename
    
    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Return the URL to access the file
    return {"filename": unique_filename, "url": f"/uploads/{unique_filename}"}

# Debug endpoint to check uploads directory
@api_router.get("/debug/uploads")
async def debug_uploads():
    files = list(UPLOADS_DIR.glob("*"))
    return {
        "uploads_dir": str(UPLOADS_DIR.absolute()),
        "exists": UPLOADS_DIR.exists(),
        "files": [f.name for f in files if f.is_file()],
        "directories": [f.name for f in files if f.is_dir()]
    }

# Include the router in the main app
app.include_router(api_router)

# Serve uploaded files
print(f"Mounting static files from: {UPLOADS_DIR.absolute()}")
app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR.absolute())), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# No startup/shutdown events needed for in-memory storage