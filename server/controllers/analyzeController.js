const { spawn } = require('child_process');
const pdfParse = require('pdf-parse');
const JobOffer = require('../model/JobOfferModel'); // adapte le chemin selon ton projet
const User = require('../model/authModel');

const path = require('path');
const fs = require('fs');

const { runLlamaPrompt } = require('../../CvAnalyzer/llamaService');





exports.analyzeCv = async (req, res) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: 'Aucun fichier reçu.' });
  }

  try {
    const data = await pdfParse(file.buffer);
    const cvText = data.text.replace(/["$`\\]/g, ''); // Nettoyage simple

    // Récupérer les offres d’emploi en base
    const offers = await JobOffer.find();

    // Construire le prompt complet
    const prompt = `
Tu es un expert RH. Analyse ce CV et réponds aux points suivants :
1. Résume brièvement le profil.
2. Liste les points forts du candidat.
3. Liste les points faibles potentiels.
4. Donne une note globale sur 10.
5. Propose des pistes d'amélioration.

Voici le CV : ${cvText}


`;

    // Lancer ollama avec ce prompt
    const result = await new Promise((resolve, reject) => {
      const ollama = spawn('ollama', ['run', 'llama3']);
      let output = '';
      let errorOutput = '';

      ollama.stdout.on('data', (data) => output += data.toString());
      ollama.stderr.on('data', (data) => errorOutput += data.toString());

      ollama.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(errorOutput || `Ollama exited with code ${code}`));
          return;
        }
        resolve(output);
      });

      ollama.stdin.write(prompt);
      ollama.stdin.end();
    });

    // Répondre avec l’analyse et les recommandations
    res.json({ analysis: result });

  } catch (err) {
    console.error("Erreur lors de l’analyse ou recommandation :", err);
    res.status(500).json({ error: 'Erreur serveur lors de l’analyse' });
  }
};


