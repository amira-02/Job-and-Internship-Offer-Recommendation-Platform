const { spawn } = require('child_process');

function runLlamaPrompt(prompt) {
  return new Promise((resolve, reject) => {
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
        return reject(new Error(errorOutput || `Ollama exited with code ${code}`));
      }
      resolve(output);
    });

    ollama.stdin.write(prompt);
    ollama.stdin.end();
  });
}

module.exports = {
  runLlamaPrompt,
};
