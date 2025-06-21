// import React, { useState, useEffect } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { ToastContainer, toast } from 'react-toastify';
// import { motion } from 'framer-motion';
// import Header from '../components/Header';
// import { Form, Input, Button, Card, message, Radio, Select, Checkbox, Upload } from 'antd';
// import { MailOutlined, LockOutlined, UserOutlined, BankOutlined, UploadOutlined } from '@ant-design/icons';
// import '../styles/Employer.css';
// import axios from 'axios';

// const { Option } = Select;

// function Employer() {
//   const [formData, setFormData] = useState({
//     email: '',
//     password: '',
//     fullName: '',
//     companyName: '',
//     website: '',
//     phone: '',
//     location: '',
//     description: '',
//     agreement: false
//   });

//   const [verificationCode, setVerificationCode] = useState('');
//   const [showVerificationModal, setShowVerificationModal] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const navigate = useNavigate();

//   useEffect(() => {
//     console.log('Employer component mounted');
//   }, []);

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: type === 'checkbox' ? checked : value
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');

//     try {
//       const response = await axios.post('http://localhost:3000/api/employer/register', formData);

//       if (response.data.success) {
//         toast.success('Inscription réussie ! Veuillez vérifier votre email.');
//         setShowVerificationModal(true);
//       } else {
//         setError(response.data.message || 'Échec de l\'inscription');
//         toast.error(response.data.message || 'Échec de l\'inscription');
//       }
//     } catch (err) {
//       console.error('Registration error:', err);
//       setError(err.response?.data?.message || 'Une erreur est survenue lors de l\'inscription.');
//       toast.error(err.response?.data?.message || 'Une erreur est survenue lors de l\'inscription.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleVerification = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');

//     try {
//       const response = await axios.post('http://localhost:3000/api/employer/verify-email', {
//         token: verificationCode,
//         email: formData.email
//       });

//       if (response.data.success) {
//         toast.success('Email vérifié avec succès ! Redirection vers la connexion...');
//         setTimeout(() => {
//           navigate('/login');
//         }, 1500);
//       } else {
//         setError(response.data.message || 'Échec de la vérification de l\'email.');
//         toast.error(response.data.message || 'Échec de la vérification de l\'email.');
//       }
//     } catch (err) {
//       console.error('Verification error:', err);
//       toast.error(err.response?.data?.message || 'Erreur lors de la vérification.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Dummy upload function for Ant Design Upload component
//   const dummyRequest = ({ file, onSuccess }) => {
//     setTimeout(() => {
//       onSuccess("ok");
//     }, 0);
//   };

//   return (
//     <div className="auth-page">
//       <Header />
//       <div className="auth-container">
//         <motion.div 
//           className="auth-card"
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6 }}
//         >
//           <div className="auth-header">
//             <motion.h1 
//               className="auth-title"
//               initial={{ opacity: 0, y: -20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.4 }}
//             >
//               Inscription Employeur
//             </motion.h1>
//             <motion.p 
//               className="auth-subtitle"
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ delay: 0.6 }}
//             >
//               Créez votre compte employeur
//             </motion.p>
//           </div>

//           {!showVerificationModal ? (
//             <form onSubmit={handleSubmit} className="auth-form">
//               <motion.div 
//                 className="form-group"
//                 initial={{ opacity: 0, x: -20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ delay: 0.8 }}
//               >
//                 <label htmlFor="email" className="form-label">Email</label>
//                 <input
//                   type="email"
//                   id="email"
//                   name="email"
//                   className="form-input"
//                   value={formData.email}
//                   onChange={handleChange}
//                   required
//                 />
//               </motion.div>

//               <motion.div 
//                 className="form-group"
//                 initial={{ opacity: 0, x: -20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ delay: 0.9 }}
//               >
//                 <label htmlFor="password" className="form-label">Mot de passe</label>
//                 <input
//                   type="password"
//                   id="password"
//                   name="password"
//                   className="form-input"
//                   value={formData.password}
//                   onChange={handleChange}
//                   required
//                 />
//               </motion.div>

//               <motion.div 
//                 className="form-group"
//                 initial={{ opacity: 0, x: -20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ delay: 1 }}
//               >
//                 <label htmlFor="fullName" className="form-label">Nom complet</label>
//                 <input
//                   type="text"
//                   id="fullName"
//                   name="fullName"
//                   className="form-input"
//                   value={formData.fullName}
//                   onChange={handleChange}
//                   required
//                 />
//               </motion.div>

