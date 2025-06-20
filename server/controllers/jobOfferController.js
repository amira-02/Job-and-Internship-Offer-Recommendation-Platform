const JobOffer = require('../model/JobOfferModel');

const User = require('../model/authModel');
const LlamaService = require('../../CvAnalyzer/llamaService');



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
  console.log('Requête reçue pour l’ID:', req.params.id);  // <-- ajoute ça
  try {
    const jobOffer = await JobOffer.findById(req.params.id).select('-__v');
    if (!jobOffer) {
      return res.status(404).json({ message: 'Offre non trouvée' });
    }
    res.status(200).json(jobOffer);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'offre:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération de l\'offre', error: error.message });
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
  const { id } = req.params; // offerId
  const { decision, userId, email, firstName } = req.body;
   console.log("Reçu dans le corps de la requête :", req.body);

  if (!['accepted', 'rejected'].includes(decision)) {
    return res.status(400).json({ message: "Décision invalide" });
  }
      

  if (!userId || !email || !firstName) {
    return res.status(400).json({ message: "Données incomplètes pour traiter la décision." });
  }
  
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    if (!user.appliedOffers || !Array.isArray(user.appliedOffers)) {
      return res.status(400).json({ message: "Aucune candidature trouvée pour cet utilisateur." });
    }
console.log("Liste des candidatures de l'utilisateur :", user.appliedOffers);

    // Trouver l'offre correspondante
const application = user.appliedOffers.find(app => app._id.toString() === id);


    if (!application) {
      return res.status(404).json({ message: "Candidature non trouvée" });
    }

    // Ajouter ou mettre à jour le statut
    application.status = decision;

    await user.save();

    try {
      // Optionnel : Récupérer les infos de l'offre si tu veux les inclure dans l'email
      const offer = await JobOffer.findById(id);
      const offerTitle = offer?.title || "your job offer";

      if (decision === 'accepted') {
        await sendAcceptanceEmail(email, firstName, offerTitle);
      } else {
        await sendRejectionEmail(email, firstName, offerTitle);
      }
    } catch (emailError) {
      console.error("Erreur lors de l'envoi de l'email :", emailError);
      return res.status(500).json({ message: "Statut mis à jour, mais erreur lors de l'envoi de l'email." });
    }

    res.status(200).json({ message: `Statut '${decision}' mis à jour et email envoyé.` });

  } catch (error) {
    console.error("Erreur lors du traitement :", error);
    res.status(500).json({ message: "Erreur lors du traitement de la décision." });
  }
};

exports.getUserAppliedOffers = async (req, res) => {
  try {
    console.log("✅ Utilisateur connecté dans controller :", req.user);

    // Récupère l'utilisateur
    const user = await User.findById(req.user.id);
    if (!user || !user.appliedOffers || user.appliedOffers.length === 0) {
      return res.status(404).json({ message: "Aucune candidature trouvée" });
    }

    // Récupère chaque offre par _id (car offerId n'existe pas dans ta base actuelle)
    const offers = await Promise.all(
      user.appliedOffers.map(async (app) => {
        const offer = await JobOffer.findById(app._id);
        if (!offer) return null;
        return {
          _id: offer._id,
          title: offer.jobTitle || offer.title || "Titre inconnu",
          company: offer.company || "Entreprise inconnue",
          status: app.status || "pending"
        };
      })
    );

    // Supprime les nulls
    const filteredOffers = offers.filter(o => o !== null);

    res.status(200).json(filteredOffers);
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des candidatures:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};



// exports.getRecommendations = async (req, res) => {
//   try {
//     const { analysis } = req.body;
//     if (!analysis) return res.status(400).json({ error: 'Missing CV analysis' });

//     const offers = await JobOffer.find();

//     const prompt = `
// Tu es un assistant de recrutement. Voici le CV résumé :
// """
// ${analysis}
// """
// Voici les offres d'emploi disponibles :
// ${offers.map((offer, i) => `\nOffre ${i + 1}:\nTitre: ${offer.jobTitle}\nDescription: ${offer.jobDescription}`).join('\n')}

// Donne-moi les 3 offres les plus compatibles avec ce CV et explique pourquoi.
// `;

//     const response = await LlamaService.runPrompt(prompt);

//     res.json({ recommendations: response });
//   } catch (error) {
//     console.error('Erreur dans getRecommendations:', error);
//     res.status(500).json({ error: 'Erreur serveur lors de la recommandation' });
//   }
// };
exports.getRecommendations = async (req, res) => {
  try {
    const { analysis } = req.body;
    if (!analysis) return res.status(400).json({ error: 'Missing CV analysis' });

    const offers = await JobOffer.find();

    const response = await LlamaService.runPrompt(analysis, offers);

    res.json({ recommendations: response });
  } catch (error) {
    console.error('Erreur dans getRecommendations:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la recommandation' });
  }
};


