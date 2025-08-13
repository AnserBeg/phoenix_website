from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, Form
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timedelta
from jose import jwt, JWTError
from passlib.context import CryptContext

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

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


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


async def get_current_user(token: str = None):
    if token is None:
        # also support Authorization: Bearer token via header when using Depends in routes later if needed
        from fastapi import Request
        def extractor(request: Request):
            auth = request.headers.get("Authorization")
            if auth and auth.lower().startswith("bearer "):
                return auth.split(" ", 1)[1]
            return None
        return extractor


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
    images: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class ProductCreate(BaseModel):
    title: str
    description: str
    images: List[str] = []


# ------------------ Routes ------------------
@api_router.get("/")
async def root():
    return {"message": "Phoenix Trailers API is running"}


@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_obj = StatusCheck(**input.dict())
    await db.status_checks.insert_one(status_obj.dict())
    return status_obj


@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]


# ---- Auth endpoints ----
@api_router.post("/auth/register", response_model=TokenResponse)
async def register(payload: UserCreate):
    existing = await db.users.find_one({"email": payload.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = {
        "id": str(uuid.uuid4()),
        "email": payload.email,
        "password_hash": get_password_hash(payload.password),
        "created_at": datetime.utcnow(),
    }
    await db.users.insert_one(user)
    token = create_access_token({"sub": user["id"], "email": user["email"]})
    return TokenResponse(access_token=token)


@api_router.post("/auth/login", response_model=TokenResponse)
async def login(payload: UserLogin):
    user = await db.users.find_one({"email": payload.email})
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
    docs = await db.products.find().sort("created_at", -1).to_list(1000)
    return [Product(**doc) for doc in docs]


@api_router.post("/products", response_model=Product)
async def create_product(product: ProductCreate, user=Depends(require_auth)):
    prod = Product(**product.dict())
    await db.products.insert_one(prod.dict())
    return prod


@api_router.put("/products/{product_id}", response_model=Product)
async def update_product(product_id: str, product: ProductCreate, user=Depends(require_auth)):
    now = datetime.utcnow()
    update_doc = {**product.dict(), "updated_at": now}
    result = await db.products.find_one_and_update({"id": product_id}, {"$set": update_doc}, return_document=True)
    if not result:
        raise HTTPException(status_code=404, detail="Product not found")
    return Product(**result)


@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str, user=Depends(require_auth)):
    res = await db.products.delete_one({"id": product_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"ok": True}


# Include the router in the main app
app.include_router(api_router)

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

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()