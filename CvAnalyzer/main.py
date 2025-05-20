from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import io
import pdfminer.high_level
import docx2txt
import os
import json
import requests

app = FastAPI()

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ollama Configuration
OLLAMA_API_URL = "http://localhost:11434/api/generate"
MODEL_NAME = "mistral"

def query_ollama(prompt: str) -> str:
    """Query the Ollama API with the given prompt."""
    try:
        payload = {
            "model": MODEL_NAME,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": 0.3,
                "top_p": 0.95,
                "num_predict": 1000
            }
        }
        
        response = requests.post(OLLAMA_API_URL, json=payload)
        response.raise_for_status()
        
        result = response.json()
        return result.get("response", "")
    except requests.exceptions.RequestException as e:
        print(f"Erreur lors de l'appel à Ollama: {e}")
        raise HTTPException(status_code=500, detail=f"Erreur de communication avec Ollama: {str(e)}")

@app.get("/")
async def read_root():
    return {"message": "FastAPI backend is running!"}

# Extract text from PDF
async def extract_text_from_pdf(file: UploadFile):
    try:
        content = await file.read()
        text = pdfminer.high_level.extract_text(io.BytesIO(content))
        return text
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur PDF : {e}")

# Extract text from DOCX
async def extract_text_from_docx(file: UploadFile):
    try:
        content = await file.read()
        text = docx2txt.process(io.BytesIO(content))
        return text
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur DOCX : {e}")

@app.post("/analyze-cv/")
async def analyze_cv(file: UploadFile = File(...)):
    if not file:
        raise HTTPException(status_code=400, detail="Aucun fichier reçu")

    ext = file.filename.split(".")[-1].lower()
    text = ""

    if ext == "pdf":
        text = await extract_text_from_pdf(file)
    elif ext == "docx":
        text = await extract_text_from_docx(file)
    elif ext == "txt":
        try:
            content = await file.read()
            text = content.decode("utf-8")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Erreur lecture TXT : {e}")
    else:
        raise HTTPException(status_code=400, detail="Format de fichier non supporté (PDF, DOCX, TXT uniquement)")

    if not text.strip():
        raise HTTPException(status_code=400, detail="Le texte extrait est vide.")

    # Analyse with Ollama
    try:
        prompt = f"""Analyze this CV and provide a JSON response with the following structure:
        {{
            "pointsForts": ["list", "of", "strengths"],
            "pointsFaibles": ["list", "of", "weaknesses"],
            "recommandations": ["list", "of", "recommendations"],
            "scoreGlobal": number_between_0_and_10,
            "motsClesSuggérés": ["list", "of", "keywords"]
        }}

        CV to analyze:
        {text}

        Respond only with the JSON object, no other text."""

        print("Envoi de la requête à Ollama...")
        response = query_ollama(prompt)
        
        # Extract JSON from response
        try:
            # Find the first { and last }
            start = response.find("{")
            end = response.rfind("}") + 1
            if start != -1 and end > start:
                json_text = response[start:end].replace('\n', ' ').replace('\r', '')
                analysis = json.loads(json_text)
                
                # Validate required keys
                required_keys = ["pointsForts", "pointsFaibles", "recommandations", "scoreGlobal", "motsClesSuggérés"]
                for key in required_keys:
                    if key not in analysis:
                        raise ValueError(f"Clé manquante: {key}")
                
                # Ensure scoreGlobal is a number
                if not isinstance(analysis["scoreGlobal"], (int, float)):
                    try:
                        analysis["scoreGlobal"] = float(analysis["scoreGlobal"])
                    except (ValueError, TypeError):
                        raise ValueError("scoreGlobal doit être un nombre")
                
                return JSONResponse(content={
                    "status": "success",
                    "message": "Analyse CV réussie",
                    "analysis": analysis
                })
            else:
                raise HTTPException(status_code=500, detail="Format JSON non trouvé dans la réponse")
        except json.JSONDecodeError as e:
            print(f"Réponse brute d'Ollama: {response}")
            raise HTTPException(status_code=500, detail=f"Erreur de format JSON : {e}")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur d'analyse : {str(e)}")

if __name__ == "__main__":
    uvicorn.run("main:app", host="localhost", port=8080, reload=True)
