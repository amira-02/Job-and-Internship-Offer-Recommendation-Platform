const User = require("../model/authModel");
const jwt = require("jsonwebtoken");
const bcryptjs = require('bcryptjs');
const { sendVerificationEmail, sendWelcomeEmail } = require("../middleware/Email");

const maxAge = 3 * 24 * 60 * 60;
const createToken = (id, role) => {
  return jwt.sign({ id, role }, "kishan sheth super secret key", {
    expiresIn: maxAge,
  });
};

const handleErrors = (err) => {
  let errors = { email: "", password: "" };

  if (err.message === "incorrect email") {
    errors.email = "Cet email n'est pas enregistré";
  }

  if (err.message === "incorrect password") {
    errors.password = "Mot de passe incorrect";
  }

  if (err.code === 11000) {
    errors.email = "Cet email est déjà enregistré";
    return errors;
  }

  if (err.message.includes("Users validation failed")) {
    Object.values(err.errors).forEach(({ properties }) => {
      errors[properties.path] = properties.message;
    });
  }

  return errors;
};

module.exports.register = async (req, res) => {
  try {
    const { 
      email,
      password,
      firstName,
      governorate,
      city,
      postalCode,
      address
    } = req.body;

    const userName = firstName;

    if (!email || !password || !firstName) {
      return res.status(400).json({ success: false, message: "Les champs email, mot de passe et prénom sont requis." });
    }

    const ExistsUser = await User.findOne({ email });
    if (ExistsUser) {
      return res.status(400).json({ success: false, message: "Cet utilisateur existe déjà. Veuillez vous connecter." });
    }

    // Générer un token à 6 chiffres
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('Token généré:', verificationToken);

    const user = new User({
      email,
      password,
      firstName: firstName,
      governorate,
      city,
      postalCode,
      address,
      role: 'candidate',
      verificationToken,
      verificationTokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 heures
    });

    await user.save();
    console.log('Utilisateur créé avec le token:', user.verificationToken);

    const token = createToken(user._id, user.role);
    res.cookie("jwt", token, {
      withCredentials: true,
      httpOnly: false,
      maxAge: maxAge * 1000,
      sameSite: 'lax',
      secure: false,
      domain: 'localhost'
    });

    await sendVerificationEmail(user.email, verificationToken);
    console.log('Email de vérification envoyé à:', user.email);

    return res.status(201).json({ 
      success: true, 
      message: "Utilisateur enregistré avec succès. Un code de vérification a été envoyé à votre email.", 
      user: user._id, 
      token: token, 
      role: user.role 
    });
  } catch (error) {
    console.error('Registration error:', error);
    const errors = handleErrors(error);
    const errorMessage = Object.values(errors).find(msg => msg !== '') || 'Échec de l\'enregistrement.';
    res.status(400).json({ success: false, message: errorMessage, errors });
  }
};

module.exports.verifyEmail = async (req, res) => {
  try {
    console.log('Vérification email - Requête reçue:', req.body);
    const { token, email } = req.body;

    if (!token || !email) {
      console.log('Vérification email - Données manquantes:', { token, email });
      return res.status(400).json({ 
        success: false, 
        message: "Token et email requis." 
      });
    }

    // Rechercher l'utilisateur par email d'abord
    const user = await User.findOne({ email });
    console.log('Vérification email - Utilisateur trouvé par email:', user ? 'Oui' : 'Non');

    if (!user) {
      console.log('Vérification email - Aucun utilisateur trouvé avec cet email');
      return res.status(400).json({ 
        success: false, 
        message: "Aucun utilisateur trouvé avec cet email." 
      });
    }

    // Vérifier le token
    console.log('Vérification email - Token stocké:', user.verificationToken);
    console.log('Vérification email - Token reçu:', token);
    console.log('Vérification email - Token expiré:', user.verificationTokenExpiresAt < new Date());

    if (user.verificationToken !== token) {
      console.log('Vérification email - Token ne correspond pas');
      return res.status(400).json({ 
        success: false, 
        message: "Code de vérification incorrect." 
      });
    }

    if (user.verificationTokenExpiresAt < new Date()) {
      console.log('Vérification email - Token expiré');
      return res.status(400).json({ 
        success: false, 
        message: "Code de vérification expiré." 
      });
    }

    // Mettre à jour l'utilisateur
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;

    await user.save();
    console.log('Vérification email - Utilisateur mis à jour avec succès');

    // Envoyer l'email de bienvenue
    try {
      await sendWelcomeEmail(user.email, user.firstName || user.name);
      console.log('Vérification email - Email de bienvenue envoyé');
    } catch (emailError) {
      console.error('Vérification email - Erreur lors de l\'envoi de l\'email de bienvenue:', emailError);
      // On continue même si l'email de bienvenue échoue
    }

    return res.status(200).json({ 
      success: true, 
      message: "Email vérifié avec succès.", 
      user: user._id 
    });
  } catch (error) {
    console.error('Vérification email - Erreur détaillée:', error);
    res.status(500).json({ 
      success: false, 
      message: "Erreur interne du serveur lors de la vérification de l'email." 
    });
  }
};

