import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { ToastContainer, toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import Header from "../components/Header";
import "../styles/Auth.css";
import axios from 'axios';

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cookies, setCookie] = useCookies(["jwt"]);
  const [showPassword, setShowPassword] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté
    const checkAuth = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/auth/check", {
          withCredentials: true,
        });
        
        if (response.data.status) {
          // Rediriger vers la page appropriée selon le rôle
          if (response.data.user.role === 'admin') {
            navigate("/admin");
          } else if (response.data.user.role === 'employer') {
             navigate("/employer/dashboard");
          } else if (response.data.user.role === 'candidate') {
             navigate("/profile");
          } else {
            navigate("/");
          }
        }
      } catch (err) {
        console.error("Erreur de vérification d'authentification:", err);
      }
    };

    checkAuth();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:3000/api/auth/login', 
        { email, password },
        { withCredentials: true }
      );

      const data = response.data;

      if (data.success) {
        toast.success("Connexion réussie !", {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });
        
        if (data.user.role === 'admin') {
          navigate('/admin');
        } else if (data.user.role === 'employer') {
          navigate('/employer/dashboard');
        } else if (data.user.role === 'candidate') {
          navigate('/profile');
        } else {
           navigate('/');
         }

      } else if (data.requiresVerification) {
         setError(data.message || 'Votre email n\'a pas été vérifié.');
         toast.warning(data.message || 'Votre email n\'a pas été vérifié.');
      }
      else {
        setError(data.message || 'Échec de la connexion.');
        toast.error(data.message || 'Échec de la connexion.');
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Une erreur est survenue lors de la connexion';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="auth-page">
      <Header />
      <motion.div 
        className="auth-container"
        initial="hidden"
        animate="visible"
        variants={cardVariants}
      >
        <div className="auth-card">
          <div className="auth-header">
            <motion.h1 
              className="auth-title"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Bienvenue
            </motion.h1>
            <motion.p 
              className="auth-subtitle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              Connectez-vous pour accéder à votre compte
            </motion.p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <motion.div 
              className="form-group"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
            >
              <label htmlFor="email" className="form-label">Email</label>
              <div className="input-wrapper">
                <input
                  type="email"
                  id="email"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Entrez votre email"
                  required
                  onFocus={() => setShowTooltip(true)}
                  onBlur={() => setShowTooltip(false)}
                />
                <AnimatePresence>
                  {showTooltip && (
                    <motion.span
                      className="tooltip"
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.2 }}
                    >
                      Entrez une adresse email valide.
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            <motion.div 
              className="form-group"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 }}
            >
              <label htmlFor="password" className="form-label">Mot de passe</label>
              <div className="input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Entrez votre mot de passe"
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
              transition={{ delay: 1.0 }}
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Connexion en cours...
                </>
              ) : (
                'Se connecter'
              )}
            </motion.button>
          </form>

          <motion.div 
            className="auth-footer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
          >
            Pas encore de compte ?{' '}
            <Link to="/register" className="auth-link">
              S'inscrire
            </Link>
          </motion.div>
        </div>
      </motion.div>
      <ToastContainer />
    </div>
  );
}

export default Login;
