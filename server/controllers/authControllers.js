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
    const { email, password } = req.body;
    const user = await User.create({ email, password });
    const token = createToken(user._id);

    res.cookie("jwt", token, {
      withCredentials: true,
      httpOnly: false,
      maxAge: maxAge * 1000,
    });

    res.status(201).json({ user: user._id, created: true });
  } catch (err) {
    console.log(err);
    const errors = handleErrors(err);
    res.json({ errors, created: false });
  }
};

module.exports.login = async (req, res) => {
  const { email, password } = req.body;
  
  // Vérification des identifiants admin
  if (email === "admin@gmail.com" && password === "admin") {
    const token = createToken("admin");
    res.cookie("jwt", token, { httpOnly: false, maxAge: maxAge * 1000 });
    res.status(200).json({ 
      user: email, 
      isAdmin: true,
      status: true 
    });
    return;
  }

  // Pour tous les autres utilisateurs
  try {
    const user = await User.login(email, password);
    const token = createToken(user._id);
    res.cookie("jwt", token, { httpOnly: false, maxAge: maxAge * 1000 });
    res.status(200).json({ 
      user: user._id, 
      isAdmin: false,
      status: true 
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