//               <motion.div 
//                 className="form-group"
//                 initial={{ opacity: 0, x: -20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ delay: 1.1 }}
//               >
//                 <label htmlFor="companyName" className="form-label">Nom de l'entreprise</label>
//                 <input
//                   type="text"
//                   id="companyName"
//                   name="companyName"
//                   className="form-input"
//                   value={formData.companyName}
//                   onChange={handleChange}
//                   required
//                 />
//               </motion.div>

//               <motion.div 
//                 className="form-group"
//                 initial={{ opacity: 0, x: -20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ delay: 1.2 }}
//               >
//                 <label htmlFor="website" className="form-label">Site web</label>
//                 <input
//                   type="url"
//                   id="website"
//                   name="website"
//                   className="form-input"
//                   value={formData.website}
//                   onChange={handleChange}
//                 />
//               </motion.div>

//               <motion.div 
//                 className="form-group"
//                 initial={{ opacity: 0, x: -20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ delay: 1.3 }}
//               >
//                 <label htmlFor="phone" className="form-label">Téléphone</label>
//                 <input
//                   type="tel"
//                   id="phone"
//                   name="phone"
//                   className="form-input"
//                   value={formData.phone}
//                   onChange={handleChange}
//                   required
//                 />
//               </motion.div>

//               <motion.div 
//                 className="form-group"
//                 initial={{ opacity: 0, x: -20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ delay: 1.4 }}
//               >
//                 <label htmlFor="location" className="form-label">Adresse</label>
//                 <input
//                   type="text"
//                   id="location"
//                   name="location"
//                   className="form-input"
//                   value={formData.location}
//                   onChange={handleChange}
//                   required
//                 />
//               </motion.div>

//               <motion.div 
//                 className="form-group"
//                 initial={{ opacity: 0, x: -20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ delay: 1.5 }}
//               >
//                 <label htmlFor="description" className="form-label">Description</label>
//                 <textarea
//                   id="description"
//                   name="description"
//                   className="form-input"
//                   value={formData.description}
//                   onChange={handleChange}
//                   rows="4"
//                 />
//               </motion.div>

//               <motion.div 
//                 className="form-group checkbox-group"
//                 initial={{ opacity: 0, x: -20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ delay: 1.6 }}
//               >
//                 <input
//                   type="checkbox"
//                   id="agreement"
//                   name="agreement"
//                   checked={formData.agreement}
//                   onChange={handleChange}
//                   required
//                 />
//                 <label htmlFor="agreement" className="checkbox-label">
//                   J'accepte les conditions d'utilisation
//                 </label>
//               </motion.div>

//               <motion.button
//                 type="submit"
//                 className="auth-button"
//                 disabled={loading}
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: 1.7 }}
//               >
//                 {loading ? 'Inscription en cours...' : 'S\'inscrire'}
//               </motion.button>
//             </form>
//           ) : (
//             <form onSubmit={handleVerification} className="auth-form">
//               <motion.div 
//                 className="form-group"
//                 initial={{ opacity: 0, x: -20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ delay: 0.8 }}
//               >
//                 <label htmlFor="verificationCode" className="form-label">Code de vérification</label>
//                 <input
//                   type="text"
//                   id="verificationCode"
//                   className="form-input"
//                   value={verificationCode}
//                   onChange={(e) => setVerificationCode(e.target.value)}
//                   placeholder="Entrez le code à 6 chiffres"
//                   required
//                   maxLength={6}
//                   pattern="[0-9]{6}"
//                 />
//               </motion.div>

//               <motion.button
//                 type="submit"
//                 className="auth-button"
//                 disabled={loading}
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: 1 }}
//               >
//                 {loading ? 'Vérification en cours...' : 'Vérifier'}
//               </motion.button>
//             </form>
//           )}

//           {error && (
//             <motion.div 
//               className="auth-error"
//               initial={{ opacity: 0, scale: 0.9 }}
//               animate={{ opacity: 1, scale: 1 }}
//               exit={{ opacity: 0, scale: 0.9 }}
//             >
//               {error}
//             </motion.div>
//           )}

//           <motion.div
//             className="auth-footer"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ delay: 1.8 }}
//           >
//             <p>Déjà inscrit ? <Link to="/login" className="auth-link">Se connecter</Link></p>
//           </motion.div>
//         </motion.div>
//       </div>
//       <ToastContainer />
//     </div>
//   );
// }

// export default Employer; 