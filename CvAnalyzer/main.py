from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import io
import PyPDF2
import docx
import os
import json
import base64
import logging
import re
from typing import List, Dict
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# MongoDB Configuration
try:
    MONGO_URI = "mongodb://localhost:27017"
    client = MongoClient(MONGO_URI)
    # Lister toutes les bases de données disponibles
    db_list = client.list_database_names()
    logger.info(f"Bases de données disponibles: {db_list}")
    
    # Utiliser la base de données jobmatcher
    db = client["jobmatcher"]
    # Lister toutes les collections
    collections = db.list_collection_names()
    logger.info(f"Collections dans jobmatcher: {collections}")
    
    jobs_collection = db["joboffers"]
    
    # Vérifier la connexion et le contenu de la base
    total_jobs = jobs_collection.count_documents({})
    logger.info(f"Connexion à MongoDB établie avec succès. Nombre d'offres trouvées: {total_jobs}")
    
    # Afficher la structure d'une offre pour vérification
    if total_jobs > 0:
        sample_job = jobs_collection.find_one()
        logger.info(f"Structure d'une offre: {sample_job}")
    else:
        logger.warning("Aucune offre trouvée dans la collection joboffers")
except Exception as e:
    logger.error(f"Erreur de connexion à MongoDB: {str(e)}")
    raise

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Extract text from PDF
async def extract_text_from_pdf(file_content: bytes) -> str:
    pdf_file = io.BytesIO(file_content)
    pdf_reader = PyPDF2.PdfReader(pdf_file)
    text = ""
    for page in pdf_reader.pages:
        text += page.extract_text()
    return text

# Extract text from DOCX
async def extract_text_from_docx(file_content: bytes) -> str:
    docx_file = io.BytesIO(file_content)
    doc = docx.Document(docx_file)
    text = ""
    for paragraph in doc.paragraphs:
        text += paragraph.text + "\n"
    return text

# Compétences techniques courantes
TECHNICAL_SKILLS = {
    "programming": ["python", "java", "javascript", "c++", "c#", "php", "ruby", "swift", "kotlin", "go", "rust"],
    "web": ["html", "css", "react", "angular", "vue", "node.js", "express", "django", "flask", "spring"],
    "database": ["mysql", "postgresql", "mongodb", "sql", "nosql", "redis", "oracle"],
    "devops": ["docker", "kubernetes", "aws", "azure", "gcp", "jenkins", "git", "ci/cd"],
    "mobile": ["android", "ios", "react native", "flutter", "xamarin"],
    "ai_ml": ["tensorflow", "pytorch", "scikit-learn", "machine learning", "deep learning", "nlp", "computer vision"]
}

# Compétences non-techniques courantes
SOFT_SKILLS = [
    "communication", "leadership", "teamwork", "problem solving", "time management",
    "adaptability", "creativity", "critical thinking", "emotional intelligence",
    "project management", "negotiation", "presentation", "analytical thinking"
]

def analyze_cv_text(text: str) -> Dict:
    """Analyse le texte du CV et retourne une analyse structurée."""
    text = text.lower()
    
    # Extraire les compétences techniques
    technical_skills = []
    for category, skills in TECHNICAL_SKILLS.items():
        for skill in skills:
            if skill in text:
                technical_skills.append(skill)
    
    # Extraire les compétences non-techniques
    non_technical_skills = [skill for skill in SOFT_SKILLS if skill in text]
    
    # Calculer le score global (basé sur le nombre de compétences trouvées)
    total_skills = len(technical_skills) + len(non_technical_skills)
    score_global = min(10, total_skills / 2)  # Score sur 10
    
    # Déterminer le niveau d'expérience
    experience_keywords = {
        "junior": ["junior", "entry level", "débutant", "stage", "internship"],
        "mid-level": ["mid-level", "intermédiaire", "3-5 ans", "3-5 years"],
        "senior": ["senior", "expert", "5+ ans", "5+ years", "lead", "principal"]
    }
    
    niveau_experience = "junior"  # par défaut
    for level, keywords in experience_keywords.items():
        if any(keyword in text for keyword in keywords):
            niveau_experience = level
            break
    
    # Générer des recommandations basées sur les compétences manquantes
    recommendations = []
    if len(technical_skills) < 3:
        recommendations.append("Enrichir vos compétences techniques avec des technologies modernes")
    if len(non_technical_skills) < 3:
        recommendations.append("Développer vos compétences non-techniques comme la communication et le travail d'équipe")
    
    # Générer des points forts
    points_forts = []
    if technical_skills:
        points_forts.append(f"Compétences techniques solides en {', '.join(technical_skills[:3])}")
    if non_technical_skills:
        points_forts.append(f"Bonne maîtrise des compétences non-techniques comme {', '.join(non_technical_skills[:3])}")
    
    # Générer des points à améliorer
    points_faibles = []
    if len(technical_skills) < 3:
        points_faibles.append("Besoin de développer plus de compétences techniques")
    if len(non_technical_skills) < 3:
        points_faibles.append("Besoin de renforcer les compétences non-techniques")
    
    return {
        "pointsForts": points_forts,
        "pointsFaibles": points_faibles,
        "recommandations": recommendations,
        "scoreGlobal": round(score_global, 1),
        "motsClesSuggérés": technical_skills + non_technical_skills,
        "competencesTechniques": technical_skills,
        "competencesNonTechniques": non_technical_skills,
        "niveauExperience": niveau_experience,
        "domainesExpertise": list(set([skill.split()[0] for skill in technical_skills]))
    }

