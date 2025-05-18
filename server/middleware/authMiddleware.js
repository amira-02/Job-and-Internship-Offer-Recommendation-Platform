const jwt = require('jsonwebtoken');
const User = require('../model/authModel');

const requireAuth = (req, res, next) => {
  const token = req.cookies.jwt;

  // check json web token exists & is verified
  if (token) {
    jwt.verify(token, 'kishan sheth super secret key', async (err, decodedToken) => {
      if (err) {
        console.log(err.message);
        // Si l'authentification échoue, rediriger vers la page de connexion
        // Note: En API, on renvoie plutôt un statut 401 ou 403
        // Ici, comme c'est un middleware pour potentiellement des routes frontend/backend,
        // je vais renvoyer un statut d'erreur.
        res.status(401).json({ message: 'Non autorisé' });
      } else {
        console.log(decodedToken);
        // Attacher l'utilisateur (ou au moins son ID) à la requête
        req.user = { id: decodedToken.id };
        next();
      }
    });
  } else {
    // Si pas de token, renvoyer un statut non autorisé
    res.status(401).json({ message: 'Non autorisé, token manquant' });
  }
};

module.exports = { requireAuth }; 