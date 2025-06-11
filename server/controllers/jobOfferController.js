const JobOffer = require('../model/JobOfferModel');

const User = require('../model/authModel');

const { sendConfirmationEmail,sendAcceptanceEmail, sendRejectionEmail } = require('../middleware/Email');




exports.applyToJobOffer = async (req, res) => {
  const { id } = req.params;
  const { email } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ email, appliedOffers: [] });
      await user.save();
    }
    const offer = await JobOffer.findById(id);
    if (!offer) return res.status(404).json({ message: 'Offre non trouvée' });

    if (!user.appliedOffers.includes(id)) {
      user.appliedOffers.push(id);
      await user.save();
    }
    if (!offer.candidates.includes(user._id)) {
      offer.candidates.push(user._id);
      await offer.save();
    }

await sendConfirmationEmail(email, offer.title || offer.jobTitle)

    res.json({ message: 'Candidature envoyée avec succès' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

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
    console.log('Recherche backend - Terme reçu:', query); // Log le terme de recherche reçu
    let searchQuery = {};

    // Utiliser la recherche textuelle MongoDB si un terme de recherche est présent
    if (query) {
      searchQuery.$text = { $search: query };
       // Ancienne recherche $regex (commentée)
       /*
       searchQuery.jobTitle = { $regex: query, $options: 'i' };
       // Ancienne recherche $or sur plusieurs champs (commentée)
       /*
       searchQuery.$or = [
           { jobTitle: { $regex: query, $options: 'i' } },
           { jobDescription: { $regex: query, $options: 'i' } },
           { jobCategory: { $regex: query, $options: 'i' } },
           { skills: { $regex: query, $options: 'i' } }
       ];
       */
    }

    // Ajout des autres filtres si présents
    if (location) {
      searchQuery.address = new RegExp(location, 'i'); // Assumer que la recherche de localisation est sur l'adresse
    }

    // Les filtres par type et expérience sont déjà gérés côté client dans Offers.jsx,
    // nous ne les incluons donc pas ici pour l'instant si la recherche principale est textuelle.

    console.log('Recherche backend - Objet de requête Mongoose:', searchQuery); // Log l'objet de requête construit

    // Pour la recherche textuelle, on peut aussi trier par pertinence si nécessaire, mais gardons le tri par date pour l'instant.
    const jobOffers = await JobOffer.find(searchQuery)
      .sort({ createdAt: -1 }) // Peut être remplacé par { score: { $meta: "textScore" } } pour trier par pertinence
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

// Créer une nouvelle offre d'emploi
exports.createJobOffer = async (req, res) => {
  try {
    console.log('Données reçues:', req.body);
    console.log('User ID:', req.user.id);

    const {
      jobTitle,
      jobDescription,
      jobCategory,
      jobType,
      salaryPeriod,
      minSalary,
      maxSalary,
      skills,
      experienceLevel,
      address,
      country
    } = req.body;

    // Vérification des données requises
    if (!jobTitle || !jobDescription || !jobCategory || !jobType || !salaryPeriod || 
        !minSalary || !maxSalary || !skills || !experienceLevel || !address || !country) {
      console.log('Données manquantes:', {
        jobTitle: !jobTitle,
        jobDescription: !jobDescription,
        jobCategory: !jobCategory,
        jobType: !jobType,
        salaryPeriod: !salaryPeriod,
        minSalary: !minSalary,
        maxSalary: !maxSalary,
        skills: !skills,
        experienceLevel: !experienceLevel,
        address: !address,
        country: !country
      });
      return res.status(400).json({
        message: 'Tous les champs requis doivent être remplis',
        missingFields: {
          jobTitle: !jobTitle,
          jobDescription: !jobDescription,
          jobCategory: !jobCategory,
          jobType: !jobType,
          salaryPeriod: !salaryPeriod,
          minSalary: !minSalary,
          maxSalary: !maxSalary,
          skills: !skills,
          experienceLevel: !experienceLevel,
          address: !address,
          country: !country
        }
      });
    }

    // Créer la nouvelle offre avec l'ID de l'employeur
    const jobOffer = new JobOffer({
      employer: req.user.id,
      jobTitle,
      jobDescription,
      jobCategory,
      jobType,
      salaryPeriod,
      minSalary,
      maxSalary,
      skills,
      experienceLevel,
      address,
      country
    });

    console.log('Tentative de sauvegarde de l\'offre:', jobOffer);
    await jobOffer.save();
    console.log('Offre sauvegardée avec succès');

    res.status(201).json({
      message: 'Offre d\'emploi créée avec succès',
      jobOffer
    });
  } catch (error) {
    console.error('Erreur détaillée lors de la création de l\'offre:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code
    });
    res.status(500).json({
      message: 'Erreur lors de la création de l\'offre',
      error: error.message
    });
  }
};

// Obtenir toutes les offres d'un employeur
exports.getEmployerJobOffers = async (req, res) => {
  try {
    const jobOffers = await JobOffer.find({ employer: req.user.id })
      .sort({ createdAt: -1 });

    res.json(jobOffers);
  } catch (error) {
    console.error('Erreur lors de la récupération des offres:', error);
    res.status(500).json({
      message: 'Erreur lors de la récupération des offres',
      error: error.message
    });
  }
};

// Mettre à jour une offre d'emploi
exports.updateJobOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const jobOffer = await JobOffer.findOneAndUpdate(
      { _id: id, employer: req.user.id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!jobOffer) {
      return res.status(404).json({
        message: 'Offre non trouvée ou vous n\'êtes pas autorisé à la modifier'
      });
    }

    res.json({
      message: 'Offre mise à jour avec succès',
      jobOffer
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'offre:', error);
    res.status(500).json({
      message: 'Erreur lors de la mise à jour de l\'offre',
      error: error.message
    });
  }
};

// Supprimer une offre d'emploi
exports.deleteJobOffer = async (req, res) => {
  try {
    const { id } = req.params;

    const jobOffer = await JobOffer.findOneAndDelete({
      _id: id,
      employer: req.user.id
    });

    if (!jobOffer) {
      return res.status(404).json({
        message: 'Offre non trouvée ou vous n\'êtes pas autorisé à la supprimer'
      });
    }

    res.json({
      message: 'Offre supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'offre:', error);
    res.status(500).json({
      message: 'Erreur lors de la suppression de l\'offre',
      error: error.message 
    });
  }
}; 

exports.getOfferCandidates = async (req, res) => {
  try {
    const offer = await JobOffer.findById(req.params.id).populate('candidates');
    if (!offer) return res.status(404).json({ message: 'Offre non trouvée' });
    res.json({ candidates: offer.candidates });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};



exports.handleCandidateDecision = async (req, res) => {
  const { id } = req.params; // ID de la candidature
  const { decision, email, firstName,offerTitle } = req.body; // 'accepted' ou 'rejected'

  try {
    if (decision === 'accepted') {
      await sendAcceptanceEmail(email, firstName, offerTitle);
    } else if (decision === 'rejected') {
      await sendRejectionEmail(email,firstName, offerTitle);
    } else {
      return res.status(400).json({ message: "Décision invalide" });
    }

    // Ici tu peux aussi mettre à jour le statut de la candidature en DB si tu veux

    res.status(200).json({ message: `Email de ${decision} envoyé.` });
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email :", error);
    res.status(500).json({ message: "Erreur lors du traitement de la décision." });
  }
};