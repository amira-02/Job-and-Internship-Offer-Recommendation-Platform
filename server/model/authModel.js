const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const appliedOfferSchema = new mongoose.Schema({
  offerId: { type: mongoose.Schema.Types.ObjectId, ref: "JobOffer", required: true },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  },
});

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Email is Required"],
    unique: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email address"],
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
    required: false,
  },
  city: {
    type: String,
    required: false,
  },
  postalCode: {
    type: String,
  },
  address: {
    type: String,
  },
  role: {
    type: String,
    enum: ["candidate", "employer"],
    default: "candidate",
  },
  profilePicture: {
    data: Buffer,
    contentType: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastLogin: {
    type: Date,
    default: Date.now,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  resetPasswordToken: String,
  resetPasswordExpiresAt: Date,
  verificationToken: String,
  verificationTokenExpiresAt: Date,
  companyName: {
    type: String,
  },
  fullName: {
    type: String,
  },
  phone: {
    type: String,
  },
  location: {
    type: String,
  },
  website: {
    type: String,
  },
  description: {
    type: String,
  },
  cv: [
    {
      data: Buffer,
      contentType: String,
      fileName: String,
      uploadedAt: { type: Date, default: Date.now },
    },
  ],
  appliedOffers: [appliedOfferSchema],  // <-- MODIFIE ICI
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
