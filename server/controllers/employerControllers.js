const User = require("../model/authModel");
const jwt = require("jsonwebtoken");
const bcrypt = require('bcryptjs');
const { sendVerificationEmail, sendWelcomeEmail } = require("../middleware/Email");

const maxAge = 3 * 24 * 60 * 60;
const createToken = (id, role) => {
  return jwt.sign({ id, role }, "kishan sheth super secret key", {
    expiresIn: maxAge,
  });
};

module.exports.register = async (req, res) => {
  try {
    const {
      email,
      password,
      fullName,
      companyName,
      website,
      phone,
      location,
      description,
      agreement
    } = req.body;

    if (!email || !password || !fullName || !companyName || !phone || !location) {
      return res.status(400).json({
        success: false,
        message: "Tous les champs obligatoires doivent être remplis."
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Cet email est déjà utilisé. Veuillez vous connecter."
      });
    }

    // Générer un token à 6 chiffres
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('Token généré pour employeur:', verificationToken);

    const user = new User({
      email,
      password,
      firstName: fullName,
      role: 'employer',
      companyName,
      website,
      phone,
      location,
      description,
      agreement,
      governorate: location,
      city: location,
      verificationToken,
      verificationTokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      isVerified: false
    });

    await user.save();
    console.log('Employeur créé avec le token:', user.verificationToken);

    // Envoyer l'email de vérification
    await sendVerificationEmail(user.email, verificationToken);
    console.log('Email de vérification envoyé à:', user.email);

    return res.status(201).json({
      success: true,
      message: "Inscription réussie. Veuillez vérifier votre email pour continuer.",
      requiresVerification: true,
      email: user.email
    });

  } catch (error) {
    console.error('Erreur d\'inscription employeur:', error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de l'inscription. Veuillez réessayer."
    });
  }
};

module.exports.verifyEmail = async (req, res) => {
  try {
    console.log('Vérification email employeur - Requête reçue:', req.body);
    const { token: verificationCode, email } = req.body;

    if (!verificationCode || !email) {
      return res.status(400).json({
        success: false,
        message: "Token et email requis."
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Aucun utilisateur trouvé avec cet email."
      });
    }

    if (user.verificationToken !== verificationCode) {
      return res.status(400).json({
        success: false,
        message: "Code de vérification incorrect."
      });
    }

    if (user.verificationTokenExpiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Code de vérification expiré."
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;

    await user.save();
    console.log('Employeur vérifié avec succès');

    const jwtToken = createToken(user._id, user.role);
    res.cookie("jwt", jwtToken, {
      withCredentials: true,
      httpOnly: false,
      maxAge: maxAge * 1000,
      sameSite: 'lax',
      secure: false,
      domain: 'localhost'
    });

    await sendWelcomeEmail(user.email, user.firstName);
    console.log('Email de bienvenue envoyé à l\'employeur');

    return res.status(200).json({
      success: true,
      message: "Email vérifié avec succès.",
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        firstName: user.firstName
      }
    });

  } catch (error) {
    console.error('Erreur de vérification email employeur:', error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la vérification de l'email."
    });
  }
};

module.exports.updateProfile = async (req, res) => {
  try {
    console.log('EmployerProfile - Requête de mise à jour reçue:', req.body);
    const userId = req.user.id; // L'ID utilisateur est attaché par le middleware d'authentification
    const updates = req.body; // Les données mises à jour sont dans le corps de la requête

    // Options pour findByIdAndUpdate: new: true retourne le document mis à jour
    // runValidators: true exécute les validateurs du schéma sur les mises à jour
    const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true, runValidators: true });
    console.log('EmployerProfile - Utilisateur mis à jour (après DB):', updatedUser);

    if (!updatedUser) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    // Retourner les données de l'utilisateur mis à jour (sans le mot de passe)
    const userProfile = {
      id: updatedUser._id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      companyName: updatedUser.companyName,
      website: updatedUser.website,
      phone: updatedUser.phone,
      location: updatedUser.location,
      description: updatedUser.description,
      role: updatedUser.role,
    };

    res.status(200).json({ 
      success: true,
      message: "Profil mis à jour avec succès.", 
      user: userProfile 
    });

  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil employeur:", error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: "Erreur interne du serveur lors de la mise à jour du profil." });
  }
}; 