@app.get("/check-jobs")
async def check_jobs():
    """Vérifie le contenu de la base de données des offres d'emploi."""
    try:
        # Compter le nombre total d'offres
        total_jobs = jobs_collection.count_documents({})
        
        # Récupérer quelques offres pour vérifier leur structure
        sample_jobs = list(jobs_collection.find().limit(5))
        
        # Convertir ObjectId en str pour la sérialisation JSON
        for job in sample_jobs:
            job["_id"] = str(job["_id"])
        
        return {
            "total_jobs": total_jobs,
            "sample_jobs": sample_jobs,
            "database_name": db.name,
            "collection_name": jobs_collection.name
        }
    except Exception as e:
        logger.error(f"Erreur lors de la vérification de la base de données: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/check-database")
async def check_database():
    """Vérifie le contenu de la base de données et retourne les informations de connexion."""
    try:
        # Vérifier la connexion
        client.admin.command('ping')
        
        # Lister toutes les bases de données
        db_list = client.list_database_names()
        
        # Lister toutes les collections dans jobmatcher
        collections = db.list_collection_names()
        
        # Compter le nombre d'offres
        total_jobs = jobs_collection.count_documents({})
        
        # Récupérer toutes les offres pour vérifier leur structure
        all_jobs = list(jobs_collection.find())
        
        # Convertir ObjectId en str pour la sérialisation JSON
        for job in all_jobs:
            job["_id"] = str(job["_id"])
        
        return {
            "status": "success",
            "database_info": {
                "available_databases": db_list,
                "current_database": db.name,
                "available_collections": collections,
                "current_collection": jobs_collection.name,
                "total_jobs": total_jobs,
                "connection_status": "connected"
            },
            "all_jobs": all_jobs
        }
    except Exception as e:
        logger.error(f"Erreur lors de la vérification de la base de données: {str(e)}")
        return {
            "status": "error",
            "error": str(e),
            "database_info": {
                "connection_status": "disconnected"
            }
        }

def extract_skills_from_description(description: str) -> Dict[str, List[str]]:
    """Extrait les compétences requises et préférées à partir de la description de l'offre."""
    description = description.lower()
    required_skills = []
    preferred_skills = []
    
    # Extraire les compétences techniques
    for category, skills in TECHNICAL_SKILLS.items():
        for skill in skills:
            if skill in description:
                required_skills.append(skill)
    
    # Extraire les compétences non-techniques
    for skill in SOFT_SKILLS:
        if skill in description:
            preferred_skills.append(skill)
    
    return {
        "requiredSkills": required_skills,
        "preferredSkills": preferred_skills
    }

