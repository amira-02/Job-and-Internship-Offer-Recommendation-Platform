// const express = require('express');
// const router = express.Router();
// const multer = require('multer');
// const { spawn } = require('child_process');
// const path = require('path');
// const fs = require('fs');

// const upload = multer({ dest: 'uploads/' });

// router.post('/analyze-cv', upload.single('cv'), (req, res) => {
//   const filePath = path.resolve(req.file.path);

//   const python = spawn('python3', ['CvAnalyzer/main.py', filePath]);

//   let data = '';

//   python.stdout.on('data', (chunk) => {
//     data += chunk.toString();
//   });

//   python.stderr.on('data', (error) => {
//     console.error(`Erreur Python: ${error}`);
//   });

//   python.on('close', (code) => {
//     fs.unlinkSync(filePath); // nettoyer le fichier après traitement

//     if (code !== 0) {
//       return res.status(500).json({ error: 'Erreur lors de l’analyse du CV.' });
//     }

//     try {
//       const result = JSON.parse(data);
//       res.json(result);
//     } catch (e) {
//       res.status(500).json({ error: 'Impossible de parser la réponse de l’analyse.' });
//     }
//   });
// });

// module.exports = router;

const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();
const analyzeController = require('../controllers/analyzeController');

router.post('/analyze-cv', upload.single('file'), analyzeController.analyzeCv);

module.exports = router;



