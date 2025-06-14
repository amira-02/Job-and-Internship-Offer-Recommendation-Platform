const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
  try {
    const token = 
      req.cookies.jwt || 
      (req.headers.authorization && req.headers.authorization.split(' ')[1]);

    if (!token) {
      return res.status(401).json({ message: "Token d'authentification manquant" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "kishan sheth super secret key");

    req.user = {
      id: decoded.id,
      role: decoded.role
    };

    next();
  } catch (error) {
    console.error("Erreur d'authentification :", error);
    return res.status(401).json({ message: "Token invalide ou expiré" });
  }
};

module.exports = auth;
