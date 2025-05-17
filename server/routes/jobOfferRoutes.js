const express = require('express');
const router = express.Router();
const jobOfferController = require('../controllers/jobOfferController');

// Route pour obtenir toutes les offres
router.get('/', jobOfferController.getAllJobOffers);

// Route pour rechercher des offres
router.get('/search', jobOfferController.searchJobOffers);

// Route pour obtenir une offre spécifique par ID
router.get('/:id', jobOfferController.getJobOfferById);

module.exports = router; 