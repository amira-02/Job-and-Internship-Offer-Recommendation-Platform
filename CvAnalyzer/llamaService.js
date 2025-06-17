const { exec } = require('child_process');

const prompt = 'analyse ce cv donne les point fort et faible et ce que je doit faire por lameliorer ';

exec(`ollama run llama3 "${prompt.replace(/"/g, '\\"')}"`, (error, stdout, stderr) => {
  if (error) {
    console.error('Erreur Ollama:', error);
    return;
  }
  if (stderr) {
    console.error('stderr Ollama:', stderr);
    return;
  }
  console.log('Réponse Ollama:', stdout);
});