module.exports.login = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const user = await User.login(email, password);
    
    if (!user.isVerified) {
      return res.status(401).json({ success: false, message: "Veuillez vérifier votre email avant de vous connecter.", requiresVerification: true });
    }

    const token = createToken(user._id, user.role);
    
    res.cookie("jwt", token, { 
      withCredentials: true,
      httpOnly: false,
      maxAge: maxAge * 1000,
      sameSite: 'lax',
      secure: false,
      domain: 'localhost'
    });

    return res.status(200).json({ 
      success: true, 
      message: "Connexion réussie", 
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        firstName: user.firstName
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    const errors = handleErrors(error);
    const errorMessage = Object.values(errors).find(msg => msg !== '') || 'Échec de la connexion.';
    res.status(400).json({ success: false, message: errorMessage, errors });
  }
};

module.exports.checkUser = async (req, res) => {
  try {
  const token = req.cookies.jwt;
    if (!token) {
      return res.json({ status: false });
    }

    const decoded = jwt.verify(token, "kishan sheth super secret key");
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.json({ status: false });
    }

          res.json({ 
            status: true, 
      user: {
            id: user._id,
            email: user.email,
            role: user.role,
            firstName: user.firstName,
        governorate: user.governorate,
        city: user.city,
        postalCode: user.postalCode,
        address: user.address,
        isVerified: user.isVerified
      }
          });
  } catch (err) {
    res.json({ status: false });
  }
};

module.exports.getUserCV = async (req, res) => {
  try {
    const userId = req.params.userId;
    const fileName = req.query.fileName;

    if (!fileName) {
      return res.status(400).json({ message: 'Paramètre fileName manquant' });
    }

    const user = await User.findById(userId).select('+cv');

    if (!user || !user.cv || !Array.isArray(user.cv)) {
      return res.status(404).json({ message: 'Utilisateur ou CV non trouvé' });
    }

    // Trouver le CV correspondant au fileName
    const cvFile = user.cv.find(cv => cv.fileName === fileName);

    if (!cvFile || !cvFile.data) {
      return res.status(404).json({ message: 'CV introuvable' });
    }

    res.set({
      'Content-Type': cvFile.contentType || 'application/pdf',
      'Content-Disposition': `attachment; filename="${cvFile.fileName}"`,
    });

    res.send(cvFile.data);
  } catch (err) {
    console.error('Error fetching CV:', err);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération du CV' });
  }
};



