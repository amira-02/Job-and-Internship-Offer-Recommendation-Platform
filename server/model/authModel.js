const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

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
  firstName: {
    type: String,
    required: [true, "First Name is Required"],
  },
  governorate: {
    type: String,
    required: [true, "Governorate is Required"],
  },
  city: {
    type: String,
  },
  postalCode: {
    type: String,
  },
  address: {
    type: String,
  },
  role: {
    type: String,
    enum: ['candidate', 'employer'],
    default: 'candidate'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin:{
    type:Date,
    default:Date.now
},
isVerified:{
    type:Boolean,
    default:false
},
resetPasswordToken:String,
resetPasswordExpiresAt:Date,
verificationToken:String,
verificationTokenExpiresAt:Date,
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
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