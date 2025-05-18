import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import '../styles/Header.css';

function Header() {
  const [cookies, setCookie, removeCookie] = useCookies(['jwt']);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const checkUserRole = async () => {
      if (cookies.jwt) {
        try {
          const response = await fetch("http://localhost:3000", {
            method: "POST",
            credentials: 'include',
          });
          const data = await response.json();
          
          if (data.status) {
            setIsAdmin(data.isAdmin);
          } else {
            setIsAdmin(false);
            removeCookie('jwt');
          }
        } catch (err) {
          console.error("Erreur de vérification du rôle:", err);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    };

    checkUserRole();
  }, [cookies.jwt, removeCookie]);

  const handleLogout = () => {
    removeCookie('jwt');
    setIsAdmin(false);
    navigate('/login');
  };

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="header-container">
        <Link to="/" className="logo">
          JobMatch
        </Link>

        <button 
          className={`menu-button ${isMenuOpen ? 'open' : ''}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <nav className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
          <Link to="/" className="nav-link" onClick={() => setIsMenuOpen(false)}>
            Home
          </Link>
          <Link to="/offers" className="nav-link" onClick={() => setIsMenuOpen(false)}>
            Offres
          </Link>
          <Link to="/about" className="nav-link" onClick={() => setIsMenuOpen(false)}>
            About Us
          </Link>
          {cookies.jwt ? (
            <>
              {isAdmin && (
                <Link to="/admin" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                  Admin Dashboard
                </Link>
              )}
              {!isAdmin && (
                <Link to="/cards" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                  Mes Recommandations
                </Link>
              )}
              <Link to="/profile" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                Profile
              </Link>
              <button onClick={handleLogout} className="nav-button logout">
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-button login" onClick={() => setIsMenuOpen(false)}>
                Sign In
              </Link>
              <Link to="/register" className="nav-button signup" onClick={() => setIsMenuOpen(false)}>
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header; 