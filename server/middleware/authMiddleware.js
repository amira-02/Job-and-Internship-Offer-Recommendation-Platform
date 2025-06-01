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
          // Gérer le cas admin dans checkUser aussi si nécessaire
          if (decodedToken.id === "admin") {
            res.json({ status: true, user: "admin@gmail.com", isAdmin: true });
            return next();
          }
          const user = await User.findById(decodedToken.id);
          if (user) res.json({ status: true, user: user.email }); // Peut-être renvoyer plus d'infos utilisateur ?
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
  // console.log("Headers reçus:", req.headers); // Désactiver les logs excessifs
  const token = req.cookies.jwt || req.headers.authorization?.split(' ')[1];
  // console.log("Token extrait:", token); // Désactiver les logs excessifs

  // check json web token exists & is verified
  if (token) {
    jwt.verify(token, 'kishan sheth super secret key', async (err, decodedToken) => {
      if (err) {
        console.error("Erreur de vérification du token:", err.message);
        res.status(401).json({ message: 'Non autorisé', error: err.message });
      } else {
        console.log("Token décodé avec succès dans requireAuth:", decodedToken);
        // Gérer le cas admin: ne pas chercher dans la base de données
        if (decodedToken.id === "admin") {
          req.user = { id: "admin", role: "admin", isAdmin: true };
          console.log("Admin détecté. Attaching admin info.");
          return next();
        }

        // Pour les utilisateurs normaux, chercher dans la base de données
        try {
          const user = await User.findById(decodedToken.id);
          if (!user) {
            console.error("Utilisateur non trouvé pour l'ID dans le token:", decodedToken.id);
            return res.status(401).json({ message: 'Non autorisé, utilisateur introuvable' });
          }
          // Attacher l'utilisateur à la requête (ou les infos nécessaires)
          req.user = { id: user._id, role: user.role, isAdmin: false }; // Attacher les infos de l'utilisateur réel
          console.log("Utilisateur normal détecté. Attaching user info.", req.user);
          next();
        } catch (dbError) {
          console.error("Erreur lors de la recherche utilisateur dans la base de données:", dbError);
          res.status(500).json({ message: 'Erreur serveur lors de l\'authentification' });
        }
      }
    });
  } else {
    console.log("Aucun token trouvé dans la requête");
    res.status(401).json({ message: 'Non autorisé, token manquant' });
  }
};

module.exports = { requireAuth, checkUser }; 