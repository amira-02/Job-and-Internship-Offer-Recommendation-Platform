const User = require("../model/authModel");
const jwt = require("jsonwebtoken");

const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
  return jwt.sign({ id }, "kishan sheth super secret key", {
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
      firstName, 
      lastName, 
      governorate, 
      experienceLevel, 
      employmentTypes, 
      desiredJobTitle, 
      selectedDomains, 
      country, 
      city, 
      zipCode, 
      address, 
      mobileNumber, 
      otherPhone,
      yearsOfExperience,
      diplomaSpecialty,
      university,
      studyStartDate,
      studyEndDate,
      isCurrentlyStudying
    } = req.body;

    // Préparer l'objet utilisateur
    const userData = {
      email,
      password,
      firstName,
      lastName,
      governorate,
      experienceLevel,
      employmentTypes,
      desiredJobTitle,
      selectedDomains,
      country,
      city,
      zipCode,
      address,
      mobileNumber,
      otherPhone,
      yearsOfExperience,
      diplomaSpecialty,
      university,
      studyStartDate,
      studyEndDate,
      isCurrentlyStudying
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

    const token = createToken(user._id);

    res.cookie("jwt", token, {
      withCredentials: true,
      httpOnly: false,
      maxAge: maxAge * 1000,
      sameSite: 'lax',
      secure: false
    });

    res.status(201).json({ 
      user: user._id, 
      status: true,
      token: token
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
    const token = createToken("admin");
    res.cookie("jwt", token, { 
      httpOnly: false, 
      maxAge: maxAge * 1000,
      sameSite: 'lax',
      secure: false // Mettre à true en production avec HTTPS
    });
    res.status(200).json({ 
      user: email, 
      isAdmin: true,
      status: true,
      token: token // Renvoyer le token dans la réponse
    });
    return;
  }

  // Pour tous les autres utilisateurs
  try {
    const user = await User.login(email, password);
    const token = createToken(user._id);
    
    // Définir le cookie avec les mêmes options pour tous les utilisateurs
    res.cookie("jwt", token, { 
      httpOnly: false, 
      maxAge: maxAge * 1000,
      sameSite: 'lax',
      secure: false // Mettre à true en production avec HTTPS
    });

    res.status(200).json({ 
      user: user._id, 
      isAdmin: false,
      status: true,
      token: token // Renvoyer le token dans la réponse
    });
  } catch (err) {
    const errors = handleErrors(err);
    res.json({ errors, status: false });
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
          res.json({ 
            status: true, 
            user: user.email,
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
    // Le token contient l'ID de l'utilisateur
    const userId = req.user.id;
    console.log('Fetching profile for user:', userId);

    // Récupérer l'utilisateur sans le CV (pour éviter de surcharger la réponse)
    const user = await User.findById(userId).select('-cv.data');
    
    if (!user) {
      console.log('User not found');
      return res.status(404).json({ message: 'User not found' });
    }

    // Si l'utilisateur a un CV, inclure juste les métadonnées (pas les données binaires)
    const userData = user.toObject();
    if (userData.cv) {
      userData.cv = {
        fileName: userData.cv.fileName,
        contentType: userData.cv.contentType,
        // Ne pas inclure les données binaires
      };
    }

    res.json(userData);
  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(500).json({ message: 'Error fetching user profile' });
  }
};
