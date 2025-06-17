from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import torch
import PyPDF2
import tkinter as tk
from tkinter import filedialog

def load_model():
    model_id = "google/flan-t5-base"
    print("🔁 Chargement du modèle FLAN-T5 Base...")
    tokenizer = AutoTokenizer.from_pretrained(model_id)
    model = AutoModelForSeq2SeqLM.from_pretrained(model_id)
    print("✅ Modèle chargé avec succès.")
    return tokenizer, model

def read_pdf_text(pdf_path):
    text = ""
    with open(pdf_path, 'rb') as f:
        reader = PyPDF2.PdfReader(f)
        for page in reader.pages:
            text += page.extract_text()
    return text

def upload_cv_file():
    root = tk.Tk()
    root.withdraw()
    file_path = filedialog.askopenfilename(title="Sélectionner un CV (PDF ou TXT)", filetypes=[("PDF files", "*.pdf"), ("Text files", "*.txt")])
    return file_path

def analyze_cv(cv_text, tokenizer, model):
    print("📄 Analyse du CV en cours...")
    prompt = (
    f"Voici un CV : {cv_text}\n"
    f"Analyse ce CV en donnant :\n"
    f"- Un score global du CV sur 100\n"
    f"- Les points forts\n"
    f"- Les points faibles\n"
    f"- Des conseils pour améliorer le CV"
)

    inputs = tokenizer(prompt, return_tensors="pt", truncation=True, max_length=512)
    outputs = model.generate(**inputs, max_length=200)
    result = tokenizer.decode(outputs[0], skip_special_tokens=True)
    return result

def main():
    tokenizer, model = load_model()

    file_path = upload_cv_file()
    if not file_path:
        print("❌ Aucun fichier sélectionné.")
        return

    if file_path.endswith(".pdf"):
        cv_text = read_pdf_text(file_path)
    elif file_path.endswith(".txt"):
        with open(file_path, "r", encoding="utf-8") as f:
            cv_text = f.read()
    else:
        print("❌ Format de fichier non pris en charge. Utilisez PDF ou TXT.")
        return

    if not cv_text.strip():
        print("❌ Le fichier est vide ou illisible.")
        return

    result = analyze_cv(cv_text, tokenizer, model)

    print("\n🧠 Résultat généré par le modèle :")
    print(result)

if __name__ == "__main__":
    main()
