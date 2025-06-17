const { spawn } = require('child_process');
const pdfParse = require('pdf-parse');

exports.analyzeCv = async (req, res) => {
  console.log("📥 Réception de la requête d'analyse de CV...");

  const file = req.file;

  if (!file) {
    console.error("❌ Aucun fichier reçu.");
    return res.status(400).json({ error: 'Aucun fichier reçu.' });
  }

  try {
    const data = await pdfParse(file.buffer);
    const text = data.text.replace(/["$`\\]/g, ''); // Nettoyage basique

    console.log("🔍 Début de l'analyse avec Ollama...");

    const ollama = spawn('ollama', ['run', 'llama3']);

    let output = '';
    let errorOutput = '';

    ollama.stdout.on('data', (data) => {
      output += data.toString();
    });

    ollama.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    ollama.on('close', (code) => {
      if (code !== 0) {
        console.error(`❌ Ollama terminé avec code ${code}:`, errorOutput);
        return res.status(500).json({ error: errorOutput || 'Erreur lors de l\'analyse' });
      }
      console.log("✅ Analyse terminée.");
      res.json({ analysis: output });
    });

    // Envoyer le texte via stdin à la commande ollama
    ollama.stdin.write(text);
    ollama.stdin.end();

  } catch (err) {
    console.error("🚨 Erreur lors de l’analyse PDF :", err);
    res.status(500).json({ error: 'Échec de lecture du fichier PDF' });
  }
};
