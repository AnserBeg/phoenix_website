import { useEffect, useMemo, useState, useRef } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import { ShieldCheck, Wrench, Factory, Truck, Sparkles, MapPin, Phone, Mail, ArrowRight, Menu, X } from "lucide-react";
// import { ThreeDBackground } from "./components/3DAnimation.jsx";
import { Trailer3DViewer } from "./components/3DModelViewer.jsx";
import { Footer } from "./components/Footer.jsx";
import { OptimizedImage, OptimizedVideo } from "./components/OptimizedImage.jsx";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000"; // Use environment variable or fallback to localhost
const API = `${BACKEND_URL}/api`;
const HERO_BG = `${BACKEND_URL}/uploads/migrated/image_38bef026.jpg`;
const LOGO = `${BACKEND_URL}/uploads/migrated/phoenix_logo_3264f6df.svg`;

// User-provided featured images
const USER_FEATURED = [
  { key: 'flatbed-premium', title: "Premium Flatbed", src: `${BACKEND_URL}/uploads/ChatGPT Image Aug 26, 2025, 04_01_19 PM.jpg`, src2: `${BACKEND_URL}/uploads/ChatGPT Image Aug 26, 2025, 03_41_52 PM (1).jpg`, desc: "High-quality flatbed trailer designed for heavy-duty transportation with enhanced durability.", link: "/flatbeds" },
  { key: 'drop-deck', title: "Drop Deck Ramp", src: `${BACKEND_URL}/uploads/Adobe Express - file.jpg`, src2: `${BACKEND_URL}/uploads/migrated/image_da077c5a.jpg`, desc: "Tri-axle drop deck with beavertail ramp system for heavy duty equipment loading.", link: "/drop-decks" },
  { key: 'tanks', title: "Flatbed with Tanks", src: `${BACKEND_URL}/uploads/migrated/image_ff2a7939.jpg`, src2: `${BACKEND_URL}/uploads/ChatGPT Image Aug 26, 2025, 02_43_39 PM.jpg`, desc: "Flatbed configuration built to transport vertical tanks with secure strapping.", link: "/custom" },
  { key: 'towable', title: "Towable Screen", src: `${BACKEND_URL}/uploads/migrated/image_06b6a17d.jpg`, desc: "Mobile screen platform with secure mounts and transport-ready chassis.", link: "/custom" },
  { key: 'utility', title: "Utility Trailer", src: `${BACKEND_URL}/uploads/migrated/image_d43cb4b8.jpg`, desc: "Dual-axle utility trailer with stake sides and treated wood deck.", link: "/custom" },
  { key: 'control-van', title: "Control Van", src: `${BACKEND_URL}/uploads/migrated/image_f595beb2.jpg`, desc: "Operator-ready control van with elevated platform access and power systems.", link: "/control-vans" },
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
            <Link to="/">
              <img className="logo-img" src={LOGO} alt="Phoenix Trailers" />
            </Link>
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
              <Link to="/" onClick={()=>setMobileOpen(false)}>
                <img className="logo-img" style={{height:28}} src={LOGO} alt="Phoenix Trailers" />
              </Link>
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
      <Footer />
    </div>
  );
}

// -------------- Custom Components --------------
function ToggleImageCard({ item }) {
  const [showingSecond, setShowingSecond] = useState(false);
  const [animId, setAnimId] = useState(null);
  const overlayRef = useRef(null);

  const clip = (p) => `inset(0 ${100 - p * 100}% 0 0)`;

  const animate = (from, to) => {
    if (animId) cancelAnimationFrame(animId);
    const dur = 800; // ms
    const start = performance.now();
    const step = (t) => {
      const e = Math.min(1, (t - start) / dur);
      const eased = from + (to - from) * (1 - Math.pow(1 - e, 3)); // easeOutCubic
      if (overlayRef.current) {
        overlayRef.current.style.clipPath = clip(eased);
      }
      if (e < 1) {
        const newAnimId = requestAnimationFrame(step);
        setAnimId(newAnimId);
      }
    };
    const newAnimId = requestAnimationFrame(step);
    setAnimId(newAnimId);
  };

  const handleToggle = () => {
    if (showingSecond) {
      animate(1, 0); // hide overlay -> show base
    } else {
      animate(0, 1); // show overlay fully -> replace base
    }
    setShowingSecond(!showingSecond);
  };

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [animId]);

  return (
    <div className="featured-item reveal">
              <div className="wipe-wrap">
          {/* Base image (first version) */}
          <img 
            src={item.src} 
            alt={item.title}
            loading="lazy"
          />
          {/* Overlay image (second version) */}
          <div className="wipe-overlay" ref={overlayRef}>
            <img 
              src={item.src2} 
              alt={`${item.title} - View 2`}
              loading="lazy"
            />
          </div>
        </div>
      <div className="featured-content">
        <h3>{item.title}</h3>
        <p>{item.desc}</p>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Link to={item.link} className="btn btn-outline">
            Learn More <ArrowRight size={16} />
          </Link>
          <button 
            onClick={handleToggle}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              background: '#fff',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151'
            }}
          >
            {showingSecond ? 'View 1' : 'View 2'}
          </button>
        </div>
      </div>
    </div>
  );
}

