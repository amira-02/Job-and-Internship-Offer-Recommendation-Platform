const express = require('express');
const router = express.Router();
const { register, login, checkUser, getUserCV, getUserProfile, updateUserProfile, addCertification, uploadProfilePicture, verifyEmail } = require('../controllers/authControllers');
const upload = require('../middleware/uploadMiddleware');
const { requireAuth } = require('../middleware/authMiddleware');
const User = require('../model/authModel');
const multer = require('multer');
const jwt = require('jsonwebtoken');
// const User = require('../model/authModel');
// Modifier le middleware upload pour accepter les fichiers PDF et Word
const cvUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || 
        file.mimetype === 'application/msword' || 
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      cb(null, true);
    } else {
      cb(new Error('Seuls les fichiers PDF et Word sont acceptés!'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Registration route with file upload
router.post('/register', upload.single('cv'), register);

// Nouvelle route pour la vérification de l'email avec OTP
router.post('/verify-email', verifyEmail);

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

// Route pour uploader le CV
router.patch('/profile/cv', requireAuth, cvUpload.single('cv'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Aucun fichier n'a été uploadé." });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Mettre à jour le CV de l'utilisateur
     if (!user.cv) user.cv = [];
        user.cv.push({
        data: req.file.buffer,
          contentType: req.file.mimetype,
          fileName: req.file.originalname,
          uploadedAt: new Date()
        });
    await user.save();

    res.status(200).json({ 
  status: true,
  message: "CV ajouté avec succès",
  cv: user.cv.map(cv => ({
    fileName: cv.fileName,
    uploadedAt: cv.uploadedAt
  }))
});
  } catch (error) {
    console.error("Erreur lors de l'upload du CV:", error);
    res.status(500).json({ 
      status: false,
      message: "Erreur lors de l'upload du CV",
      error: error.message 
    });
  }
});

// Route pour supprimer le CV
router.delete('/profile/cv', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    user.cv = undefined;
    await user.save();

    res.status(200).json({ 
      status: true,
      message: "CV supprimé avec succès"
    });
  } catch (error) {
    console.error("Erreur lors de la suppression du CV:", error);
    res.status(500).json({ 
      status: false,
      message: "Erreur lors de la suppression du CV",
      error: error.message 
    });
  }
});

// Route de déconnexion
router.post('/logout', (req, res) => {
  try {
    const expiredCookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Doit correspondre à la façon dont le cookie est set
      sameSite: 'lax',
      path: '/', // Doit correspondre à la façon dont le cookie est set
      // Ne pas spécifier de domaine si non spécifié lors du set
      expires: new Date(0) // Définir une date d'expiration passée
    };

    console.log('Attempting to expire jwt cookie with options:', expiredCookieOptions);
    // Expirer le cookie JWT
    res.cookie('jwt', '', expiredCookieOptions);
    console.log('Attempted to expire jwt cookie.');

    console.log('Attempting to expire JSESSIONID cookie with options:', expiredCookieOptions);
    // Expirer le cookie de session
    res.cookie('JSESSIONID', '', expiredCookieOptions);
    console.log('Attempted to expire JSESSIONID cookie.');

    // Envoyer une réponse avec des en-têtes pour forcer la suppression des cookies et du stockage côté client
    res.setHeader('Clear-Site-Data', '"cookies", "storage"');
    
    res.status(200).json({ message: 'Déconnexion réussie' });
    console.log('Logout response sent.');

  } catch (error) {
    console.error('Erreur lors de la déconnexion côté serveur:', error);
    res.status(500).json({ message: 'Erreur lors de la déconnexion côté serveur' });
  }
});

router.get('/cv/list/:userId', async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (user && user.cv && user.cv.length > 0) {
    res.json(user.cv.map((cv, idx) => ({
      index: idx,
      fileName: cv.fileName,
      uploadedAt: cv.uploadedAt
    })));
  } else {
    res.json([]);
  }
});

router.get('/cv/:userId/:cvIndex', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    const cvIndex = parseInt(req.params.cvIndex, 10);

    if (user && user.cv && user.cv[cvIndex]) {
      const cv = user.cv[cvIndex];
      res.contentType(cv.contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${cv.fileName}"`);
      res.send(cv.data);
    } else {
      res.status(404).send('CV non trouvé');
    }
  } catch (error) {
    console.error('Erreur lors de la récupération du CV:', error);
    res.status(500).send('Erreur serveur');
  }
});

                 
router.delete('/cv/:userId/:cvIndex', async (req, res) => {
  const user = await User.findById(req.params.userId);
  const cvIndex = parseInt(req.params.cvIndex, 10);
  if (user && user.cv && user.cv[cvIndex]) {
    user.cv.splice(cvIndex, 1);
    await user.save();
    res.json({ status: true, message: 'CV supprimé' });
  } else {
    res.status(404).json({ status: false, message: 'CV non trouvé' });
  }
});
module.exports = router;