const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// Sous-schéma pour les langues
const languageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Language name is required"],
  },
  level: {
    type: String,
    required: [true, "Language level is required"],
    enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
  }
});

// Sous-schéma pour les certifications
const certificationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Certification name is required"],
  },
  issuer: {
    type: String,
    required: [true, "Issuing organization is required"],
  },
  date: {
    type: Date,
    required: [true, "Certification date is required"],
  },
  credentialId: {
    type: String,
  },
  credentialUrl: {
    type: String,
  }
});

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Email is Required"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Password is Required"],
  },
  firstName: {
    type: String,
    required: [true, "First Name is Required"],
  },
  lastName: {
    type: String,
    required: [true, "Last Name is Required"],
  },
  governorate: {
    type: String,
    required: [true, "Governorate is Required"],
  },
  experienceLevel: {
    type: String,
  },
  employmentTypes: {
    type: [String],
  },
  desiredJobTitle: {
    type: String,
  },
  selectedDomains: {
    type: [String],
  },
  country: {
    type: String,
    default: 'Tunisie',
    required: [true, "Country is Required"],
  },
  city: {
    type: String,
    required: [true, "City is Required"],
  },
  zipCode: {
    type: String,
  },
  address: {
    type: String,
  },
  mobileNumber: {
    type: String,
    required: [true, "Mobile Number is Required"],
  },
  yearsOfExperience: {
    type: String,
  },
  diplomaSpecialty: {
    type: String,
    required: [true, "Diploma/Specialty is Required"],
  },
  university: {
    type: String,
    required: [true, "University is Required"],
  },
  studyStartDate: {
    type: String,
  },
  studyEndDate: {
    type: String,
  },
  isCurrentlyStudying: {
    type: Boolean,
  },
  cv: {
    data: Buffer,        // Le fichier CV lui-même
    contentType: String, // Le type MIME du fichier (pdf, doc, etc.)
    fileName: String     // Le nom original du fichier
  },
  languages: [languageSchema],
  certifications: [certificationSchema],
  profilePicture: {
    data: Buffer,         // Les données binaires de l'image
    contentType: String,  // Le type MIME de l'image (jpeg, png, etc.)
  }
});

userSchema.pre("save", async function (next) {
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.statics.login = async function (email, password) {
  const user = await this.findOne({ email });
  if (user) {
    const auth = await bcrypt.compare(password, user.password);
    if (auth) {
      return user;
    }
    throw Error("incorrect password");
  }
  throw Error("incorrect email");
};

module.exports = mongoose.model("Users", userSchema);