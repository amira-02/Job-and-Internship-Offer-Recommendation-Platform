// const mongoose = require('mongoose');

// const jobOfferSchema = new mongoose.Schema({
//   title: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   company: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   location: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   description: {
//     type: String,
//     required: true
//   },
//   contractType: {
//     type: String,
//     trim: true
//   },
//   postedDate: {
//     type: Date,
//     default: Date.now
//   },
//   sourceUrl: {
//     type: String,
//     required: true,
//     unique: true
//   },
//   salary: {
//     type: String,
//     trim: true
//   },
//   experience: {
//     type: String,
//     trim: true
//   }
// }, {
//   timestamps: true
// });

// // Index pour améliorer les performances de recherche
// jobOfferSchema.index({ title: 'text', company: 'text', description: 'text' });

// const JobOffer = mongoose.model('JobOffer', jobOfferSchema);

// module.exports = JobOffer; 