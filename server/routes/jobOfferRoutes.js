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
router.get('/user/applied', auth, jobOfferController.getUserAppliedOffers);
// Routes avec paramètres
router.get('/:id', jobOfferController.getJobOfferById);
router.put('/:id', auth, jobOfferController.updateJobOffer);
router.delete('/:id', auth, jobOfferController.deleteJobOffer);

router.post('/:id/apply', jobOfferController.applyToJobOffer);
router.get('/:id/candidates', jobOfferController.getOfferCandidates);
router.post('/:id/decision', jobOfferController.handleCandidateDecision);

router.patch("/users/:userId/applied-offers/:offerId/cancel", jobOfferController.cancelApplication);
router.get('/users/:id/photo', jobOfferController.getUserPhoto);


// router.get('/:id/analyze-candidates', jobOfferController.analyzeCandidates);

module.exports = router; 