module.exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Gérer le cas admin
    if (userId === "admin") {
      // Renvoyer des informations basiques pour l'admin
      const adminProfile = {
        _id: "admin",
        firstName: "Admin",
        lastName: "User",
        email: "admin@gmail.com",
        role: "admin",
        isAdmin: true,
        // Ajoutez d'autres champs pertinents pour l'admin si nécessaire
      };
      console.log("Fetching profile for admin.", adminProfile);
      return res.status(200).json(adminProfile);
    }

    // Pour les utilisateurs normaux, rechercher dans la base de données
    const user = await User.findById(userId);
    
    if (!user) {
      console.error("Utilisateur non trouvé pour l'ID dans getUserProfile:", userId);
      return res.status(404).json({ message: "Profil utilisateur non trouvé." });
    }

    // Convertir les données de l'image en base64 si elle existe
    let profilePictureBase64 = null;
    if (user.profilePicture && user.profilePicture.data) {
      profilePictureBase64 = `data:${user.profilePicture.contentType};base64,${user.profilePicture.data.toString('base64')}`;
    }

    // Retourner les données de l'utilisateur
    const userProfile = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      governorate: user.governorate,
      mobileNumber: user.mobileNumber,
      // otherPhone: user.otherPhone,
      // desiredJobTitle: user.desiredJobTitle,
      // employmentTypes: user.employmentTypes,
      // selectedDomains: user.selectedDomains,
      // yearsOfExperience: user.yearsOfExperience,
      // diplomaSpecialty: user.diplomaSpecialty,
      // university: user.university,
      // studyStartDate: user.studyStartDate,
      // studyEndDate: user.studyEndDate,
      // isCurrentlyStudying: user.isCurrentlyStudying,
      country: user.country,
      city: user.city,
      // zipCode: user.zipCode,
      address: user.address,
          cv: user.cv?.map(f => ({
            fileName: f.fileName,
            contentType: f.contentType,
            size: f.data?.length || 0
          })) || [],


      languages: user.languages || [],
      certifications: user.certifications || [],
      profilePicture: profilePictureBase64
    };
    console.log("Fetching profile for regular user.", userProfile);
    res.status(200).json(userProfile);

  } catch (error) {
    console.error("Erreur lors de la récupération du profil:", error);
    // Gérer spécifiquement la CastError pour les IDs non ObjectId
    if (error.name === 'CastError') {
        console.error("CastError détectée, probablement un ID non valide.", error.message);
        return res.status(400).json({ message: 'ID utilisateur invalide.' });
    }
    res.status(500).json({ message: "Erreur interne du serveur lors de la récupération du profil." });
  }
};

// Nouvelle fonction pour mettre à jour le profil utilisateur
module.exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id; // L'ID utilisateur est attaché par requireAuth
    const updates = req.body; // Les données mises à jour sont dans le corps de la requête

    // Options pour findByIdAndUpdate: new: true retourne le document mis à jour
    const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    // Renvoyer les données de l'utilisateur mis à jour (sans le mot de passe)
     const userProfile = {
      _id: updatedUser._id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      governorate: updatedUser.governorate,
      mobileNumber: updatedUser.mobileNumber,
      otherPhone: updatedUser.otherPhone,
      desiredJobTitle: updatedUser.desiredJobTitle,
      employmentTypes: updatedUser.employmentTypes,
      selectedDomains: updatedUser.selectedDomains,
      yearsOfExperience: updatedUser.yearsOfExperience,
      diplomaSpecialty: updatedUser.diplomaSpecialty,
      university: updatedUser.university,
      studyStartDate: updatedUser.studyStartDate,
      studyEndDate: updatedUser.studyEndDate,
      isCurrentlyStudying: updatedUser.isCurrentlyStudying,
      country: updatedUser.country,
      city: updatedUser.city,
      zipCode: updatedUser.zipCode,
      address: updatedUser.address,
      cv: updatedUser.cv ? { fileName: updatedUser.cv.fileName } : null // Informations basiques du CV
    };


    res.status(200).json({ message: "Profil mis à jour avec succès.", user: userProfile });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil:", error);
    res.status(500).json({ message: "Erreur lors de la mise à jour du profil." });
  }
};