// -------------- Pages --------------
function Home(){
  const [heroY, setHeroY] = useState(0);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [inStockProducts, setInStockProducts] = useState([]);
  
  // Hero carousel media - images and video (using optimized files)
  const heroMedia = [
    { type: 'image', src: `${BACKEND_URL}/uploads/optimized/5_optimized.jpg`, duration: 6000 },
    { type: 'video', src: `${BACKEND_URL}/uploads/Video_Editing_and_Enhancement_Request.mp4`, duration: 8000 },
    { type: 'image', src: `${BACKEND_URL}/uploads/optimized/2_optimized.jpg`, duration: 6000 },
    { type: 'image', src: `${BACKEND_URL}/uploads/optimized/3_optimized.jpg`, duration: 6000 },
    { type: 'image', src: `${BACKEND_URL}/uploads/optimized/4_optimized.jpg`, duration: 6000 }
  ];
  
  // Fallback to original image if carousel fails
  const fallbackImage = HERO_BG;
  
  useEffect(() => {
    let raf;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setHeroY(window.scrollY * 0.08));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
  }, []);
  
  // Auto-advance carousel with dynamic timing and smooth transitions
  useEffect(() => {
    const currentMedia = heroMedia[currentMediaIndex];
    
    // Start transition 1 second before the media should change
    const transitionTimer = setTimeout(() => {
      setIsTransitioning(true);
    }, currentMedia.duration - 1000);
    
    // Change media after transition period
    const changeTimer = setTimeout(() => {
      setCurrentMediaIndex((prevIndex) => 
        prevIndex === heroMedia.length - 1 ? 0 : prevIndex + 1
      );
      setIsTransitioning(false);
    }, currentMedia.duration);
    
    return () => {
      clearTimeout(transitionTimer);
      clearTimeout(changeTimer);
    };
  }, [currentMediaIndex, heroMedia.length]);

  // Fetch in-stock products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await api.get("/products");
        // Take up to 3 products
        setInStockProducts(data.slice(0, 3));
      } catch (err) {
        console.error("Error loading in-stock products:", err);
      }
    };
    fetchProducts();
  }, []);
  
  // Manual navigation
  const goToMedia = (index) => {
    setCurrentMediaIndex(index);
    setIsTransitioning(false);
  };

  return (
    <Shell>
      {/* <ThreeDBackground style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1
      }} /> */}
      <section className="hero" style={{
        minHeight: '100vh',
        padding: '120px 0 80px 0',
        position: 'relative',
        overflow: 'hidden'
      }}
      >
        {/* Background Media */}
        {heroMedia[currentMediaIndex].type === 'image' ? (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url(${heroMedia[currentMediaIndex].src})`,
            backgroundSize: 'cover',
            backgroundPosition: `center calc(50% + ${heroY}px)`,
            transition: 'opacity 1s ease-in-out',
            opacity: isTransitioning ? 0.7 : 1
          }} />
        ) : (
          <OptimizedVideo
            key={currentMediaIndex} // Force re-render on change
            autoPlay
            muted
            playsInline
            preload="metadata" // Only load metadata, not the full video
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: `center calc(50% + ${heroY}px)`,
              transition: 'opacity 1s ease-in-out',
              opacity: isTransitioning ? 0.7 : 1
            }}
            src={heroMedia[currentMediaIndex].src}
            onLoadStart={() => setIsTransitioning(false)}
          />
        )}

        {/* Carousel Navigation Dots */}
        <div style={{
          position: 'absolute',
          bottom: '40px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '12px',
          zIndex: 10
        }}>
          {heroMedia.map((_, index) => (
            <button
              key={index}
              onClick={() => goToMedia(index)}
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                border: 'none',
                background: index === currentMediaIndex ? '#fff' : 'rgba(255,255,255,0.5)',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </div>

        {/* Hero Content */}
        <div className="container" style={{position: 'relative', zIndex: 10}}>
          <div className="hero-content reveal">
            <h1>Phoenix Manufacturing</h1>
            <p className="hero-subtitle">Custom trailer solutions engineered for performance and reliability</p>
            <div className="hero-buttons">
              <Link to="/products" className="btn btn-primary">
                View Products <ArrowRight size={20} />
              </Link>
              <Link to="/custom" className="btn btn-blue">
                Custom Build
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* In Stock Equipment */}
      {inStockProducts.length > 0 && (
        <section className="featured container reveal">
          <h2>In Stock Equipment</h2>
          <div className="featured-grid">
            {inStockProducts.map((product) => (
              <div key={product.id} className="featured-item reveal">
                {product.images && product.images.length > 0 ? (
                  <OptimizedImage 
                    src={`${BACKEND_URL}/uploads/${product.images[0]}`}
                    alt={product.title}
                    loading="lazy"
                  />
                ) : (
                  <div style={{ 
                    width: '100%', 
                    height: '200px', 
                    background: '#f3f4f6', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: '#6b7280'
                  }}>
                    No Image
                  </div>
                )}
                <div className="featured-content">
                  <h3>{product.title}</h3>
                  <p>{product.description}</p>
                  <Link to={`/products/${product.id}`} className="btn btn-outline">
                    View Details <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="featured container reveal">
        <h2>Featured Solutions</h2>
        <div className="featured-grid">
          {USER_FEATURED.map((item) => (
            item.key === 'tanks' || item.key === 'flatbed-premium' || item.key === 'drop-deck' ? (
              <ToggleImageCard key={item.key} item={item} />
            ) : (
              <div key={item.key} className="featured-item reveal">
                <OptimizedImage 
                  src={item.src} 
                  alt={item.title}
                  loading="lazy" // Lazy load images
                />
                <div className="featured-content">
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                  <Link to={item.link} className="btn btn-outline">
                    Learn More <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            )
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section container reveal">
        <h2>Why Choose Phoenix?</h2>
        <div className="features">
          <div className="feature reveal">
            <div className="icon"><ShieldCheck size={24}/></div>
            <h4>Quality Assurance</h4>
            <p>Every trailer built to exacting standards with premium materials</p>
          </div>
          <div className="feature reveal">
            <div className="icon"><Wrench size={24}/></div>
            <h4>Custom Design</h4>
            <p>Tailored solutions designed around your specific requirements</p>
          </div>
          <div className="feature reveal">
            <div className="icon"><Factory size={24}/></div>
            <h4>Canadian Made</h4>
            <p>Proudly manufactured in Canada with local expertise</p>
          </div>
          <div className="feature reveal">
            <div className="icon"><Truck size={24}/></div>
            <h4>Reliable Service</h4>
            <p>Dedicated support from concept to delivery and beyond</p>
          </div>
        </div>
      </section>
    </Shell>
  );
}

function ImgCard({title, src}){
  return (
    <div className="card reveal">
      <OptimizedImage 
        src={src} 
        alt={title} 
        loading="lazy" // Lazy load images
      />
      <h4>{title}</h4>
      <p>Engineered structures with industrial-grade components and clean welds.</p>
    </div>
  )
}

// ---- Products ----
function Products(){
  const [items, setItems] = useState([]);
  
  useEffect(() => { 
    (async () => {
      try{ 
        const {data} = await api.get("/products"); 
        console.log("Products loaded:", data);
        setItems(data);
      }catch(err){ 
        console.error("Error loading products:", err);
      } 
    })(); 
  }, []);
  
  // Force scroll animation refresh when items change
  useEffect(() => {
    if (items.length > 0) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        const els = document.querySelectorAll('.reveal, .slide-left, .slide-right');
        els.forEach((el) => {
          if (el.classList.contains('reveal')) {
            el.classList.add('is-visible');
          }
        });
      }, 100);
    }
  }, [items]);
  
  return (
    <Shell>
      <div className="section container reveal">
        <h2 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Products</h2>
        <p className="lead">Browse our complete collection of custom trailers and equipment</p>
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
      {p.images?.[0] ? (
        <OptimizedImage 
          src={p.images[0].includes('http') ? p.images[0] : `${BACKEND_URL}/uploads/${p.images[0]}`} 
          alt={p.title}
          loading="lazy" // Lazy load images
          onError={(e) => {
            console.error(`Failed to load image in card: ${p.images[0]}`);
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'block';
          }}
        />
      ) : (
        <div style={{
          width: '100%', 
          height: '200px', 
          background: '#f3f4f6', 
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#6b7280',
          fontSize: '14px'
        }}>
          No Image
        </div>
      )}
      <h4>{p.title}</h4>
      <p>{p.description}</p>
    </div>
  )
}

function ProductDetail(){
  const {id} = useParams();
  const [p, setP] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const auth = useAuth();
  const nav = useNavigate();
  
  console.log("ProductDetail rendered with id:", id);
  
  useEffect(()=>{ 
    console.log("ProductDetail useEffect triggered for id:", id);
    (async()=>{ 
      try{ 
        setLoading(true);
        console.log("Fetching product data...");
        const {data} = await api.get(`/products/${id}`); 
        console.log("Product detail loaded:", data);
        setP(data);
      }catch(e){ 
        console.error("Error loading product:", e);
        setError(e.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    })(); 
  },[id]);
  
  const del = async ()=>{ 
    if(!window.confirm("Delete this product?")) return; 
    try{ 
      await api.delete(`/products/${id}`, {headers: auth.headers}); 
      nav('/products'); 
    }catch(e){ 
      alert('Delete failed'); 
    } 
  }
  
  console.log("ProductDetail render state:", { loading, error, product: p });
  
  if(loading) {
    console.log("Showing loading state");
    return (
      <Shell>
        <div className="container">
          <p>Loading product...</p>
          <button onClick={() => nav('/products')}>Back to Products</button>
        </div>
      </Shell>
    );
  }
  
  if(error) {
    console.log("Showing error state:", error);
    return (
      <Shell>
        <div className="container">
          <p>Error: {error}</p>
          <button onClick={() => nav('/products')}>Back to Products</button>
        </div>
      </Shell>
    );
  }
  
  if(!p) {
    console.log("No product data");
    return (
      <Shell>
        <div className="container">
          <p>Product not found</p>
          <button onClick={() => nav('/products')}>Back to Products</button>
        </div>
      </Shell>
    );
  }
  
  console.log("Rendering product:", p);
  console.log("About to return JSX for product:", p.title);
  
  return (
    <Shell>
      <div className="container" style={{padding: '40px 24px'}}>
        <div style={{marginBottom: '24px'}}>
          <button 
            className="btn secondary" 
            onClick={() => nav('/products')}
            style={{fontSize: '14px', padding: '8px 16px'}}
          >
            ← Back to Products
          </button>
        </div>
        <h2 style={{ fontSize: '3rem', marginBottom: '1rem', color: 'var(--text)' }}>{p.title}</h2>
        <p style={{ fontSize: '1.2rem', color: 'var(--muted)', marginBottom: '2rem' }}>{p.description}</p>
        

        
        {p.images && p.images.length > 0 ? (
          <div className="gallery">
            {console.log(`Product ${p.title} images:`, p.images)}
                        {p.images.map((u,i)=> (
              <div key={i} style={{position: 'relative'}}>
                <OptimizedImage 
                  src={u.includes('http') ? u : `${BACKEND_URL}/uploads/${u}`} 
                  alt={`${p.title} ${i+1}`} 
                  loading="lazy" // Lazy load images
                  style={{
                    width: '100%',
                    height: '220px',
                    objectFit: 'cover',
                    borderRadius: '12px',
                    border: '1px solid var(--border)',
                    display: 'block'
                  }}
                  onError={(e) => {
                    console.error(`Failed to load image: ${u}`);
                    e.target.style.display = 'none';
                    // Show error placeholder
                    const placeholder = document.createElement('div');
                    placeholder.innerHTML = 'Image failed to load';
                    placeholder.style.cssText = `
                      width: 100%;
                      height: 220px;
                      background: #f3f4f6;
                      border: 1px solid #e5e7eb;
                      border-radius: 12px;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      color: #6b7280;
                    `;
                    e.target.parentNode.appendChild(placeholder);
                  }}
                />
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            background: '#f3f4f6', 
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '40px',
            textAlign: 'center',
            color: '#6b7280',
            marginTop: '12px'
          }}>
            No images available
          </div>
        )}
        
        {auth.isAuthed && (
          <div style={{marginTop:32, display:'flex', gap:12, justifyContent:'center'}}>
            <Link className="btn secondary" to={`/products/${id}/edit`}>Edit Product</Link>
            <button className="btn" onClick={del}>Delete Product</button>
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
  const [uploading, setUploading] = useState(false);
  
  useEffect(()=>{ 
    (async()=>{ 
      try{ 
        const {data}=await api.get(`/products/${id}`); 
        setTitle(data.title); 
        setDescription(data.description); 
        // Clean up image URLs to just filenames
        const cleanImages = data.images?.map(img => {
          if (img.includes('/uploads/')) {
            return img.split('/uploads/')[1]; // Extract just the filename
          }
          return img;
        }) || [""];
        setImages(cleanImages.length ? cleanImages : [""]); 
      }catch(e){ 
        console.error(e);
      } 
    })(); 
  },[id]);
  
  const handleFileUpload = async (file, index) => {
    if (!file) return;
    
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post("/upload", formData, {
        headers: { ...auth.headers, 'Content-Type': 'multipart/form-data' }
      });
      
      // Use the filename from the response and construct the URL using BACKEND_URL
      const newImages = [...images];
      newImages[index] = response.data.filename; // Just store the filename, not the full URL
      setImages(newImages);
    } catch (err) {
      alert("Failed to upload image");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };
  
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
            <label className="label">Images (Upload files or enter URLs)</label>
            {images.map((url, i) => (
              <div key={i} style={{display:'grid', gap:8}}>
                <input 
                  className="input" 
                  placeholder={`Image ${i+1} - Enter URL or upload file below`} 
                  value={url} 
                  onChange={e=>setImages(prev=> prev.map((v,idx)=> idx===i?e.target.value:v))} 
                />
                <div style={{display:'flex', gap:8, alignItems:'center'}}>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => handleFileUpload(e.target.files[0], i)}
                    style={{flex:1}}
                  />
                  {uploading && <span>Uploading...</span>}
                </div>
              </div>
            ))}
            <button type="button" className="btn secondary" onClick={()=>setImages([...images, ""]) }>Add another image</button>
            <button className="btn" type="submit" disabled={uploading}>Save changes</button>
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
  const [uploading, setUploading] = useState(false);
  
  const addField = () => setImages([...images, ""]);
  const updateImg = (i, val) => setImages(prev => prev.map((v,idx)=> idx===i?val:v));
  
  const handleFileUpload = async (file, index) => {
    if (!file) return;
    
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post("/upload", formData, {
        headers: { ...auth.headers, 'Content-Type': 'multipart/form-data' }
      });
      
      // Use the filename from the response and construct the URL using BACKEND_URL
      const newImages = [...images];
      newImages[index] = response.data.filename; // Just store the filename, not the full URL
      setImages(newImages);
    } catch (err) {
      alert("Failed to upload image");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };
  
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
            <label className="label">Images (Upload files or enter URLs)</label>
            {images.map((url, i) => (
              <div key={i} style={{display:'grid', gap:8}}>
                <input 
                  className="input" 
                  placeholder={`Image ${i+1} - Enter URL or upload file below`} 
                  value={url} 
                  onChange={e=>updateImg(i, e.target.value)} 
                />
                <div style={{display:'flex', gap:8, alignItems:'center'}}>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => handleFileUpload(e.target.files[0], i)}
                    style={{flex:1}}
                  />
                  {uploading && <span>Uploading...</span>}
                </div>
              </div>
            ))}
            <button type="button" className="btn secondary" onClick={addField}>Add another image</button>
            <button className="btn" type="submit" disabled={!auth.isAuthed || uploading}>Save product</button>
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
      <h2 style={{ fontSize: '3rem', marginBottom: '1rem' }}>{title}</h2>
      {lead && <p className="lead">{lead}</p>}
      {images.length>0 && (
        <div className="gallery">
          {images.map((u,i)=>(<OptimizedImage className="reveal" key={i} src={u} alt={`${title} ${i+1}`} loading="lazy" />))}
        </div>
      )}
    </div>
  )
}

function Flatbeds(){
  const imgs=[
    `${BACKEND_URL}/uploads/migrated/image_e8dda930.jpg`,
    `${BACKEND_URL}/uploads/migrated/image_3f24da20.jpg`,
    `${BACKEND_URL}/uploads/migrated/image_fa261e90.jpg`,
    `${BACKEND_URL}/uploads/migrated/image_3398b663.jpg`,
    `${BACKEND_URL}/uploads/IMG_5178.jpg`,
    `${BACKEND_URL}/uploads/IMG_5180%20(1).jpg`,
  ];
  return (
    <Shell>
      <div className="section container reveal">
        <h2 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Flatbeds</h2>
        <p className="lead">Drive efficiently and securely with our flatbeds</p>
        
        {/* 3D Model Viewer - Floating above images */}
        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
          <Trailer3DViewer 
            key="flatbeds-3d"
            modelPath={`${BACKEND_URL}/uploads/1b6e11f42215726e1c34833c13101abe.glb`}
            width={500}
            height={250}
            zoom={5.0}
          />
        </div>
        
        <div className="gallery">
          {imgs.map((u,i)=>(<img className="reveal" key={i} src={u} alt={`Flatbed ${i+1}`} />))}
        </div>
      </div>
    </Shell>
  )
}
function DropDecks(){
  const imgs=[
    `${BACKEND_URL}/uploads/migrated/image_65c884e6.jpg`,
    `${BACKEND_URL}/uploads/IMG_4800-1.webp`, // Second image
    `${BACKEND_URL}/uploads/migrated/image_542c7abf.jpg`,
    `${BACKEND_URL}/uploads/migrated/image_abdea658.jpg`,
    `${BACKEND_URL}/uploads/migrated/image_09c5bb7b.jpg`,
    `${BACKEND_URL}/uploads/IMG_4362 (1).webp`,
    `${BACKEND_URL}/uploads/IMG_4093.webp`, // Next to current second last
    // Added to the end
    `${BACKEND_URL}/uploads/IMG_4365.webp`,
    `${BACKEND_URL}/uploads/IMG_2053.webp`,
    `${BACKEND_URL}/uploads/IMG_2059.webp`,
  ];
  return (
    <Shell>
      <div className="section container reveal">
        <h2 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Drop Decks</h2>
        <p className="lead">High-performance drop decks for easy loading and maximum stability</p>
        
        {/* 3D Model Viewer - Floating above images */}
        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
          <Trailer3DViewer 
            key="dropdecks-3d"
            modelPath={`${BACKEND_URL}/uploads/dropdeck3d.glb`}
            width={500}
            height={250}
            zoom={5.0}
          />
        </div>
        
        <div className="gallery">
          {imgs.map((u,i)=>(<img className="reveal" key={i} src={u} alt={`Drop Deck ${i+1}`} />))}
        </div>
      </div>
    </Shell>
  )
}
function TruckDecks(){
  const imgs=[
    `${BACKEND_URL}/uploads/migrated/image_ca15d79b.jpg`,
    `${BACKEND_URL}/uploads/migrated/image_93076e07.jpg`,
    `${BACKEND_URL}/uploads/migrated/image_f9c4cf8a.jpg`,
  ];
  return (
    <Shell>
      <div className="section container reveal">
        <h2 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Truck Decks</h2>
        <p className="lead">Truck decks designed for heavy-duty hauling and seamless integration</p>
        
        {/* 3D Model Viewer - Floating above images */}
        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
          <Trailer3DViewer 
            key="truckdecks-3d"
            modelPath={`${BACKEND_URL}/uploads/2b562ac159eb3c6a12abc4e72e677896.glb`}
            width={500}
            height={250}
            zoom={3.5}
          />
        </div>
        
        <div className="gallery">
          {imgs.map((u,i)=>(<img className="reveal" key={i} src={u} alt={`Truck Deck ${i+1}`} />))}
        </div>
      </div>
    </Shell>
  )
}
function ControlVans(){
  const imgs=[
    `${BACKEND_URL}/uploads/migrated/image_2764764d.jpg`,
    `${BACKEND_URL}/uploads/migrated/image_870a08df.jpg`,
    `${BACKEND_URL}/uploads/migrated/image_5d8f4c9a.jpg`,
    // Your new control van images
    `${BACKEND_URL}/uploads/IMG_1384-2-rotated.webp`,
    `${BACKEND_URL}/uploads/IMG_1385-1.webp`, 
    `${BACKEND_URL}/uploads/IMG_1387-1-rotated.webp`,
    `${BACKEND_URL}/uploads/IMG_5134.webp`,
  ];
  return (
    <Shell>
      <div className="section container reveal">
        <h2 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Control Vans</h2>
        <p className="lead">Control vans equipped for optimal operation and versatility</p>
        
        {/* 3D Model Viewer - Floating above images */}
        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
          <Trailer3DViewer 
            key="controlvans-3d"
            modelPath={`${BACKEND_URL}/uploads/controlvan3d2.glb`}
            width={500}
            height={250}
            zoom={5.0}
          />
        </div>
        
        <div className="gallery">
          {imgs.map((u,i)=>(<img className="reveal" key={i} src={u} alt={`Control Van ${i+1}`} />))}
        </div>
      </div>
    </Shell>
  )
}
function CustomBuilds(){
  const imgs=[
    `${BACKEND_URL}/uploads/migrated/image_ca614615.jpg`,
    `${BACKEND_URL}/uploads/migrated/image_c139a87c.jpg`,
    `${BACKEND_URL}/uploads/migrated/image_71620a45.jpg`,
    `${BACKEND_URL}/uploads/migrated/image_b654c362.jpg`,
    `${BACKEND_URL}/uploads/migrated/image_f2f89d30.jpg`,
    `${BACKEND_URL}/uploads/migrated/image_adc1ada8.jpg`,
    `${BACKEND_URL}/uploads/migrated/image_37e620b6.jpg`,
    // Your new custom build images
    `${BACKEND_URL}/uploads/IMG_2400.webp`,
    `${BACKEND_URL}/uploads/IMG_2406.webp`,
    `${BACKEND_URL}/uploads/IMG_4868 (1).webp`,
    `${BACKEND_URL}/uploads/IMG_4873.webp`,
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
      {/* Hero Section with Video */}
      <section className="hero" style={{
        minHeight: '70vh',
        padding: '120px 0 80px 0',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* Background Video */}
        <OptimizedVideo
          autoPlay
          muted
          loop
          playsInline
          preload="metadata" // Only load metadata, not the full video
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 1
          }}
          src={`${BACKEND_URL}/uploads/Flatbed_Company_Cinematic_Ad.mp4`}
        />
        
        {/* Dark overlay for better text readability */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(15,20,26,0.8) 0%, rgba(15,20,26,0.6) 50%, rgba(15,20,26,0.4) 100%)',
          zIndex: 2
        }} />
        
        {/* Hero Content */}
        <div className="container" style={{position: 'relative', zIndex: 3, textAlign: 'center'}}>
          <div className="reveal" style={{maxWidth: 800, margin: '0 auto'}}>
            <h1 style={{fontSize: '3.5rem', lineHeight: '1.2', marginBottom: '2rem', color: '#fff'}}>
              Serving Canadians Since 2020
            </h1>
            <p style={{fontSize: '1.3rem', color: 'rgba(255,255,255,0.9)', marginBottom: '2rem'}}>
              Founded in 2020, Phoenix Manufacturing is a proudly Canadian-owned company stemming from RPM Truck & Trailer Repair (est. 1991). We design and build specialized trailer solutions with craftsmanship and customer focus.
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <div className="section container reveal">
        <img className="reveal" style={{width:'100%', borderRadius:12, marginTop:12}} src={`${BACKEND_URL}/uploads/migrated/image_1127fa83.jpg`} alt="Shop"/>
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
        <h2 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Contact Us</h2>
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
          <h2 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Our Dealers</h2>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>
          <div className="form reveal">
            <h3>Calgary</h3>
            <p className="lead">Phoenix Equipment Sales Ltd. – 6633 86 Ave SE, Calgary AB</p>
            <p>Email: <a href="mailto:seanm@rpmtrailer.ca">seanm@rpmtrailer.ca</a> | Phone: (403) 837-1322</p>
            <img className="reveal" style={{width:'100%', borderRadius:12, marginTop:8}} src={`${BACKEND_URL}/uploads/migrated/image_21dc215b.jpg`} alt="Calgary map"/>
          </div>
          <div className="form reveal">
            <h3>Rocky View</h3>
            <p className="lead">RPM Trailer Repair Services Lt. — 28515 Kleysen Way, Rocky View, AB, T1X 0K1</p>
            <p>Email: <a href="mailto:paulm@rpmtrailer.ca">paulm@rpmtrailer.ca</a> | Phone: (403) 819-5516</p>
            <img className="reveal" style={{width:'100%', borderRadius:12, marginTop:8}} src={`${BACKEND_URL}/uploads/migrated/image_e4ba49c3.jpg`} alt="Rocky View"/>
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