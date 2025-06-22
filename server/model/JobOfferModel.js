const mongoose = require('mongoose');

const jobOfferSchema = new mongoose.Schema({
  employer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  jobTitle: {
    type: String,
    required: true,
    trim: true
  },
  jobDescription: {
    type: String,
    required: true
  },
  jobCategory: {
    type: String,
    required: true
  },
  jobType: {
    type: String,
    required: true,
    enum: ['Full Time', 'Part Time', 'Freelance', 'Internship', 'Contract']
  },
  salaryPeriod: {
    type: String,
    required: true,
    enum: ['monthly', 'yearly', 'hourly']
  },
  minSalary: {
    type: Number,
    required: true
  },
  maxSalary: {
    type: Number,
    required: true
  },
  skills: [{
    type: String,
    trim: true
  }],
  experienceLevel: {
    type: String,
    required: true,
    enum: ['Entry Level', 'Associate', 'Mid-Senior Level', 'Director', 'Executive']
  },
  address: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  },
  sourceUrl: {
    type: String,
    // unique: true,
    sparse: true  // Permet les valeurs null
  },
  status: {
    type: String,
    enum: ['active', 'closed', 'draft'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  candidates: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Users' }],
});

// Ajouter un index textuel pour la recherche
jobOfferSchema.index({ 
  jobTitle: 'text', 
  jobDescription: 'text', 
  jobCategory: 'text',
  skills: 'text'
});

// S'assurer que l'index textuel est créé ou mis à jour
jobOfferSchema.on('index', (error) => {
  if (error) {
    console.error('Erreur lors de la création ou mise à jour de l\'index textuel:', error);
  } else {
    console.log('Index textuel de JobOffer créé ou mis à jour avec succès.');
  }
});

// Mettre à jour updatedAt avant chaque sauvegarde
jobOfferSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const JobOffer = mongoose.model('JobOffer', jobOfferSchema);

module.exports = JobOffer; 