def convert_datetime_to_str(obj):
    """Convertit les objets datetime en string pour la sérialisation JSON."""
    if isinstance(obj, dict):
        return {key: convert_datetime_to_str(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [convert_datetime_to_str(item) for item in obj]
    elif isinstance(obj, datetime):
        return obj.isoformat()
    return obj

def find_matching_jobs(cv_analysis: Dict) -> List[Dict]:
    """Trouve les offres d'emploi correspondant aux compétences et au profil du CV."""
    try:
        # Extraire les compétences techniques et non-techniques
        competences = set(cv_analysis.get("competencesTechniques", []) + 
                        cv_analysis.get("competencesNonTechniques", []))
        
        # Extraire les mots-clés suggérés
        mots_cles = set(cv_analysis.get("motsClesSuggérés", []))
        
        # Combiner toutes les compétences et mots-clés
        all_keywords = competences.union(mots_cles)
        
        logger.info(f"Compétences et mots-clés trouvés dans le CV: {all_keywords}")
        
        # Vérifier d'abord si la collection contient des offres
        total_jobs = jobs_collection.count_documents({})
        logger.info(f"Nombre total d'offres dans la base de données: {total_jobs}")
        
        if total_jobs == 0:
            logger.warning("Aucune offre trouvée dans la base de données")
            return []
        
        # Récupérer toutes les offres
        all_jobs = list(jobs_collection.find())
        logger.info(f"Nombre d'offres récupérées: {len(all_jobs)}")
        
        # Calculer un score de correspondance pour chaque offre
        scored_jobs = []
        for job in all_jobs:
            score = 0
            matching_skills = set()
            
            # Vérifier le titre de l'offre
            title = job.get("title", "").lower()
            description = job.get("description", "").lower()
            
            # Extraire les compétences de la description
            skills = extract_skills_from_description(description)
            required_skills = set(skills["requiredSkills"])
            preferred_skills = set(skills["preferredSkills"])
            
            # Vérifier les correspondances dans le titre
            for keyword in all_keywords:
                if keyword.lower() in title:
                    score += 3  # Score plus élevé pour les correspondances dans le titre
                    matching_skills.add(keyword)
            
            # Vérifier les correspondances dans la description
            for keyword in all_keywords:
                if keyword.lower() in description:
                    score += 1
                    matching_skills.add(keyword)
            
            # Calculer le score basé sur les compétences requises (poids plus important)
            matching_required = all_keywords.intersection(required_skills)
            score += len(matching_required) * 2
            matching_skills.update(matching_required)
            
            # Calculer le score basé sur les compétences préférées
            matching_preferred = all_keywords.intersection(preferred_skills)
            score += len(matching_preferred)
            matching_skills.update(matching_preferred)
            
            # Vérifier la correspondance du niveau d'expérience
            experience_level = cv_analysis.get("niveauExperience", "").lower()
            if experience_level in description.lower():
                score += 2
            
            # Normaliser le score sur 10
            total_possible_score = len(all_keywords) * 3  # Score maximum possible
            if total_possible_score > 0:
                normalized_score = (score / total_possible_score) * 10
            else:
                normalized_score = 0
                
            # Ajouter l'offre avec son score si elle a au moins une correspondance
            if score > 0:
                job["_id"] = str(job["_id"])
                job["matchScore"] = round(normalized_score, 1)
                job["matchingSkills"] = list(matching_skills)
                job["extractedRequiredSkills"] = list(required_skills)
                job["extractedPreferredSkills"] = list(preferred_skills)
                scored_jobs.append(job)
                logger.info(f"Score de correspondance pour {job.get('title')}: {normalized_score}")
        
        # Trier les offres par score de correspondance (du plus élevé au plus bas)
        scored_jobs.sort(key=lambda x: x["matchScore"], reverse=True)
        
        logger.info(f"Nombre d'offres correspondantes trouvées: {len(scored_jobs)}")
        
        # Convertir les dates en string avant de retourner
        scored_jobs = convert_datetime_to_str(scored_jobs)
        
        # Retourner les 10 meilleures offres
        return scored_jobs[:10]
        
    except Exception as e:
        logger.error(f"Erreur lors de la recherche d'offres correspondantes: {str(e)}")
        return []

@app.post("/analyze-cv")
async def analyze_cv(file: UploadFile = File(...)):
    try:
        logger.info(f"Analyse du CV démarrée pour le fichier: {file.filename}")
        
        if not file:
            raise HTTPException(status_code=400, detail="Aucun fichier reçu")

        # Lire le contenu du fichier
        content = await file.read()
        logger.info(f"Fichier lu avec succès, taille: {len(content)} bytes")
        
        # Extraire le texte selon le type de fichier
        if file.filename.endswith('.pdf'):
            logger.info("Extraction du texte du PDF...")
            text = await extract_text_from_pdf(content)
        elif file.filename.endswith(('.doc', '.docx')):
            logger.info("Extraction du texte du DOCX...")
            text = await extract_text_from_docx(content)
        else:
            raise HTTPException(status_code=400, detail="Format de fichier non supporté (PDF, DOCX uniquement)")

        if not text.strip():
            raise HTTPException(status_code=400, detail="Le texte extrait est vide.")

        logger.info(f"Texte extrait avec succès, longueur: {len(text)} caractères")

        # Analyser le CV
        logger.info("Analyse du CV en cours...")
        analysis = analyze_cv_text(text)
        
        # Trouver les offres correspondantes
        logger.info("Recherche des offres correspondantes...")
        matching_jobs = find_matching_jobs(analysis)
        logger.info(f"Nombre d'offres correspondantes trouvées: {len(matching_jobs)}")
        
        # Ajouter les offres correspondantes à l'analyse
        analysis["offresCorrespondantes"] = matching_jobs
        
        # Préparer le fichier CV pour le stockage
        cv_data = {
            "data": base64.b64encode(content).decode('utf-8'),
            "contentType": file.content_type,
            "fileName": file.filename,
            "analysis": analysis
        }
        
        logger.info("Analyse CV terminée avec succès")
        return JSONResponse(content={
            "status": "success",
            "message": "Analyse CV réussie",
            "cv": cv_data
        })
            
    except Exception as e:
        logger.error(f"Erreur lors de l'analyse du CV: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur d'analyse : {str(e)}")

# Ajouter un nouvel endpoint pour vérifier le CV
@app.get("/check-cv")
async def check_cv():
    try:
        # Vérifier la connexion à MongoDB
        client.admin.command('ping')
        
        # Vérifier la collection des CV
        cv_collection = db["cvs"]
        total_cvs = cv_collection.count_documents({})
        
        # Récupérer un exemple de CV
        sample_cv = cv_collection.find_one()
        
        return {
            "status": "success",
            "total_cvs": total_cvs,
            "sample_cv": {
                "exists": bool(sample_cv),
                "filename": sample_cv.get("fileName") if sample_cv else None,
                "content_type": sample_cv.get("contentType") if sample_cv else None,
                "has_data": bool(sample_cv.get("data")) if sample_cv else False
            }
        }
    except Exception as e:
        logger.error(f"Erreur lors de la vérification du CV: {str(e)}")
        return {
            "status": "error",
            "error": str(e)
        }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8080, reload=True)
