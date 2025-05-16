import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import '../styles/Header.css';

function Header() {
  const [cookies, setCookie, removeCookie] = useCookies(['jwt']);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    removeCookie('jwt');
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
          <Link to="/about" className="nav-link" onClick={() => setIsMenuOpen(false)}>
            About Us
          </Link>
          {cookies.jwt ? (
            <>
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