const express = require('express');
const router = express.Router();
const employerController = require('../controllers/employerController');
const auth = require('../middleware/auth');

// Route d'inscription employeur
router.post('/register', employerController.registerEmployer);

// Route de connexion employeur
router.post('/login', employerController.loginEmployer);

// Route de mise à jour du profil employeur
router.put('/profile', auth, employerController.updateEmployerProfile);

module.exports = router; 