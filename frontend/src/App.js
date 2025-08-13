import { useEffect, useMemo, useState } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL; // Never hardcode
const API = `${BACKEND_URL}/api`;

// -------------- Reusable helpers --------------
const api = axios.create({ baseURL: API });

function useAuth() {
  const [token, setToken] = useState(() => localStorage.getItem("pt_token") || "");
  const isAuthed = !!token;
  useEffect(() => { token ? localStorage.setItem("pt_token", token) : localStorage.removeItem("pt_token"); }, [token]);
  const headers = useMemo(() => (token ? { Authorization: `Bearer ${token}` } : {}), [token]);
  return { token, setToken, isAuthed, headers };
}

// -------------- Layout --------------
function Shell({ children }){
  return (
    <div className="App">
      <nav className="nav">
        <div className="nav-inner">
          <div className="logo">
            <span className="logo-badge" />
            <Link to="/">Phoenix Trailers</Link>
          </div>
          <div>
            <Link to="/products">Products</Link>
            <Link to="/add">Add Product</Link>
            <Link to="/login">Login</Link>
          </div>
        </div>
      </nav>
      {children}
      <footer className="footer container">© {new Date().getFullYear()} Phoenix Trailer Manufacturing</footer>
    </div>
  );
}

// -------------- Pages --------------
function Home(){
  return (
    <Shell>
      <section className="hero">
        <div className="hero-wrap container">
          <div>
            <h1 className="h-title reveal">Making Top Quality Trucks & Trailers</h1>
            <p className="h-sub reveal">Heavy-duty flatbeds, drop decks, control vans and custom builds. Built for Canadian conditions with precision fabrication.</p>
            <div className="cta">
              <Link className="btn" to="/products">Browse Products</Link>
              <a className="btn secondary" href="https://phoenixtrailers.ca/contact-us-2/" target="_blank" rel="noreferrer">Contact Us</a>
            </div>
          </div>
          <div className="grid">
            <ImgCard title="Flatbeds" src="https://customer-assets.emergentagent.com/job_4d2a710e-d2a0-4ceb-9831-16c58e3b2668/artifacts/9ar8tgdj_ChatGPT%20Image%20Aug%2012%2C%202025%2C%2007_57_19%20PM.png"/>
            <ImgCard title="Control Vans" src="https://customer-assets.emergentagent.com/job_4d2a710e-d2a0-4ceb-9831-16c58e3b2668/artifacts/rb7u0yjd_ChatGPT%20Image%20Aug%2012%2C%202025%2C%2007_51_59%20PM.png"/>
            <ImgCard title="Utility Trailers" src="https://customer-assets.emergentagent.com/job_4d2a710e-d2a0-4ceb-9831-16c58e3b2668/artifacts/6fec4x5g_ChatGPT%20Image%20Aug%2012%2C%202025%2C%2007_52_01%20PM.png"/>
          </div>
        </div>
      </section>
      <section className="container">
        <h3>Past Work Highlights</h3>
        <p className="h-sub">Flat beds • Drop decks • Towable screens • Control vans • Customs</p>
      </section>
    </Shell>
  );
}

function ImgCard({title, src}){
  return (
    <div className="card reveal">
      <img src={src} alt={title} />
      <h4>{title}</h4>
      <p>Engineered structures with industrial-grade components and clean welds.</p>
    </div>
  )
}

function Products(){
  const [items, setItems] = useState([]);
  useEffect(() => { (async () => {
    try{ const {data} = await api.get("/products"); setItems(data);}catch(err){ console.error(err);} })(); }, []);
  return (
    <Shell>
      <div className="container">
        <h2>Products</h2>
        <div className="grid" style={{marginTop:16}}>
          {items.map(p => (
            <div key={p.id} className="card">
              {p.images?.[0] && <img src={p.images[0]} alt={p.title}/>}<h4>{p.title}</h4>
              <p>{p.description}</p>
            </div>
          ))}
        </div>
      </div>
    </Shell>
  );
}

function Login(){
  const auth = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("login");
  const submit = async (e) => {
    e.preventDefault();
    try{
      const url = mode === "login" ? "/auth/login" : "/auth/register";
      const {data} = await api.post(url, {email, password});
      auth.setToken(data.access_token); nav("/add");
    }catch(err){ alert("Auth failed"); console.error(err); }
  }
  return (
    <Shell>
      <div className="container" style={{maxWidth:520}}>
        <h2>{mode === "login" ? "Login" : "Register"}</h2>
        <form className="form" onSubmit={submit}>
          <div style={{display:'grid', gap:12}}>
            <label className="label">Email</label>
            <input className="input" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
            <label className="label">Password</label>
            <input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
            <button className="btn" type="submit">Continue</button>
            <button className="btn secondary" type="button" onClick={()=>setMode(mode==="login"?"register":"login")}>{mode === "login" ? "Create account" : "Have an account? Login"}</button>
          </div>
        </form>
      </div>
    </Shell>
  )
}

function AddProduct(){
  const auth = useAuth();
  const nav = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([""]);

  const addField = () => setImages([...images, ""]);
  const updateImg = (i, val) => setImages(prev => prev.map((v,idx)=> idx===i?val:v));

  const submit = async (e) => {
    e.preventDefault();
    try{
      const payload = {title, description, images: images.filter(Boolean)};
      const {data} = await api.post("/products", payload, {headers: auth.headers});
      nav(`/products`);
    }catch(err){ alert("Failed to create product. Are you logged in?"); console.error(err); }
  }

  return (
    <Shell>
      <div className="container" style={{maxWidth:720}}>
        <h2>Add a Product</h2>
        {!auth.isAuthed && (
          <p className="h-sub">You are not logged in. <Link to="/login">Login or register</Link> to add products.</p>
        )}
        <form className="form" onSubmit={submit}>
          <div style={{display:'grid', gap:12}}>
            <label className="label">Title</label>
            <input className="input" value={title} onChange={e=>setTitle(e.target.value)} required />
            <label className="label">Description</label>
            <textarea className="input" rows={5} value={description} onChange={e=>setDescription(e.target.value)} required />
            <label className="label">Image URLs</label>
            {images.map((url, i) => (
              <input key={i} className="input" placeholder={`https://... image ${i+1}`} value={url} onChange={e=>updateImg(i, e.target.value)} />
            ))}
            <button type="button" className="btn secondary" onClick={addField}>Add another image</button>
            <button className="btn" type="submit" disabled={!auth.isAuthed}>Save product</button>
          </div>
        </form>
      </div>
    </Shell>
  );
}

function App(){
  // warm the API connection for nice first impression
  useEffect(()=>{ api.get("/").catch(()=>{}); },[]);
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/products" element={<Products/>} />
        <Route path="/login" element={<Login/>} />
        <Route path="/add" element={<AddProduct/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;