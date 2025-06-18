const { spawn } = require('child_process');
const pdfParse = require('pdf-parse');
const JobOffer = require('../model/JobOfferModel'); // adapte le chemin selon ton projet

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
Tu es un expert en recrutement. Lis ce CV résumé : """
${cvText}
"""

Fais-moi un résumé clair du profil, les points forts, les points faibles, les conseils pour améliorer ce CV.

Voici les offres d’emploi disponibles :
${offers.map((o, i) => 
  `Offre ${i + 1} - ID: ${o._id}\nTitre: ${o.jobTitle}\nDescription: ${o.jobDescription}`
).join('\n\n')}


Donne-moi les 3 offres les plus compatibles avec ce CV et explique pourquoi.
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