// Nouvelle fonction pour ajouter une certification
module.exports.addCertification = async (req, res) => {
  try {
    console.log("Requête reçue pour ajouter une certification:", req.body);
    const userId = req.user.id; // L'ID utilisateur est attaché par requireAuth
    console.log("ID utilisateur reçu dans addCertification:", userId);
    const { name, authority, date } = req.body; // Assurez-vous que les noms correspondent à ceux envoyés par le frontend
    console.log("Données de certification reçues:", { name, authority, date });

    const user = await User.findById(userId);

    if (!user) {
      console.log("Utilisateur non trouvé avec l'ID:", userId);
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    console.log("Utilisateur trouvé:", user.email);

    // Créer un nouvel objet certification. Utilisez 'issuer' comme défini dans le modèle.
    const newCertification = {
      name,
      issuer: authority, // Mappage du champ 'authority' du frontend vers 'issuer' du backend
      date: new Date(date) // Convertir la chaîne de date en objet Date
    };

    console.log("Nouvel objet certification créé:", newCertification);

    // Ajouter la nouvelle certification au tableau
    user.certifications.push(newCertification);

    console.log("Certifications après ajout:", user.certifications);

    // Sauvegarder l'utilisateur mis à jour
    console.log("Sauvegarde de l'utilisateur...");
    await user.save();
    console.log("Utilisateur sauvegardé avec succès");

    console.log("Certification ajoutée avec succès pour l'utilisateur:", userId);

    // Renvoyer les certifications mises à jour
    res.status(200).json({ message: "Certification ajoutée avec succès", certifications: user.certifications });

  } catch (error) {
    console.error("Erreur lors de l'ajout de la certification:", error);
    // Gérer spécifiquement les erreurs de validation si nécessaire
    if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(val => val.message);
        return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: "Erreur lors de l'ajout de la certification", error: error.message });
  }
};

// Nouvelle fonction pour uploader la photo de profil
module.exports.uploadProfilePicture = async (req, res) => {
  try {
    console.log("=== Début de l'upload de la photo de profil ===");
    console.log("Headers de la requête:", req.headers);
    console.log("User ID:", req.user.id);
    console.log("File details:", req.file ? {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      buffer: req.file.buffer ? `Buffer présent (${req.file.buffer.length} bytes)` : 'Pas de buffer'
    } : 'Pas de fichier');

    if (!req.file) {
      console.log("Erreur: Aucun fichier n'a été uploadé");
      return res.status(400).json({ message: "Aucun fichier image n'a été uploadé." });
    }

    const user = await User.findById(req.user.id);
    console.log("Utilisateur trouvé:", {
      userId: user ? user._id : 'Non trouvé',
      hasProfilePicture: user && user.profilePicture ? 'Oui' : 'Non',
      email: user ? user.email : 'Non disponible'
    });

    if (!user) {
      console.log("Erreur: Utilisateur non trouvé avec l'ID:", req.user.id);
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Vérifier le type MIME
    if (!req.file.mimetype.startsWith('image/')) {
      console.log("Erreur: Type de fichier invalide:", req.file.mimetype);
      return res.status(400).json({ message: "Le fichier doit être une image." });
    }

    // Vérifier la taille du fichier (5MB max)
    if (req.file.size > 5 * 1024 * 1024) {
      console.log("Erreur: Fichier trop volumineux:", req.file.size, "bytes");
      return res.status(400).json({ message: "L'image ne doit pas dépasser 5MB." });
    }

    try {
      console.log("Tentative de mise à jour de la photo de profil...");
      // Mettre à jour le champ profilePicture de l'utilisateur
      user.profilePicture = {
        data: req.file.buffer,
        contentType: req.file.mimetype
      };

      console.log("Sauvegarde de l'utilisateur...");
      await user.save();
      console.log("Photo de profil mise à jour avec succès!");

      // Convertir l'image en base64 pour la réponse
      const base64Image = `data:${user.profilePicture.contentType};base64,${user.profilePicture.data.toString('base64')}`;
      
      res.status(200).json({ 
        message: "Photo de profil mise à jour avec succès",
        profilePicture: base64Image
      });
    } catch (saveError) {
      console.error("Erreur détaillée lors de la sauvegarde:", {
        name: saveError.name,
        message: saveError.message,
        stack: saveError.stack,
        code: saveError.code
      });
      throw saveError;
    }

  } catch (error) {
    console.error("=== Erreur lors de l'upload de la photo de profil ===");
    console.error("Type d'erreur:", error.name);
    console.error("Message d'erreur:", error.message);
    console.error("Code d'erreur:", error.code);
    console.error("Stack trace:", error.stack);
    res.status(500).json({ 
      message: "Erreur lors de l'upload de la photo de profil", 
      error: error.message 
    });
  }
};
