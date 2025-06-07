const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/authRoutes");
const employerRoutes = require("./routes/employerRoutes");
const jobOfferRoutes = require("./routes/jobOfferRoutes");
const multer = require("multer");
const path = require("path");

const app = express();

// Middleware de log pour voir les requêtes entrantes
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});

// Configuration de CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3001', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Configuration de Multer pour le stockage des fichiers
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  }
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/employer", employerRoutes);
app.use("/api/joboffers", jobOfferRoutes);

// Route de test
app.get("/", (req, res) => {
  res.json("Hello");
});

// Connexion à MongoDB
mongoose
  .connect("mongodb://127.0.0.1:27017/jobmatcher", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB - Database: jobmatcher");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
});

// Démarrage du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});