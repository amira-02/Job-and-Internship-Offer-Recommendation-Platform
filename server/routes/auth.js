const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// ... existing code ...

// Route de déconnexion
router.post('/logout', (req, res) => {
  // Supprimer le cookie JWT avec toutes les options possibles
  res.clearCookie('jwt', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    domain: 'localhost',
    expires: new Date(0)
  });

  // Supprimer le cookie de session avec toutes les options possibles
  res.clearCookie('JSESSIONID', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    domain: 'localhost',
    expires: new Date(0)
  });

  // Envoyer une réponse avec des en-têtes pour forcer la suppression des cookies
  res.setHeader('Clear-Site-Data', '"cookies", "storage"');
  res.status(200).json({ message: 'Déconnexion réussie' });
});

module.exports = router; 