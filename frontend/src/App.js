import { useEffect, useMemo, useState } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import { ShieldCheck, Wrench, Factory, Truck, Sparkles, MapPin, Phone, Mail, ArrowRight, Menu, X } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL; // Never hardcode
const API = `${BACKEND_URL}/api`;
const HERO_BG = "https://customer-assets.emergentagent.com/job_phoenix-scraper/artifacts/gc2m0gcr_ChatGPT%20Image%20Aug%2012%2C%202025%2C%2008_22_08%20PM.png";
const LOGO = "https://customer-assets.emergentagent.com/job_phoenix-scraper/artifacts/k8r8d71w_Phoenix%20Logo%20Full%20Transparent.svg";

// User-provided featured images
const USER_FEATURED = [
  { key: 'drop-deck', title: "Drop Deck Ramp", src: "https://customer-assets.emergentagent.com/job_phoenix-scraper/artifacts/nhs6king_ChatGPT%20Image%20Aug%2012%2C%202025%2C%2007_57_19%20PM.png", desc: "Tri-axle drop deck with beavertail ramp system for heavy duty equipment loading.", link: "/drop-decks" },
  { key: 'towable', title: "Towable Screen", src: "https://customer-assets.emergentagent.com/job_phoenix-scraper/artifacts/ygql9kbe_ChatGPT%20Image%20Aug%2012%2C%202025%2C%2007_54_47%20PM.png", desc: "Mobile screen platform with secure mounts and transport-ready chassis.", link: "/custom" },
  { key: 'utility', title: "Utility Trailer", src: "https://customer-assets.emergentagent.com/job_phoenix-scraper/artifacts/s6j4v1h5_ChatGPT%20Image%20Aug%2012%2C%202025%2C%2007_52_01%20PM.png", desc: "Dual-axle utility trailer with stake sides and treated wood deck.", link: "/products" },
  { key: 'tanks', title: "Flatbed with Tanks", src: "https://customer-assets.emergentagent.com/job_phoenix-scraper/artifacts/4ofcgha9_ChatGPT%20Image%20Aug%2012%2C%202025%2C%2007_51_54%20PM.png", desc: "Flatbed configuration built to transport vertical tanks with secure strapping.", link: "/flatbeds" },
  { key: 'control-van', title: "Control Van", src: "https://customer-assets.emergentagent.com/job_phoenix-scraper/artifacts/4km1o9e0_ChatGPT%20Image%20Aug%2012%2C%202025%2C%2007_51_59%20PM.png", desc: "Operator-ready control van with elevated platform access and power systems.", link: "/control-vans" },
];

// -------------- Reusable helpers --------------
const api = axios.create({ baseURL: API });

function useAuth() {
  const [token, setToken] = useState(() => localStorage.getItem("pt_token") || "");
  const isAuthed = !!token;
  useEffect(() => { token ? localStorage.setItem("pt_token", token) : localStorage.removeItem("pt_token"); }, [token]);
  const headers = useMemo(() => (token ? { Authorization: `Bearer ${token}` } : {}), [token]);
  return { token, setToken, isAuthed, headers };
}

// Global scroll reveal + page change refresh
function useScrollAnimations() {
  const location = useLocation();
  useEffect(() => {
    const els = document.querySelectorAll('.reveal, .slide-left, .slide-right');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, { threshold: 0.15 });
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [location.pathname]);
}

