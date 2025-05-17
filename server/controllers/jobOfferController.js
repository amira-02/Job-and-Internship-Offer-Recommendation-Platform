const JobOffer = require('../model/JobOffer');

// Récupérer toutes les offres d'emploi
exports.getAllJobOffers = async (req, res) => {
  try {
    const jobOffers = await JobOffer.find()
      .sort({ postedDate: -1 }) // Trier par date de publication décroissante
      .select('-__v'); // Exclure le champ __v

    res.status(200).json(jobOffers);
  } catch (error) {
    console.error('Erreur lors de la récupération des offres:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la récupération des offres',
      error: error.message 
    });
  }
};

// Récupérer une offre d'emploi par son ID
exports.getJobOfferById = async (req, res) => {
  try {
    const jobOffer = await JobOffer.findById(req.params.id).select('-__v');
    
    if (!jobOffer) {
      return res.status(404).json({ message: 'Offre non trouvée' });
    }

    res.status(200).json(jobOffer);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'offre:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la récupération de l\'offre',
      error: error.message 
    });
  }
};

// Rechercher des offres d'emploi
exports.searchJobOffers = async (req, res) => {
  try {
    const { query, location, contractType } = req.query;
    let searchQuery = {};

    if (query) {
      searchQuery.$text = { $search: query };
    }

    if (location) {
      searchQuery.location = new RegExp(location, 'i');
    }

    if (contractType) {
      searchQuery.contractType = new RegExp(contractType, 'i');
    }

    const jobOffers = await JobOffer.find(searchQuery)
      .sort({ postedDate: -1 })
      .select('-__v');

    res.status(200).json(jobOffers);
  } catch (error) {
    console.error('Erreur lors de la recherche des offres:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la recherche des offres',
      error: error.message 
    });
  }
}; 