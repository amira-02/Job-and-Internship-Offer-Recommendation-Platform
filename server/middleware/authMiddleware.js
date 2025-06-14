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
  console.log("🔥 Middleware requireAuth appelé");
  console.log("Headers:", req.headers);
  console.log("Cookies:", req.cookies);

  const token = req.cookies.jwt;
  console.log("🍪 Token dans cookie:", token);

  if (!token) {
    console.log("❌ Aucun token dans le cookie !");
    return res.status(401).json({ message: "Token manquant" });
  }

  jwt.verify(token, 'kishan sheth super secret key', async (err, decodedToken) => {
    if (err) {
      console.error("❌ Erreur vérification token :", err.message);
      return res.status(401).json({ message: "Token invalide ou expiré" });
    }

    console.log("✅ Token décodé :", decodedToken);

    try {
      const user = await User.findById(decodedToken.id);
      if (!user) {
        console.error("❌ Utilisateur introuvable pour ID :", decodedToken.id);
        return res.status(401).json({ message: "Utilisateur introuvable" });
      }

      req.user = { id: user._id, role: user.role };
      console.log("✅ Utilisateur attaché à la requête :", req.user);
      next();
    } catch (error) {
      console.error("❌ Erreur base de données :", error);
      return res.status(500).json({ message: "Erreur lors de l'authentification" });
    }
  });
};




module.exports = { requireAuth, checkUser }; 