from flask import Flask, render_template, request
from PyPDF2 import PdfReader
import subprocess
import os

app = Flask(__name__)
UPLOAD_FOLDER = 'cv_storage'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Page d'accueil avec upload
@app.route('/')
def upload_form():
    return render_template('upload.html')

# Traitement du CV
@app.route('/upload', methods=['POST'])
def upload_file():
    file = request.files['file']
    if file and file.filename.endswith('.pdf'):
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(filepath)

        # Extraire texte
        reader = PdfReader(filepath)
        text = ""
        for page in reader.pages:
            text += page.extract_text()

        # Prompt pour le modèle
        prompt = f"""
Tu es un expert RH. Analyse ce CV et réponds aux points suivants :
1. Résume brièvement le profil.
2. Liste les points forts du candidat.
3. Liste les points faibles potentiels.
4. Donne une note globale sur 10.
5. Propose des pistes d'amélioration.

Voici le CV : {text}
"""

        # Envoie au modèle local LLaMA 3 via Ollama
        result = subprocess.run(
            ['ollama', 'run', 'llama3'],
            input=prompt,
            capture_output=True,
            text=True
        )

        output = result.stdout
        return f"<h2>Analyse du CV :</h2><pre>{output}</pre>"

    return "Fichier invalide. Veuillez envoyer un PDF."

if __name__ == '__main__':
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    app.run(debug=True)
