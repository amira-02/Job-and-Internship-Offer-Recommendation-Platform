const express = require('express');
const router = express.Router();
const { register, verifyEmail, updateProfile } = require('../controllers/employerControllers');
const auth = require('../middleware/auth');

// Routes publiques
router.post('/register', register);
router.post('/verify-email', verifyEmail);

// Routes protégées
router.use(auth); // Middleware d'authentification pour toutes les routes suivantes

// Routes spécifiques aux employeurs
router.put('/profile', updateProfile); // Ajout de la route pour mettre à jour le profil

// Ajoutez ici les autres routes protégées pour les employeurs
// Par exemple :
// router.get('/profile', getProfile);
// router.put('/profile', updateProfile);
// etc.

module.exports = router; 