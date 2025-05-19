const jwt = require('jsonwebtoken');
const User = require('../model/authModel');

// Middleware pour vérifier si l'utilisateur est connecté (utilisé pour le frontend)
const checkUser = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(
      token,
      "kishan sheth super secret key",
      async (err, decodedToken) => {
        if (err) {
          res.json({ status: false });
          next();
        } else {
          const user = await User.findById(decodedToken.id);
          if (user) res.json({ status: true, user: user.email });
          else res.json({ status: false });
          next();
        }
      }
    );
  } else {
    res.json({ status: false });
    next();
  }
};

// Middleware pour protéger les routes (utilisé pour l'API)
const requireAuth = (req, res, next) => {
  console.log("Headers reçus:", req.headers);
  const token = req.cookies.jwt || req.headers.authorization?.split(' ')[1];
  console.log("Token extrait:", token);

  // check json web token exists & is verified
  if (token) {
    jwt.verify(token, 'kishan sheth super secret key', async (err, decodedToken) => {
      if (err) {
        console.error("Erreur de vérification du token:", err.message);
        res.status(401).json({ message: 'Non autorisé', error: err.message });
      } else {
        console.log("Token décodé avec succès:", decodedToken);
        // Attacher l'utilisateur (ou au moins son ID) à la requête
        req.user = { id: decodedToken.id };
        console.log("ID utilisateur attaché à la requête:", req.user.id);
        next();
      }
    });
  } else {
    console.log("Aucun token trouvé dans la requête");
    res.status(401).json({ message: 'Non autorisé, token manquant' });
  }
};

module.exports = { requireAuth, checkUser }; 