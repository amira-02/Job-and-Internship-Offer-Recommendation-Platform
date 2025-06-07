import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import { ToastContainer, toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../components/Header';
import '../styles/Auth.css';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    email: '',
    password: '',
    confirmPassword: '',
    governorate: '',
    city: '',
    postalCode: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cookies, setCookie] = useCookies(['jwt']);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationLoading, setVerificationLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/auth/check", {
          withCredentials: true,
        });
        
        if (response.data.status) {
            navigate("/");
        }
      } catch (err) {
        console.error("Erreur de vérification d'authentification:", err);
      }
    };

    checkAuth();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('http://localhost:3000/api/auth/register', formData);

      const data = response.data;

      if (data.success) {
        toast.success('Inscription réussie ! Veuillez vérifier votre email.');
        setShowVerificationModal(true);
      } else {
        setError(data.message || 'Échec de l\'inscription');
        toast.error(data.message || 'Échec de l\'inscription');
      }
    } catch (err) {
      console.error('Erreur d\'inscription:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Une erreur est survenue lors de l\'inscription';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (e) => {
    e.preventDefault();
    setVerificationLoading(true);

    try {
      const response = await axios.post('http://localhost:3000/api/auth/verify-email', {
        token: verificationCode,
        email: formData.email
      });

      if (response.data.success) {
        toast.success('Email vérifié avec succès ! Redirection vers la connexion...');
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else {
        toast.error(response.data.message || 'Code de vérification invalide.');
      }
    } catch (err) {
      console.error('Verification error:', err);
      toast.error(err.response?.data?.message || 'Erreur lors de la vérification.');
    } finally {
      setVerificationLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Header />
      <div className="auth-container">
        <motion.div 
          className="auth-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="auth-header">
            <motion.h1 
              className="auth-title"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Créer un compte
            </motion.h1>
            <motion.p 
              className="auth-subtitle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              Rejoignez notre communauté
            </motion.p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-grid">
            <motion.div 
              className="form-group"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
                <label htmlFor="firstName" className="form-label">Prénom *</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  className="form-input"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Entrez votre prénom"
                  required
                />
              </motion.div>

              <motion.div 
                className="form-group"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
              >
                <label htmlFor="email" className="form-label">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-input"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Entrez votre email"
                  required
                />
            </motion.div>

            <motion.div 
              className="form-group"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
            >
                <label htmlFor="password" className="form-label">Mot de passe *</label>
              <div className="input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                    name="password"
                  className="form-input"
                    value={formData.password}
                    onChange={handleChange}
                  placeholder="Créez votre mot de passe"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </motion.div>

            <motion.div 
              className="form-group"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 }}
            >
                <label htmlFor="confirmPassword" className="form-label">Confirmer le mot de passe *</label>
              <div className="input-wrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                    name="confirmPassword"
                  className="form-input"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  placeholder="Confirmez votre mot de passe"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </motion.div>

              <motion.div 
                className="form-group"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.0 }}
              >
                <label htmlFor="governorate" className="form-label">Gouvernorat *</label>
                <input
                  type="text"
                  id="governorate"
                  name="governorate"
                  className="form-input"
                  value={formData.governorate}
                  onChange={handleChange}
                  placeholder="Entrez votre gouvernorat"
                  required
                />
              </motion.div>

              <motion.div 
                className="form-group"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.1 }}
              >
                <label htmlFor="city" className="form-label">Ville</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  className="form-input"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Entrez votre ville"
                />
              </motion.div>

              <motion.div 
                className="form-group"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2 }}
              >
                <label htmlFor="postalCode" className="form-label">Code postal</label>
                <input
                  type="text"
                  id="postalCode"
                  name="postalCode"
                  className="form-input"
                  value={formData.postalCode}
                  onChange={handleChange}
                  placeholder="Entrez votre code postal"
                />
              </motion.div>

              <motion.div 
                className="form-group"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.3 }}
              >
                <label htmlFor="address" className="form-label">Adresse</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  className="form-input"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Entrez votre adresse"
                />
              </motion.div>
            </div>

            {error && (
              <motion.div 
                className="auth-error"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                {error}
              </motion.div>
            )}

            <motion.button 
              type="submit" 
              className="auth-button"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 }}
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Inscription en cours...
                </>
              ) : (
                'S\'inscrire'
              )}
            </motion.button>
          </form>

          <motion.div 
            className="auth-footer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            Déjà un compte ?{" "}
            <Link to="/login" className="auth-link">
              Se connecter
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Modal de vérification */}
      {showVerificationModal && (
        <div className="modal-overlay">
          <motion.div 
            className="modal-content"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <h2>Vérification de l'email</h2>
            <p>Un code de vérification a été envoyé à votre email.</p>
            <form onSubmit={handleVerification}>
              <div className="form-group">
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Entrez le code de vérification"
                  required
                />
              </div>
              <button 
                type="submit" 
                className="auth-button"
                disabled={verificationLoading}
              >
                {verificationLoading ? 'Vérification...' : 'Vérifier'}
              </button>
            </form>
          </motion.div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default Register;