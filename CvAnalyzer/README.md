# Job and Internship Offer Recommendation Platform

Une plateforme d'analyse de CV utilisant l'IA pour évaluer et recommander des offres d'emploi et de stage.

## Fonctionnalités

- Analyse de CV (PDF, DOCX, TXT)
- Évaluation des points forts et faibles
- Recommandations personnalisées
- Score global
- Mots-clés suggérés

## Prérequis

- Python 3.8+
- Ollama (https://ollama.ai/)

## Installation

1. Clonez le dépôt :
```bash
git clone https://github.com/amira-02/Job-and-Internship-Offer-Recommendation-Platform.git
cd Job-and-Internship-Offer-Recommendation-Platform
```

2. Créez un environnement virtuel et installez les dépendances :
```bash
python -m venv venv
source venv\Scripts\activate
pip install -r requirements.txt
```

3. Installez et configurez Ollama :
- Téléchargez Ollama depuis https://ollama.ai/
- Installez Ollama
- Téléchargez le modèle Mistral :
```bash
ollama pull mistral
```

## Utilisation

1. Démarrez le serveur Ollama (démarre automatiquement après l'installation)

2. Lancez l'application :
```bash
python CvAnalyzer/main.py
```

3. Accédez à l'application :
- http://localhost:8080

4. Pour analyser un CV :
- Envoyez une requête POST à http://localhost:8080/analyze-cv/
- Format accepté : PDF, DOCX, TXT

## Structure du Projet

```
Job-and-Internship-Offer-Recommendation-Platform/
├── CvAnalyzer/
│   └── main.py
├── requirements.txt
├── .gitignore
└── README.md
```

## API Endpoints

- GET `/` : Vérifie si le serveur est en ligne
- POST `/analyze-cv/` : Analyse un CV et retourne une évaluation détaillée

## Format de Réponse

```json
{
    "status": "success",
    "message": "Analyse CV réussie",
    "analysis": {
        "pointsForts": ["..."],
        "pointsFaibles": ["..."],
        "recommandations": ["..."],
        "scoreGlobal": number,
        "motsClesSuggérés": ["..."]
    }
}
```

## Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## Licence

MIT

