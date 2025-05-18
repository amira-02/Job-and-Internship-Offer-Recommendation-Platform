const express = require('express');
const router = express.Router();
const { register, login, checkUser, getUserCV, getUserProfile } = require('../controllers/authControllers');
const upload = require('../middleware/uploadMiddleware');
const { requireAuth } = require('../middleware/authMiddleware');

// Registration route with file upload
router.post('/register', upload.single('cv'), register);

// Route pour récupérer le CV
router.get('/cv/:userId', getUserCV);

// Other routes remain unchanged
router.post('/login', login);
router.get('/check', checkUser);

// Nouvelle route pour le profil (protégée par l'authentification)
router.get('/profile', requireAuth, getUserProfile);

module.exports = router;