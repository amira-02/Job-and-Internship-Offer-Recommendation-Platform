const express = require('express');
const router = express.Router();
const { register, login, checkUser, getUserCV, getUserProfile, updateUserProfile, addCertification, uploadProfilePicture } = require('../controllers/authControllers');
const upload = require('../middleware/uploadMiddleware');
const { requireAuth } = require('../middleware/authMiddleware');
const User = require('../model/authModel');

// Registration route with file upload
router.post('/register', upload.single('cv'), register);

// Route pour récupérer le CV
router.get('/cv/:userId', getUserCV);

// Other routes remain unchanged
router.post('/login', login);
router.get('/check', checkUser);

// Nouvelle route pour le profil (protégée par l'authentification)
router.get('/profile', requireAuth, getUserProfile);

// Nouvelle route pour mettre à jour le profil (protégée par l'authentification)
router.patch('/profile', requireAuth, updateUserProfile);

// Nouvelle route pour ajouter une certification au profil (protégée par l'authentification)
router.post("/profile/certifications", requireAuth, addCertification);

router.post("/profile/languages", requireAuth, async (req, res) => {
  try {
    console.log("Requête reçue pour ajouter une langue:", req.body);
    console.log("ID utilisateur:", req.user.id);
    
    const { name, level } = req.body;
    const userId = req.user.id;

    console.log("Recherche de l'utilisateur avec l'ID:", userId);
    const user = await User.findById(userId);
    
    if (!user) {
      console.log("Utilisateur non trouvé avec l'ID:", userId);
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    console.log("Utilisateur trouvé:", user.email);
    console.log("Langues actuelles:", user.languages);

    // Vérifier si la langue existe déjà
    const languageExists = user.languages.some(lang => lang.name === name);
    if (languageExists) {
      console.log("La langue existe déjà:", name);
      return res.status(400).json({ message: "Cette langue est déjà ajoutée" });
    }

    // Ajouter la nouvelle langue
    console.log("Ajout de la nouvelle langue:", { name, level });
    user.languages.push({ name, level });
    
    console.log("Sauvegarde de l'utilisateur...");
    await user.save();
    console.log("Utilisateur sauvegardé avec succès");

    res.status(200).json({ message: "Langue ajoutée avec succès", languages: user.languages });
  } catch (error) {
    console.error("Erreur détaillée lors de l'ajout de la langue:", error);
    console.error("Stack trace:", error.stack);
    res.status(500).json({ 
      message: "Erreur lors de l'ajout de la langue",
      error: error.message 
    });
  }
});

// Nouvelle route pour uploader la photo de profil
router.patch('/profile/picture', requireAuth, upload.single('profilePicture'), uploadProfilePicture);

module.exports = router;