// -------------- Layout --------------
function Shell({ children }){
  useScrollAnimations();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [deskOpen, setDeskOpen] = useState(false);
  return (
    <div className="App">
      <nav className="nav">
        <div className="nav-inner">
          <div className="logo">
            <img className="logo-img" src={LOGO} alt="Phoenix Trailers" />
            <Link to="/">Phoenix Trailers</Link>
          </div>

          <div className="nav-links">
            <Link to="/products">Products</Link>
            <Link to="/flatbeds">Flatbeds</Link>
            <Link to="/drop-decks">Drop Decks</Link>
            <Link to="/truck-decks">Truck Decks</Link>
            <Link to="/control-vans">Control Vans</Link>
            <Link to="/custom">Custom Builds</Link>
            <Link to="/dealers">Dealers</Link>
            <Link to="/contact">Contact</Link>
          </div>

          <div className="nav-actions">
            {/* Desktop dropdown menu */}
            <div className="desk-menu desk-hamburger">
              <button className="btn secondary small" onClick={() => setDeskOpen(v=>!v)} aria-label="Open menu"><Menu size={18}/></button>
              <div className={`dropdown-panel ${deskOpen ? 'open' : ''}`}>
                <Link className="dropdown-item" to="/about" onClick={()=>setDeskOpen(false)}>About</Link>
                <Link className="dropdown-item" to="/add" onClick={()=>setDeskOpen(false)}>Add Product</Link>
                <Link className="dropdown-item" to="/login" onClick={()=>setDeskOpen(false)}>Login</Link>
              </div>
            </div>
            {/* Mobile hamburger */}
            <button className="btn secondary small hamburger" onClick={()=>setMobileOpen(true)} aria-label="Open navigation"><Menu size={18}/></button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div className={`mobile-menu ${mobileOpen ? 'open' : ''}`} onClick={(e)=>{ if(e.target.classList.contains('mobile-menu')) setMobileOpen(false) }}>
        <div className="mobile-drawer">
          <div className="mobile-head">
            <div className="logo" style={{gap:8}}>
              <img className="logo-img" style={{height:28}} src={LOGO} alt="Phoenix Trailers" />
              <span>Phoenix Trailers</span>
            </div>
            <button className="btn secondary small" onClick={()=>setMobileOpen(false)} aria-label="Close"><X size={18}/></button>
          </div>
          <Link className="mlink" to="/products" onClick={()=>setMobileOpen(false)}>Products</Link>
          <Link className="mlink" to="/flatbeds" onClick={()=>setMobileOpen(false)}>Flatbeds</Link>
          <Link className="mlink" to="/drop-decks" onClick={()=>setMobileOpen(false)}>Drop Decks</Link>
          <Link className="mlink" to="/truck-decks" onClick={()=>setMobileOpen(false)}>Truck Decks</Link>
          <Link className="mlink" to="/control-vans" onClick={()=>setMobileOpen(false)}>Control Vans</Link>
          <Link className="mlink" to="/custom" onClick={()=>setMobileOpen(false)}>Custom Builds</Link>
          <Link className="mlink" to="/dealers" onClick={()=>setMobileOpen(false)}>Dealers</Link>
          <Link className="mlink" to="/about" onClick={()=>setMobileOpen(false)}>About</Link>
          <Link className="mlink" to="/contact" onClick={()=>setMobileOpen(false)}>Contact</Link>
          <Link className="mlink" to="/add" onClick={()=>setMobileOpen(false)}>Add Product</Link>
          <Link className="mlink" to="/login" onClick={()=>setMobileOpen(false)}>Login</Link>
        </div>
      </div>

      {children}
      <footer className="footer container">© {new Date().getFullYear()} Phoenix Trailer Manufacturing — Calgary, AB</footer>
    </div>
  );
}

