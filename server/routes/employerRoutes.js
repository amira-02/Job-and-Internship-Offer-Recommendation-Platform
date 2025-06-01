const express = require('express');
const router = express.Router();
const employerController = require('../controllers/employerController');

// Route d'inscription employeur
router.post('/register', employerController.registerEmployer);

// Route de connexion employeur
router.post('/login', employerController.loginEmployer);

module.exports = router; 