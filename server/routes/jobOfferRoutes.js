const express = require('express');
const router = express.Router();
const jobOfferController = require('../controllers/jobOfferController');
const auth = require('../middleware/auth');

// Route pour obtenir toutes les offres (publique)
router.get('/', jobOfferController.getAllJobOffers);

// Route pour rechercher des offres (publique)
router.get('/search', jobOfferController.searchJobOffers);

// Routes protégées par l'authentification
router.post('/', auth, jobOfferController.createJobOffer);
router.get('/employer', auth, jobOfferController.getEmployerJobOffers);

// Routes avec paramètres
router.get('/:id', jobOfferController.getJobOfferById);
router.put('/:id', auth, jobOfferController.updateJobOffer);
router.delete('/:id', auth, jobOfferController.deleteJobOffer);

module.exports = router; 