// -------------- Pages --------------
function Home(){
  const [heroY, setHeroY] = useState(0);
  useEffect(() => {
    let raf;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setHeroY(window.scrollY * 0.08));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
  }, []);

  return (
    <Shell>
      <section className="hero" style={{backgroundImage:`url(${HERO_BG})`, backgroundSize:'cover', backgroundPosition:`center calc(50% + ${heroY}px)`}}>
        <div className="hero-wrap container">
          <div className="reveal" style={{maxWidth:860}}>
            <h1 className="h-title">Making Top Quality Trucks & Trailers</h1>
            {/* Subtext removed per request */}
            <div className="cta" style={{marginTop:16}}>
              <Link className="btn" to="/products">Browse Products</Link>
              <Link className="btn secondary" to="/custom">Custom Builds</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="container reveal">
        <h3>Featured Builds</h3>
        <p className="h-sub" style={{color:'var(--muted)'}}>A glimpse at the range — from road-ready flatbeds to specialty control vans.</p>
        <div className="featured-list">
          {USER_FEATURED.map((it, i) => (
            <div key={it.key} className={`featured-row ${i % 2 === 0 ? 'slide-left' : 'slide-right'}`}>
              {i % 2 === 0 ? (
                <>
                  <div className="featured-media"><img src={it.src} alt={it.title}/></div>
                  <div className="featured-copy">
                    <h4>{it.title}</h4>
                    <p>{it.desc}</p>
                    <Link to={it.link} className="btn secondary" style={{display:'inline-flex', alignItems:'center', gap:8, marginTop:12}}>Learn more <ArrowRight size={16}/></Link>
                  </div>
                </>
              ) : (
                <>
                  <div className="featured-copy">
                    <h4>{it.title}</h4>
                    <p>{it.desc}</p>
                    <Link to={it.link} className="btn secondary" style={{display:'inline-flex', alignItems:'center', gap:8, marginTop:12}}>Learn more <ArrowRight size={16}/></Link>
                  </div>
                  <div className="featured-media"><img src={it.src} alt={it.title}/></div>
                </>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="container reveal">
        <h3>What We Build</h3>
        <div className="grid" style={{marginTop:12}}>
          <Link className="card reveal" to="/flatbeds"><h4>Flatbeds</h4><p>Multi-length options with secure tie-downs and durable decks.</p></Link>
          <Link className="card reveal" to="/drop-decks"><h4>Drop Decks</h4><p>Lower deck height for easy loading and improved stability.</p></Link>
          <Link className="card reveal" to="/control-vans"><h4>Control Vans</h4><p>Operator-ready cabins with power, access, and visibility.</p></Link>
        </div>
      </section>

      <section className="container reveal">
        <h3>Why Phoenix</h3>
        <div className="features">
          <div className="feature reveal"><div className="icon"><ShieldCheck size={20}/></div><h4>Built to Last</h4><p className="h-sub">Industrial-grade materials, quality welds, and rigorous QA.</p></div>
          <div className="feature reveal"><div className="icon"><Wrench size={20}/></div><h4>Custom Fabrication</h4><p className="h-sub">Tailored solutions for your application and region.</p></div>
          <div className="feature reveal"><div className="icon"><Factory size={20}/></div><h4>Canadian Made</h4><p className="h-sub">Designed and manufactured for Canadian conditions.</p></div>
          <div className="feature reveal"><div className="icon"><Truck size={20}/></div><h4>Fast Turnarounds</h4><p className="h-sub">Responsive builds with dependable delivery.</p></div>
        </div>
      </section>

      <section className="container reveal">
        <h3>Our Locations</h3>
        <div className="grid" style={{marginTop:12}}>
          <div className="card reveal"><h4>Calgary</h4><p className="h-sub"><MapPin size={14}/> Phoenix Equipment Sales Ltd. – 6633 86 Ave SE, Calgary AB</p><p><Mail size={14}/> seanm@rpmtrailer.ca • <Phone size={14}/> (403) 837-1322</p></div>
          <div className="card reveal"><h4>Rocky View</h4><p className="h-sub"><MapPin size={14}/> 28515 Kleysen Way, Rocky View, AB, T1X 0K1</p><p><Mail size={14}/> paulm@rpmtrailer.ca • <Phone size={14}/> (403) 819-5516</p></div>
          <Link to="/dealers" className="card reveal" style={{display:'flex', alignItems:'center', justifyContent:'center'}}><h4>View all dealers →</h4></Link>
        </div>
      </section>

      <section className="container reveal">
        <div className="form" style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:12}}>
          <div>
            <h3>Have a build in mind?</h3>
            <p className="h-sub">Talk to our fabrication team about specs, timelines and pricing.</p>
          </div>
          <div className="cta"><Link className="btn" to="/custom">Start a custom build</Link></div>
        </div>
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

// ---- Products ----
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
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      </div>
    </Shell>
  );
}

function ProductCard({p}){
  const nav = useNavigate();
  return (
    <div className="card reveal" onClick={()=>nav(`/products/${p.id}`)} style={{cursor:'pointer'}}>
      {p.images?.[0] && <img src={p.images[0]} alt={p.title}/>}<h4>{p.title}</h4>
      <p>{p.description}</p>
    </div>
  )
}

function ProductDetail(){
  const {id} = useParams();
  const [p, setP] = useState(null);
  const auth = useAuth();
  const nav = useNavigate();
  useEffect(()=>{ (async()=>{ try{ const {data}=await api.get(`/products/${id}`); setP(data);}catch(e){ console.error(e);} })(); },[id]);
  const del = async ()=>{ if(!window.confirm("Delete this product?")) return; try{ await api.delete(`/products/${id}`, {headers: auth.headers}); nav('/products'); }catch(e){ alert('Delete failed'); }}
  if(!p) return <Shell><div className="container"><p>Loading...</p></div></Shell>
  return (
    <Shell>
      <div className="container">
        <h2 className="reveal">{p.title}</h2>
        <div className="gallery" style={{marginTop:12}}>
          {(p.images||[]).map((u,i)=> (<img className="reveal" key={i} src={u} alt={`${p.title} ${i+1}`} />))}
        </div>
        <p style={{marginTop:16}} className="reveal">{p.description}</p>
        {auth.isAuthed && (
          <div style={{marginTop:16, display:'flex', gap:12}} className="reveal">
            <Link className="btn secondary" to={`/products/${id}/edit`}>Edit</Link>
            <button className="btn" onClick={del}>Delete</button>
          </div>
        )}
      </div>
    </Shell>
  )
}

function EditProduct(){
  const {id} = useParams();
  const auth = useAuth();
  const nav = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([""]);
  useEffect(()=>{ (async()=>{ try{ const {data}=await api.get(`/products/${id}`); setTitle(data.title); setDescription(data.description); setImages(data.images?.length?data.images:[""]); }catch(e){ console.error(e);} })(); },[id]);
  const submit = async (e)=>{ e.preventDefault(); try{ await api.put(`/products/${id}`, {title, description, images: images.filter(Boolean)}, {headers: auth.headers}); nav(`/products/${id}`);}catch(e){ alert('Update failed'); }}
  return (
    <Shell>
      <div className="container" style={{maxWidth:720}}>
        <h2 className="reveal">Edit Product</h2>
        <form className="form reveal" onSubmit={submit}>
          <div style={{display:'grid', gap:12}}>
            <label className="label">Title</label>
            <input className="input" value={title} onChange={e=>setTitle(e.target.value)} required />
            <label className="label">Description</label>
            <textarea className="input" rows={5} value={description} onChange={e=>setDescription(e.target.value)} required />
            <label className="label">Image URLs</label>
            {images.map((url, i) => (
              <input key={i} className="input" value={url} onChange={e=>setImages(prev=> prev.map((v,idx)=> idx===i?e.target.value:v))} />
            ))}
            <button type="button" className="btn secondary" onClick={()=>setImages([...images, ""]) }>Add another image</button>
            <button className="btn" type="submit">Save changes</button>
          </div>
        </form>
      </div>
    </Shell>
  )
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
        <h2 className="reveal">{mode === "login" ? "Login" : "Register"}</h2>
        <form className="form reveal" onSubmit={submit}>
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
      await api.post("/products", payload, {headers: auth.headers});
      nav(`/products`);
    }catch(err){ alert("Failed to create product. Are you logged in?"); console.error(err); }
  }
  return (
    <Shell>
      <div className="container" style={{maxWidth:720}}>
        <h2 className="reveal">Add a Product</h2>
        {!auth.isAuthed && (
          <p className="h-sub reveal">You are not logged in. <Link to="/login">Login or register</Link> to add products.</p>
        )}
        <form className="form reveal" onSubmit={submit}>
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

// ---- Content Pages ----
function Section({title, lead, images=[]}){
  return (
    <div className="section container reveal">
      <h2>{title}</h2>
      {lead && <p className="lead">{lead}</p>}
      {images.length>0 && (
        <div className="gallery">
          {images.map((u,i)=>(<img className="reveal" key={i} src={u} alt={`${title} ${i+1}`} />))}
        </div>
      )}
    </div>
  )
}

function Flatbeds(){
  const imgs=[
    "https://i0.wp.com/phoenixtrailers.ca/wp-content/uploads/2024/10/IMG_5050.jpg?fit=1024%2C768&ssl=1",
    "https://i0.wp.com/phoenixtrailers.ca/wp-content/uploads/2024/10/IMG_5053.jpg?fit=1024%2C768&ssl=1",
    "https://i0.wp.com/phoenixtrailers.ca/wp-content/uploads/2024/10/IMG_5055.jpg?fit=1024%2C768&ssl=1",
    "https://i0.wp.com/phoenixtrailers.ca/wp-content/uploads/2024/10/IMG_5052.jpg?fit=1024%2C768&ssl=1",
  ];
  return <Shell><Section title="Flatbeds" lead="Drive efficiently and securely with our flatbeds" images={imgs}/></Shell>
}
function DropDecks(){
  const imgs=[
    "https://i0.wp.com/phoenixtrailers.ca/wp-content/uploads/2024/10/IMG_0985.jpg?fit=640%2C480&ssl=1",
    "https://i0.wp.com/phoenixtrailers.ca/wp-content/uploads/2024/10/IMG_4049-1.jpg?fit=640%2C480&ssl=1",
    "https://i0.wp.com/phoenixtrailers.ca/wp-content/uploads/2024/10/IMG_2771.jpg?fit=640%2C480&ssl=1",
    "https://i0.wp.com/phoenixtrailers.ca/wp-content/uploads/2024/10/IMG_2772-1.jpg?fit=640%2C480&ssl=1",
  ];
  return <Shell><Section title="Drop Decks" lead="High-performance drop decks for easy loading and maximum stability" images={imgs}/></Shell>
}
function TruckDecks(){
  const imgs=[
    "https://i0.wp.com/phoenixtrailers.ca/wp-content/uploads/2024/10/IMG_5062.jpg?fit=1024%2C768&ssl=1",
    "https://i0.wp.com/phoenixtrailers.ca/wp-content/uploads/2024/10/IMG_5067.jpg?fit=1024%2C768&ssl=1",
    "https://i0.wp.com/phoenixtrailers.ca/wp-content/uploads/2024/10/IMG_5068.jpg?fit=1024%2C768&ssl=1",
  ];
  return <Shell><Section title="Truck Decks" lead="Truck decks designed for heavy-duty hauling and seamless integration" images={imgs}/></Shell>
}
function ControlVans(){
  const imgs=[
    "https://i0.wp.com/phoenixtrailers.ca/wp-content/uploads/2024/10/IMG_5132-1.jpg?fit=768%2C576&ssl=1",
    "https://i0.wp.com/phoenixtrailers.ca/wp-content/uploads/2024/10/IMG_5134-1.jpg?fit=768%2C576&ssl=1",
    "https://i0.wp.com/phoenixtrailers.ca/wp-content/uploads/2024/10/IMG_5136.jpg?fit=768%2C576&ssl=1",
  ];
  return <Shell><Section title="Control Vans" lead="Control vans equipped for optimal operation and versatility" images={imgs}/></Shell>
}
function CustomBuilds(){
  const imgs=[
    "https://i0.wp.com/phoenixtrailers.ca/wp-content/uploads/2024/10/file.jpg?fit=640%2C480&ssl=1",
    "https://i0.wp.com/phoenixtrailers.ca/wp-content/uploads/2024/10/file-1.jpg?fit=640%2C480&ssl=1",
    "https://i0.wp.com/phoenixtrailers.ca/wp-content/uploads/2024/04/IMG_3331.jpg?fit=640%2C480&ssl=1",
    "https://i0.wp.com/phoenixtrailers.ca/wp-content/uploads/2024/10/IMG_2765-1.jpg?fit=640%2C480&ssl=1",
    "https://i0.wp.com/phoenixtrailers.ca/wp-content/uploads/2024/10/IMG_3334-1.jpg?fit=640%2C480&ssl=1",
    "https://i0.wp.com/phoenixtrailers.ca/wp-content/uploads/2024/10/IMG_1155.jpg?fit=640%2C480&ssl=1",
    "https://i0.wp.com/phoenixtrailers.ca/wp-content/uploads/2024/10/IMG_0075.jpg?fit=640%2C480&ssl=1",
  ];
  return (
    <Shell>
      <Section title="Custom Trailer Designs" lead="Whatever you need, we make it happen" images={imgs}/>
      <div className="container" style={{marginTop:-16}}>
        <div className="features">
          <div className="feature reveal"><div className="icon"><Sparkles size={20}/></div><h4>Concept to Delivery</h4><p className="h-sub">Share your brief—our team designs, fabricates and finishes.</p></div>
          <div className="feature reveal"><div className="icon"><Wrench size={20}/></div><h4>Specification Options</h4><p className="h-sub">Deck sizes, materials, power, access, tie-downs, paint and more.</p></div>
          <div className="feature reveal"><div className="icon"><ShieldCheck size={20}/></div><h4>Compliance</h4><p className="h-sub">Built to safety standards and field‑tested.</p></div>
          <div className="feature reveal"><div className="icon"><Truck size={20}/></div><h4>Deployment Ready</h4><p className="h-sub">Delivered ready for work with documentation.</p></div>
        </div>
        <div className="form reveal" style={{marginTop:16, display:'flex', justifyContent:'space-between', gap:12}}>
          <div>
            <h3>Start a custom build</h3>
            <p className="h-sub">Email <a href="mailto:seanm@rpmtrailer.ca">seanm@rpmtrailer.ca</a> or call (403) 837‑1322</p>
          </div>
          <Link className="btn" to="/contact">Contact Us</Link>
        </div>
      </div>
    </Shell>
  )
}

function About(){
  return (
    <Shell>
      <div className="section container reveal">
        <h2>Serving Canadians Since 2020</h2>
        <p className="lead">Founded in 2020, Phoenix Manufacturing is a proudly Canadian-owned company stemming from RPM Truck & Trailer Repair (est. 1991). We design and build specialized trailer solutions with craftsmanship and customer focus.</p>
        <img className="reveal" style={{width:'100%', borderRadius:12, marginTop:12}} src="https://i0.wp.com/phoenixtrailers.ca/wp-content/uploads/2024/10/IMG_4786.jpg?fit=640%2C480&ssl=1" alt="Shop"/>
        <h3 style={{marginTop:20}}>Our Team</h3>
        <ul style={{marginTop:8, color:'var(--muted)'}}>
          <li>Sean McCormick — Co-Founder, CEO</li>
          <li>Paul McCormick — Co-Founder</li>
          <li>Azhar Nizam — Accountant</li>
          <li>Sales — Coming Soon</li>
        </ul>
      </div>
    </Shell>
  )
}

function Contact(){
  return (
    <Shell>
      <div className="section container reveal">
        <h2>Contact Us</h2>
        <p className="lead">Whether you’re looking for more information or a quote, we’d love to hear from you.</p>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>
          <div className="form reveal">
            <div style={{display:'grid', gap:12}}>
              <div><div className="label">Address</div> Phoenix Equipment Sales Ltd. – 6633 86 Ave SE, Calgary AB</div>
              <div><div className="label">Hours</div> Mon–Fri 9:00AM – 5:00PM</div>
              <div><div className="label">Phone</div> 403-837-1322</div>
              <div><div className="label">Email</div> <a href="mailto:seanm@rpmtrailer.ca">seanm@rpmtrailer.ca</a></div>
            </div>
          </div>
          <div className="form reveal">
            <div className="label">Quick Note</div>
            <p className="h-sub">This form is static in the MVP. Use the email or phone to reach us.</p>
          </div>
        </div>
      </div>
    </Shell>
  )
}

function Dealers(){
  return (
    <Shell>
      <div className="section container reveal">
        <h2>Our Dealers</h2>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>
          <div className="form reveal">
            <h3>Calgary</h3>
            <p className="lead">Phoenix Equipment Sales Ltd. – 6633 86 Ave SE, Calgary AB</p>
            <p>Email: <a href="mailto:seanm@rpmtrailer.ca">seanm@rpmtrailer.ca</a> | Phone: (403) 837-1322</p>
            <img className="reveal" style={{width:'100%', borderRadius:12, marginTop:8}} src="https://i0.wp.com/phoenixtrailers.ca/wp-content/uploads/2024/10/Screenshot-2024-10-24-115800.png?fit=596%2C303&ssl=1" alt="Calgary map"/>
          </div>
          <div className="form reveal">
            <h3>Rocky View</h3>
            <p className="lead">RPM Trailer Repair Services Lt. — 28515 Kleysen Way, Rocky View, AB, T1X 0K1</p>
            <p>Email: <a href="mailto:paulm@rpmtrailer.ca">paulm@rpmtrailer.ca</a> | Phone: (403) 819-5516</p>
            <img className="reveal" style={{width:'100%', borderRadius:12, marginTop:8}} src="https://i0.wp.com/phoenixtrailers.ca/wp-content/uploads/2024/05/IMG_20200718_111136.jpg?fit=680%2C340&ssl=1" alt="Rocky View"/>
          </div>
        </div>
      </div>
    </Shell>
  )
}

function App(){
  // warm the API connection for nice first impression
  useEffect(()=>{ api.get("/").catch(()=>{}); },[]);
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/products" element={<Products/>} />
        <Route path="/products/:id" element={<ProductDetail/>} />
        <Route path="/products/:id/edit" element={<EditProduct/>} />
        <Route path="/login" element={<Login/>} />
        <Route path="/add" element={<AddProduct/>} />
        <Route path="/flatbeds" element={<Flatbeds/>} />
        <Route path="/drop-decks" element={<DropDecks/>} />
        <Route path="/truck-decks" element={<TruckDecks/>} />
        <Route path="/control-vans" element={<ControlVans/>} />
        <Route path="/custom" element={<CustomBuilds/>} />
        <Route path="/about" element={<About/>} />
        <Route path="/contact" element={<Contact/>} />
        <Route path="/dealers" element={<Dealers/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;