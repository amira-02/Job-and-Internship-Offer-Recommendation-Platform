const User = require("../model/authModel");
const jwt = require("jsonwebtoken");

const maxAge = 3 * 24 * 60 * 60;
const createToken = (id, role) => {
  return jwt.sign({ id, role }, "kishan sheth super secret key", {
    expiresIn: maxAge,
  });
};

const handleErrors = (err) => {
  let errors = { email: "", password: "" };

  console.log(err);
  if (err.message === "incorrect email") {
    errors.email = "That email is not registered";
  }

  if (err.message === "incorrect password") {
    errors.password = "That password is incorrect";
  }

  if (err.code === 11000) {
    errors.email = "Email is already registered";
    return errors;
  }

  if (err.message.includes("Users validation failed")) {
    Object.values(err.errors).forEach(({ properties }) => {
      errors[properties.path] = properties.message;
    });
  }

  return errors;
};

module.exports.register = async (req, res, next) => {
  try {
    // Log the entire request
    console.log('Registration request received:', {
      body: req.body,
      file: req.file ? {
        fieldname: req.file.fieldname,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        buffer: req.file.buffer ? 'Buffer present' : 'No buffer'
      } : 'No file'
    });

    // Récupérer tous les champs du corps de la requête
    const { 
      email, 
      password, 
      fullName,
      companyName, 
      phone,
      location,
      website,
      description,
      agreement
    } = req.body;

    // Split fullName into firstName and lastName
    const [firstName, ...lastNameParts] = fullName.split(' ');
    const lastName = lastNameParts.join(' ');

    // Préparer l'objet utilisateur
    const userData = {
      email,
      password,
      firstName,
      lastName,
      role: 'employer',
      companyName,
      website,
      mobileNumber: phone,
      city: location,
      description,
      agreement
    };

    // Si un CV a été uploadé, l'ajouter aux données utilisateur
    if (req.file) {
      console.log('Processing CV upload:', {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        bufferSize: req.file.buffer ? req.file.buffer.length : 0
      });
      
      userData.cv = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
        fileName: req.file.originalname
      };
    }

    // Créer l'utilisateur avec toutes les données fournies
    const user = await User.create(userData);
    
    // Vérifier si le CV a été correctement stocké
    const savedUser = await User.findById(user._id);
    console.log('User saved with CV:', {
      userId: savedUser._id,
      hasCV: !!savedUser.cv,
      cvDetails: savedUser.cv ? {
        hasData: !!savedUser.cv.data,
        dataSize: savedUser.cv.data ? savedUser.cv.data.length : 0,
        contentType: savedUser.cv.contentType,
        fileName: savedUser.cv.fileName
      } : 'No CV'
    });

    const token = createToken(user._id, user.role);

    res.cookie("jwt", token, {
      withCredentials: true,
      httpOnly: false,
      maxAge: maxAge * 1000,
      sameSite: 'lax',
      secure: false,
      domain: 'localhost'
    });

    res.status(201).json({ 
      user: user._id, 
      status: true,
      token: token,
      role: user.role
    });
  } catch (err) {
    console.error('Registration error:', err);
    const errors = handleErrors(err);
    const errorMessage = Object.values(errors).find(msg => msg !== '') || 'Échec de l\'enregistrement.';
    res.json({ status: false, message: errorMessage, errors });
  }
};

