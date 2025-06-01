import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import Header from '../components/Header';
import '../styles/Home.css';
import '../styles/CommentsSection.css';
import heroImage from '../assets/images/3d-illustration-man-with-megaphone-his-hand-removebg-preview.png';

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

      const scrollPosition = window.scrollY;
      const transitionRange = 800;
      const opacity = Math.min(1, scrollPosition / transitionRange);
      document.body.style.setProperty('--second-bg-opacity', opacity);
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
          <div className="hero-text">
            <h5 className="hero-title">
            Find Your Perfect Job or Internship
            </h5>
          <p className="hero-subtitle">
            Discover personalized job and internship recommendations based on your skills, interests, and career goals.
          </p>
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
          <div className="hero-image">
            <img 
              src={heroImage}
              alt="Career opportunities illustration" 
              className="hero-illustration"
            />
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="workflow-section">
        <div className="workflow-container">
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">
            Follow these simple steps to find your perfect job or internship opportunity
          </p>
          
          <div className="timeline">

            <div className="timeline-item left reveal">
              <div className="timeline-content">
                <div className="step-icon">📝</div>
                <h3 className="step-title">Create Your Profile</h3>
                <p className="step-description">
                  Sign up and create your professional profile. Add your skills, experience, and career goals to help us understand your preferences.
                </p>
              </div>
            </div>

            <div className="timeline-item right reveal">
              <div className="timeline-content">
                <div className="step-icon">📄</div>
                <h3 className="step-title">Upload Your CV</h3>
                <p className="step-description">
                  Upload your CV or resume. Our system will analyze your qualifications and experience to better understand your profile.
                </p>
              </div>
            </div>

            <div className="timeline-item left reveal">
              <div className="timeline-content">
                <div className="step-icon">🎯</div>
                <h3 className="step-title">Get Personalized Recommendations</h3>
                <p className="step-description">
                  Receive tailored job and internship recommendations that match your skills, experience, and career aspirations.
                </p>
              </div>
            </div>

            <div className="timeline-item right reveal">
              <div className="timeline-content">
                <div className="step-icon">💼</div>
                <h3 className="step-title">Apply to Opportunities</h3>
                <p className="step-description">
                  Browse through your personalized recommendations and apply directly to the opportunities that interest you.
                </p>
              </div>
            </div>

          </div>

          <div className="workflow-cta">
            <Link to="/register" className="workflow-button">
              Start Your Journey
            </Link>
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

      {/* Section Commentaires */}
      <section className="comments-section">
        <div className="comments-container">
          <div className="comments-content">
            <div className="comments-intro">
              <p className="comments-subtitle reveal">Leave a Comment</p>
              <h2 className="comments-title reveal">Share your thoughts with us.</h2>
              {/* Optional: Add some descriptive text here */}
            </div>
            <div className="comment-form-container">
               <h3 className="form-title">Send us a Message</h3> {/* Changed form title */} 
              <div className="comment-form">
                <div className="form-group">
                  <label htmlFor="fullName" className="comment-label">Full Name*</label>
                  <input type="text" id="fullName" className="form-input" placeholder="Enter your full name" />
                </div>
                 <div className="form-group">
                  <label htmlFor="emailAddress" className="comment-label">Email Address*</label>
                  <input type="email" id="emailAddress" className="form-input" placeholder="Enter your email address" />
                </div>
                 <div className="form-group">
                  <label htmlFor="comment-textarea" className="comment-label">Message*</label> {/* Label text changed */} 
                <textarea
                  id="comment-textarea" // Added ID for label association
                  className="comment-textarea form-input" // Added form-input class
                  placeholder="Type your message" // Changed placeholder text
                  rows="6" // Increased rows for a larger textarea
                ></textarea>
                 </div>
                <button className="comment-submit-button primary">Send Message</button> {/* Changed button text */} 
              </div>
               {/* Placeholder for comments list - will style later if needed */}
               {/* <div className="comments-list">
                <p className="no-comments">No comments yet. Be the first to leave one!</p>
              </div> */}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home; 