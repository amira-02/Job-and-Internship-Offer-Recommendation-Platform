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
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address']
  },
  password: {
    type: String,
    required: [true, "Password is Required"],
  },
  role: {
    type: String,
    enum: ['candidate', 'employer'],
    default: 'candidate'
  },
  // Champs communs
  firstName: {
    type: String,
    required: [true, "First Name is Required"],
  },
  lastName: {
    type: String,
    required: [true, "Last Name is Required"],
  },
  // Champs spécifiques aux employeurs
  companyName: {
    type: String,
    required: function() {
      return this.role === 'employer';
    }
  },
  website: {
    type: String,
    trim: true
  },
  mobileNumber: {
    type: String,
    required: function() {
      return this.role === 'employer';
    }
  },
  city: {
    type: String,
    required: function() {
      return this.role === 'employer';
    }
  },
  description: {
    type: String
  },
  // Champs spécifiques aux candidats
  governorate: {
    type: String,
    required: function() {
      return this.role === 'candidate';
    }
  },
  country: {
    type: String,
    default: 'Tunisie'
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
  zipCode: {
    type: String,
  },
  address: {
    type: String,
  },
  yearsOfExperience: {
    type: String,
  },
  diplomaSpecialty: {
    type: String,
    required: function() {
      return this.role === 'candidate';
    }
  },
  university: {
    type: String,
    required: function() {
      return this.role === 'candidate';
    }
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
    data: Buffer,
    contentType: String,
    fileName: String
  },
  profilePicture: {
    data: Buffer,
    contentType: String,
  },
  logo: {
    data: Buffer,
    contentType: String
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  agreement: {
    type: Boolean,
    required: function() {
      return this.role === 'employer';
    },
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  languages: [languageSchema],
  certifications: [certificationSchema]
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