module.exports.login = async (req, res) => {
  const { email, password } = req.body;
  
  // Vérification des identifiants admin
  if (email === "admin@gmail.com" && password === "admin") {
    const token = createToken("admin", "admin");
    res.cookie("jwt", token, { 
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: maxAge * 1000,
      path: '/',
      domain: 'localhost'
    });
    res.status(200).json({ 
      user: { email: email, role: "admin" },
      isAdmin: true,
      status: true,
      token: token
    });
    return;
  }

  // Pour tous les autres utilisateurs
  try {
    const user = await User.login(email, password);
    
    // Si User.login réussit, créez le token et définissez le cookie
    const token = createToken(user._id, user.role);
    
    res.cookie("jwt", token, { 
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: maxAge * 1000,
      path: '/',
      domain: 'localhost'
    });

    // Préparer les données utilisateur à renvoyer
    const userData = {
      id: user._id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName
    };

    // Ajouter les données spécifiques selon le rôle
    if (user.role === 'employer') {
      userData.companyName = user.companyName;
      userData.website = user.website;
      userData.mobileNumber = user.mobileNumber;
      userData.city = user.city;
      userData.description = user.description;
    }

    res.status(200).json({ 
      user: userData,
      isAdmin: false,
      status: true,
      token: token
    });

  } catch (err) {
    // Si User.login lance une exception (par exemple, mauvais mot de passe)
    console.error('Login failed:', err.message);
    const errors = handleErrors(err);
    
    // Renvoie une réponse d'erreur d'authentification
    res.status(401).json({ errors, status: false, message: errors.email || errors.password || 'Identifiants invalides' });
  }
};

module.exports.checkUser = async (req, res) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, "kishan sheth super secret key", async (err, decodedToken) => {
      if (err) {
        res.json({ status: false });
      } else {
        // Si c'est l'admin
        if (decodedToken.id === "admin") {
          res.json({ 
            status: true, 
            user: "admin@gmail.com",
            isAdmin: true 
          });
          return;
        }

        // Pour les autres utilisateurs
        const user = await User.findById(decodedToken.id);
        if (user) {
          const userData = {
            id: user._id,
            email: user.email,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName
          };

          // Ajouter les données spécifiques selon le rôle
          if (user.role === 'employer') {
            userData.companyName = user.companyName;
            userData.website = user.website;
            userData.mobileNumber = user.mobileNumber;
            userData.city = user.city;
            userData.description = user.description;
          }

          res.json({ 
            status: true, 
            user: userData,
            isAdmin: false 
          });
        } else {
          res.json({ status: false });
        }
      }
    });
  } else {
    res.json({ status: false });
  }
};

module.exports.getUserCV = async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log('Fetching CV for user:', userId);
    
    const user = await User.findById(userId).select('+cv.data'); // Explicitly select cv.data
    console.log('User found:', {
      userId: user ? user._id : 'Not found',
      hasCV: user && user.cv ? 'Yes' : 'No',
      cvDetails: user && user.cv ? {
        hasData: !!user.cv.data,
        dataSize: user.cv.data ? user.cv.data.length : 0,
        contentType: user.cv.contentType,
        fileName: user.cv.fileName
      } : 'No CV details'
    });
    
    if (!user) {
      console.log('User not found');
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (!user.cv || !user.cv.data) {
      console.log('CV not found or no data:', {
        hasCV: !!user.cv,
        hasData: user.cv ? !!user.cv.data : false
      });
      return res.status(404).json({ message: 'CV not found' });
    }

    // Définir les headers pour le téléchargement du fichier
    res.set({
      'Content-Type': user.cv.contentType || 'application/pdf',
      'Content-Disposition': `attachment; filename="${user.cv.fileName || 'cv.pdf'}"`,
    });

    // Envoyer le fichier
    res.send(user.cv.data);
  } catch (err) {
    console.error('Error fetching CV:', err);
    res.status(500).json({ message: 'Error fetching CV' });
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
      otherPhone: user.otherPhone,
      desiredJobTitle: user.desiredJobTitle,
      employmentTypes: user.employmentTypes,
      selectedDomains: user.selectedDomains,
      yearsOfExperience: user.yearsOfExperience,
      diplomaSpecialty: user.diplomaSpecialty,
      university: user.university,
      studyStartDate: user.studyStartDate,
      studyEndDate: user.studyEndDate,
      isCurrentlyStudying: user.isCurrentlyStudying,
      country: user.country,
      city: user.city,
      zipCode: user.zipCode,
      address: user.address,
      cv: user.cv ? { fileName: user.cv.fileName } : null,
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
