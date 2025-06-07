import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import '../styles/Auth.css';
import axios from 'axios';

const VerifyEmail = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    } else {
      setError('Token de vérification manquant');
      toast.error('Token de vérification manquant');
    }
  }, [token]);

  const verifyEmail = async (verificationToken) => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:3001/api/auth/verify-email', {
        token: verificationToken
      });

      if (response.data.success) {
        toast.success('Email vérifié avec succès ! Redirection vers la connexion...');
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else {
        setError(response.data.message || 'Échec de la vérification de l\'email.');
        toast.error(response.data.message || 'Échec de la vérification de l\'email.');
      }
    } catch (err) {
      console.error('Email verification error:', err);
      setError(err.response?.data?.message || 'Une erreur est survenue lors de la vérification.');
      toast.error(err.response?.data?.message || 'Une erreur est survenue lors de la vérification.');
    } finally {
      setLoading(false);
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
          style={{ maxWidth: '500px' }}
        >
          <div className="auth-header">
            <motion.h1 
              className="auth-title"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Vérification de votre email
            </motion.h1>
            <motion.p 
              className="auth-subtitle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {loading ? 'Vérification en cours...' : 'Veuillez patienter pendant la vérification de votre email.'}
            </motion.p>
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

          {!loading && error && (
            <motion.div
              className="auth-footer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              <Link to="/login" className="auth-link">
                Retour à la connexion
              </Link>
            </motion.div>
          )}
        </motion.div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default VerifyEmail; 