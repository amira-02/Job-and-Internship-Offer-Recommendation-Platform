const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
  try {
    // Récupérer le token du header Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token d\'authentification manquant' });
    }

    const token = authHeader.split(' ')[1];

    // Vérifier le token avec la même clé secrète que dans authControllers.js
    const decoded = jwt.verify(token, "kishan sheth super secret key");
    
    // Ajouter les informations de l'utilisateur à la requête
    req.user = {
      id: decoded.id,
      role: decoded.role
    };

    next();
  } catch (error) {
    console.error('Erreur d\'authentification:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token invalide' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expiré' });
    }
    res.status(500).json({ message: 'Erreur lors de l\'authentification' });
  }
};

module.exports = auth; 