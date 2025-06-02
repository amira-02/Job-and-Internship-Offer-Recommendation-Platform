const User = require('../model/authModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Inscription employeur
const registerEmployer = async (req, res) => {
  try {
    console.log('Received registration request:', req.body);
    
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

    // Vérifier les champs requis
    const requiredFields = ['email', 'password', 'fullName', 'companyName', 'phone', 'location', 'agreement'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        message: 'Champs manquants',
        errors: missingFields.map(field => `${field} est requis`)
      });
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Un compte avec cet email existe déjà' });
    }

    // Séparer le nom complet en prénom et nom
    const [firstName, ...lastNameParts] = fullName.split(' ');
    const lastName = lastNameParts.join(' ');

    if (!firstName || !lastName) {
      return res.status(400).json({
        message: 'Format de nom invalide',
        errors: ['Le nom complet doit contenir au moins un prénom et un nom']
      });
    }

    // Hasher le mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Créer le nouvel utilisateur avec le rôle employer
    const user = new User({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: 'employer',
      companyName,
      website,
      mobileNumber: phone,
      city: location,
      description,
      agreement,
      governorate: 'Non spécifié',
      country: 'Tunisie'
    });

    console.log('Attempting to save user...');
    await user.save();
    console.log('User saved successfully');

    // Créer le token JWT
    const token = jwt.sign(
      { id: user._id, role: 'employer' },
      process.env.JWT_SECRET || 'votre_secret_jwt',
      { expiresIn: '1d' }
    );

    // Envoyer la réponse avec les informations nécessaires
    res.status(201).json({
      message: 'Inscription réussie',
      token,
      user: {
        id: user._id,
        email: user.email,
        companyName: user.companyName,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.firstName + ' ' + user.lastName,
        phone: user.mobileNumber,
        location: user.city,
        website: user.website,
        description: user.description
      }
    });
  } catch (error) {
    console.error('Erreur détaillée lors de l\'inscription:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        message: 'Erreur de validation',
        errors: validationErrors
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        message: 'Email déjà utilisé',
        errors: ['Un compte avec cet email existe déjà']
      });
    }

    res.status(500).json({ 
      message: 'Erreur lors de l\'inscription', 
      error: error.message
    });
  }
};

// Connexion employeur
const loginEmployer = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Vérifier si c'est un employeur
    if (user.role !== 'employer') {
      return res.status(403).json({ message: 'Accès non autorisé. Ce compte n\'est pas un compte employeur.' });
    }

    // Vérifier le mot de passe
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Créer le token JWT
    const token = jwt.sign(
      { id: user._id, role: 'employer' },
      process.env.JWT_SECRET || 'votre_secret_jwt',
      { expiresIn: '1d' }
    );

    // Envoyer la réponse
    res.json({
      message: 'Connexion réussie',
      token,
      user: {
        id: user._id,
        email: user.email,
        companyName: user.companyName,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.firstName + ' ' + user.lastName,
        phone: user.mobileNumber,
        location: user.city,
        website: user.website,
        description: user.description
      }
    });
  } catch (error) {
    console.error('Erreur de connexion:', error);
    res.status(500).json({ message: 'Erreur lors de la connexion', error: error.message });
  }
};

// Mise à jour du profil employeur
const updateEmployerProfile = async (req, res) => {
  try {
    const { companyName, fullName, phone, location, website, description } = req.body;
    const userId = req.user.id; // Récupéré du middleware d'authentification

    // Vérifier si l'utilisateur existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Vérifier si l'utilisateur est un employeur
    if (user.role !== 'employer') {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    // Mettre à jour les champs
    const updateFields = {};
    if (companyName) updateFields.companyName = companyName;
    if (fullName) {
      const [firstName, ...lastNameParts] = fullName.split(' ');
      const lastName = lastNameParts.join(' ');
      updateFields.firstName = firstName;
      updateFields.lastName = lastName;
    }
    if (phone) updateFields.mobileNumber = phone;
    if (location) updateFields.city = location;
    if (website) updateFields.website = website;
    if (description) updateFields.description = description;

    // Mettre à jour l'utilisateur
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Profil mis à jour avec succès',
      user: updatedUser
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du profil' });
  }
};

module.exports = {
  registerEmployer,
  loginEmployer,
  updateEmployerProfile
}; 