exports.analyzeCandidates = async (req, res) => {
  const offerId = req.params.id;
  console.log('🔍 Analyse des candidats pour l’offre ID :', offerId);

  try {
    // 1. Vérifie si l'offre existe
    const offer = await JobOffer.findById(offerId);
    if (!offer) {
      console.log('❌ Offre non trouvée');
      return res.status(404).json({ error: 'Offre non trouvée' });
    }

    // 2. Utilise directement les IDs des candidats dans offer.candidates
    const candidates = await User.find({
      _id: { $in: offer.candidates },
      role: 'candidate' // ⚠️ "candidate" au singulier
    });

    if (!candidates.length) {
      console.log('⚠️ Aucun candidat trouvé pour cette offre');
      return res.status(404).json({ error: 'Aucun candidat trouvé pour cette offre' });
    }

    console.log(`✅ ${candidates.length} candidat(s) trouvé(s)`);

    const candidateResults = [];

    for (const user of candidates) {
      const candidateName = `${user.firstName}`;
      const cvAnalyses = [];

      for (const cv of user.cv || []) {
        if (!cv.fileName) continue;

        if (!cv.data || !cv.data.buffer) {
  console.log(`⚠️ Données CV absentes pour : ${cv.fileName}`);
  continue;
}

const buffer = cv.data.buffer; // buffer de MongoDB
console.log(`✅ Lecture du buffer MongoDB : ${cv.fileName}`);

        const pdfData = await pdfParse(buffer);
        const cleanText = pdfData.text.replace(/["$`\\]/g, '');

        const prompt = `
Voici une offre d’emploi :
Titre : ${offer.jobTitle}
Description : ${offer.jobDescription}

Voici un CV :
"""${cleanText}"""

Analyse ce CV par rapport à l’offre ci-dessus. Évalue :
- L’expérience globale
- La pertinence pour le poste
- Les points forts
- Les points faibles

Donne une note sur 10 pour la compatibilité
 Finalement dit quelle est le condidat qui des experiencces plus que les autres   
`;

        const analysis = await runLlamaPrompt(prompt);
        cvAnalyses.push({ file: cv.fileName, analysis });
      }

      candidateResults.push({
        candidateId: user._id,
        candidateName,
        analyses: cvAnalyses,
      });
    }

    // 3. Calcul des scores
    const scoredCandidates = candidateResults.map((c) => {
      let scoreSum = 0;
      let count = 0;

      c.analyses.forEach((a) => {
        const match = a.analysis.match(/(?:note|score)\s*[:=]?\s*(\d+(?:\.\d+)?)/i);
        if (match) {
          scoreSum += parseFloat(match[1]);
          count++;
        }
      });

      const averageScore = count > 0 ? (scoreSum / count).toFixed(2) : 0;
      return {
        candidateId: c.candidateId,
        candidateName: c.candidateName,
        averageScore,
        rawAnalyses: c.analyses,
      };
    });

    scoredCandidates.sort((a, b) => b.averageScore - a.averageScore);

    console.log('✅ Analyse terminée avec succès.');
    res.json({
      bestCandidate: scoredCandidates[0],
      allCandidates: scoredCandidates,
    });

  } catch (err) {
    console.error('❌ Erreur serveur lors de l’analyse des candidats:', err);
    res.status(500).json({ error: 'Erreur serveur lors de l’analyse des candidats' });
  }
};


exports.analyzeCvAndMatchOffers = async (req, res) => {
  try {
    if (!req.file) {
      console.log("❌ Aucun fichier reçu dans la requête.");
      return res.status(400).json({ error: 'Aucun fichier reçu' });
    }

    console.log("📥 Fichier CV reçu. Lecture du contenu PDF...");

    const cvBuffer = req.file.buffer;
    const base64Buffer = cvBuffer.toString('base64');
    const pdfData = await pdfParse(cvBuffer);
    const cvText = pdfData.text.replace(/["$`\\]/g, '');
    console.log("📄 Contenu extrait du PDF.");

    // Étape 1 : Analyse IA globale
    console.log("🧠 Envoi du contenu du CV pour analyse générale...");
    const globalPrompt = `
Voici le contenu du CV :
"""${cvText}"""

Analyse ce CV et donne un résumé clair des compétences principales, des métiers potentiels, et des points forts du candidat.
`;
    const analysis = await runLlamaPrompt(globalPrompt);
    console.log("✅ Analyse IA globale du CV terminée.");

    // Étape 2 : Matching avec les offres
    console.log("📊 Recherche des offres compatibles...");
    const offers = await JobOffer.find({
      jobTitle: { $exists: true, $ne: null },
      jobDescription: { $exists: true, $ne: null }
    });

    const scoredOffers = [];

    for (let i = 0; i < offers.length; i++) {
      const offer = offers[i];
      console.log(`🔍 Comparaison ${i + 1}/${offers.length} : "${offer.jobTitle}"`);

      const matchPrompt = `
Voici un CV :
"""${cvText}"""

Voici une offre d'emploi :
Titre : ${offer.jobTitle}
Description : ${offer.jobDescription}

Évalue la compatibilité de ce CV avec cette offre. Donne une note sur 10 et explique brièvement pourquoi.
`;

      const matchAnalysis = await runLlamaPrompt(matchPrompt);
      const scoreMatch = matchAnalysis.match(/(?:note|score)\s*[:=]?\s*(\d+(?:\.\d+)?)/i);
      const score = scoreMatch ? parseFloat(scoreMatch[1]) : 0;

      scoredOffers.push({
        _id: offer._id,
        jobTitle: offer.jobTitle,
        jobDescription: offer.jobDescription,
        compatibilityScore: score,
        aiAnalysis: matchAnalysis.trim(),
      });
    }

    console.log("✅ Matching des offres terminé. Tri des résultats...");
    scoredOffers.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
    const top5 = scoredOffers.slice(0, 5);

    res.json({
      analysis,
      topOffers: top5,
       cvBufferBase64: base64Buffer,
    });

  } catch (err) {
    console.error('❌ Erreur pendant analyse/matching du CV :', err);
    res.status(500).json({ error: 'Erreur serveur pendant l’analyse' });
  }
};
