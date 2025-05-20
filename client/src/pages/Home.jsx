import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import Header from '../components/Header';
import '../styles/Home.css';

const Home = () => {
  const [cookies] = useCookies(['jwt']);

  useEffect(() => {
    const handleScroll = () => {
      const reveals = document.querySelectorAll('.reveal');
      
      reveals.forEach(element => {
        const windowHeight = window.innerHeight;
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < windowHeight - elementVisible) {
          element.classList.add('active');
        }
      });
    };

    const addRevealClass = () => {
      const elements = document.querySelectorAll('.feature-card, .section-title, .section-subtitle, .hero-icons');
      elements.forEach(element => {
        element.classList.add('reveal');
      });
    };

    addRevealClass();
    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="home">
      <Header />
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Find Your Perfect Job or Internship
          </h1>
          <p className="hero-subtitle">
            Discover personalized job and internship recommendations based on your skills, interests, and career goals.
          </p>
          <div className="hero-icons">
            <div className="hero-icon-circle"><img src="/path/to/icon1.png" alt="Icon 1" /></div>
            <div className="hero-icon-circle"><img src="/path/to/icon2.png" alt="Icon 2" /></div>
            <div className="hero-icon-circle"><img src="/path/to/icon3.png" alt="Icon 3" /></div>
            <div className="hero-icon-circle"><img src="/path/to/icon4.png" alt="Icon 4" /></div>
            <div className="hero-icon-circle"><img src="/path/to/icon5.png" alt="Icon 5" /></div>
          </div>
          <div className="hero-buttons">
            {!cookies.jwt ? (
              <>
                <Link to="/login" className="hero-button primary">
                  Get Started
                </Link>
                <Link to="/register" className="hero-button secondary">
                  Create Account
                </Link>
              </>
            ) : (
              <Link to="/cards" className="hero-button primary">
                View Recommendations
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="features">
        <div className="features-container">
          <h2 className="section-title">Why Choose Us</h2>
          <p className="section-subtitle">
            Our platform offers unique features to help you find the perfect opportunity
          </p>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3 className="feature-title">Personalized Recommendations</h3>
              <p className="feature-description">
                Get job and internship suggestions tailored to your skills, experience, and career aspirations.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3 className="feature-title">Smart Matching</h3>
              <p className="feature-description">
                Our advanced algorithm analyzes your profile to find the best opportunities that match your qualifications.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🚀</div>
              <h3 className="feature-title">Career Growth</h3>
              <p className="feature-description">
                Discover opportunities that align with your long-term career goals and help you grow professionally.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 