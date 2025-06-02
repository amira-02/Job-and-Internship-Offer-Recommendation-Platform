const express = require('express');
const router = express.Router();
const jobOfferController = require('../controllers/jobOfferController');
const auth = require('../middleware/auth');

// Route pour obtenir toutes les offres (publique)
router.get('/', jobOfferController.getAllJobOffers);

// Route pour rechercher des offres (publique)
router.get('/search', jobOfferController.searchJobOffers);

// Route pour obtenir une offre spécifique par ID (publique)
router.get('/:id', jobOfferController.getJobOfferById);

// Routes protégées par l'authentification
router.post('/', auth, jobOfferController.createJobOffer);
router.get('/employer', auth, jobOfferController.getEmployerJobOffers);
router.put('/:id', auth, jobOfferController.updateJobOffer);
router.delete('/:id', auth, jobOfferController.deleteJobOffer);

module.exports = router; 