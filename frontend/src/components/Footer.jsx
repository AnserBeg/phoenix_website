import { MapPin, Phone, Mail, Truck, Factory, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer style={{
      backgroundColor: '#1a1a1a',
      color: '#ffffff',
      padding: '60px 0 30px 0',
      marginTop: '80px'
    }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '40px',
          marginBottom: '40px'
        }}>
          
          {/* Company Info */}
          <div>
            <h3 style={{ 
              color: '#ff6a00', 
              fontSize: '1.5rem', 
              marginBottom: '20px',
              fontWeight: '600'
            }}>
              Phoenix Trailers
            </h3>
            <p style={{ 
              color: '#cccccc', 
              lineHeight: '1.6', 
              marginBottom: '20px',
              fontSize: '0.95rem'
            }}>
              Proudly Canadian-owned company designing and building specialized trailer solutions 
              with craftsmanship and customer focus since 2020.
            </p>
            <div style={{ display: 'flex', gap: '15px' }}>
              <div style={{ 
                backgroundColor: '#ff6a00', 
                padding: '8px', 
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ShieldCheck size={20} color="white" />
              </div>
              <div style={{ 
                backgroundColor: '#ff6a00', 
                padding: '8px', 
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Factory size={20} color="white" />
              </div>
              <div style={{ 
                backgroundColor: '#ff6a00', 
                padding: '8px', 
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Truck size={20} color="white" />
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ 
              color: '#ffffff', 
              fontSize: '1.2rem', 
              marginBottom: '20px',
              fontWeight: '600'
            }}>
              Quick Links
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Link to="/flatbeds" style={{ 
                color: '#cccccc', 
                textDecoration: 'none',
                transition: 'color 0.2s',
                fontSize: '0.95rem'
              }} onMouseEnter={(e) => e.target.style.color = '#ff6a00'} onMouseLeave={(e) => e.target.style.color = '#cccccc'}>
                Flatbeds
              </Link>
              <Link to="/drop-decks" style={{ 
                color: '#cccccc', 
                textDecoration: 'none',
                transition: 'color 0.2s',
                fontSize: '0.95rem'
              }} onMouseEnter={(e) => e.target.style.color = '#ff6a00'} onMouseLeave={(e) => e.target.style.color = '#cccccc'}>
                Drop Decks
              </Link>
              <Link to="/truck-decks" style={{ 
                color: '#cccccc', 
                textDecoration: 'none',
                transition: 'color 0.2s',
                fontSize: '0.95rem'
              }} onMouseEnter={(e) => e.target.style.color = '#ff6a00'} onMouseLeave={(e) => e.target.style.color = '#cccccc'}>
                Truck Decks
              </Link>
              <Link to="/control-vans" style={{ 
                color: '#cccccc', 
                textDecoration: 'none',
                transition: 'color 0.2s',
                fontSize: '0.95rem'
              }} onMouseEnter={(e) => e.target.style.color = '#ff6a00'} onMouseLeave={(e) => e.target.style.color = '#cccccc'}>
                Control Vans
              </Link>
              <Link to="/custom" style={{ 
                color: '#cccccc', 
                textDecoration: 'none',
                transition: 'color 0.2s',
                fontSize: '0.95rem'
              }} onMouseEnter={(e) => e.target.style.color = '#ff6a00'} onMouseLeave={(e) => e.target.style.color = '#cccccc'}>
                Custom Builds
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h4 style={{ 
              color: '#ffffff', 
              fontSize: '1.2rem', 
              marginBottom: '20px',
              fontWeight: '600'
            }}>
              Contact Info
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <MapPin size={18} color="#ff6a00" />
                <span style={{ color: '#cccccc', fontSize: '0.95rem' }}>
                  6633 86 Ave SE, Calgary AB
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Phone size={18} color="#ff6a00" />
                <span style={{ color: '#cccccc', fontSize: '0.95rem' }}>
                  (403) 837-1322
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Mail size={18} color="#ff6a00" />
                <span style={{ color: '#cccccc', fontSize: '0.95rem' }}>
                  seanm@rpmtrailer.ca
                </span>
              </div>
            </div>
            <div style={{ marginTop: '20px' }}>
              <h5 style={{ 
                color: '#ffffff', 
                fontSize: '1rem', 
                marginBottom: '10px',
                fontWeight: '600'
              }}>
                Hours
              </h5>
              <p style={{ color: '#cccccc', fontSize: '0.95rem' }}>
                Mon–Fri 9:00AM – 5:00PM
              </p>
            </div>
          </div>

          {/* Map */}
          <div>
            <h4 style={{ 
              color: '#ffffff', 
              fontSize: '1.2rem', 
              marginBottom: '20px',
              fontWeight: '600'
            }}>
              Our Location
            </h4>
            <div style={{
              width: '100%',
              height: '200px',
              borderRadius: '8px',
              overflow: 'hidden',
              border: '2px solid #333'
            }}>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2507.1234567890123!2d-114.12345678901234!3d50.12345678901234!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNTDCsDA3JzM0LjQiTiAxMTTCsDA3JzM0LjQiVw!5e0!3m2!1sen!2sca!4v1234567890123"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Phoenix Trailers Location"
              ></iframe>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div style={{
          borderTop: '1px solid #333',
          paddingTop: '30px',
          textAlign: 'center'
        }}>
          <p style={{ 
            color: '#888888', 
            fontSize: '0.9rem',
            marginBottom: '15px'
          }}>
            © 2024 Phoenix Trailers. All rights reserved.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '30px' }}>
            <Link to="/about" style={{ 
              color: '#888888', 
              textDecoration: 'none',
              fontSize: '0.9rem',
              transition: 'color 0.2s'
            }} onMouseEnter={(e) => e.target.style.color = '#ff6a00'} onMouseLeave={(e) => e.target.style.color = '#888888'}>
              About Us
            </Link>
            <Link to="/contact" style={{ 
              color: '#888888', 
              textDecoration: 'none',
              fontSize: '0.9rem',
              transition: 'color 0.2s'
            }} onMouseEnter={(e) => e.target.style.color = '#ff6a00'} onMouseLeave={(e) => e.target.style.color = '#888888'}>
              Contact
            </Link>
            <Link to="/dealers" style={{ 
              color: '#888888', 
              textDecoration: 'none',
              fontSize: '0.9rem',
              transition: 'color 0.2s'
            }} onMouseEnter={(e) => e.target.style.color = '#ff6a00'} onMouseLeave={(e) => e.target.style.color = '#888888'}>
              Dealers
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
