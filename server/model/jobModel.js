// const mongoose = require('mongoose');

// const jobSchema = new mongoose.Schema({
//   employerId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   jobTitle: {
//     type: String,
//     required: true
//   },
//   jobType: {
//     type: String,
//     required: true,
//     enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Temporary']
//   },
//   location: {
//     type: String,
//     required: true
//   },
//   description: {
//     type: String,
//     required: true
//   },
//   requirements: {
//     type: String,
//     required: true
//   },
//   salary: {
//     type: String,
//     required: true
//   },
//   status: {
//     type: String,
//     enum: ['active', 'expired', 'closed', 'draft'],
//     default: 'active'
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now
//   },
//   updatedAt: {
//     type: Date,
//     default: Date.now
//   }
// });

// // Update the updatedAt timestamp before saving
// jobSchema.pre('save', function(next) {
//   this.updatedAt = Date.now();
//   next();
// });

// const Job = mongoose.model('Job', jobSchema);

// module.exports = Job; 