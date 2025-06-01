import os
import time
import random
from datetime import datetime
from typing import List, Dict, Optional
from urllib.parse import urljoin
import json
import logging
from pathlib import Path
import sys

import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv
from pymongo import MongoClient

# Configuration du logging avec encodage UTF-8
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('scraper.log', encoding='utf-8'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# Charger les variables d'environnement
load_dotenv()

class OptionCarriereScraper:
    def __init__(self):
        self.base_url = "https://www.optioncarriere.tn"
        self.jobs_url = "https://www.optioncarriere.tn/emploi"  # URL de base modifiée
        self.search_params = "s=tunisie&l=Tunisie"  # Paramètres de recherche
        self.mongo_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017/jobmatcher")
        self.db = None
        self.collection = None
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'fr,fr-FR;q=0.8,en-US;q=0.5,en;q=0.3',
        })
        self.last_request_time = 0
        self.min_request_interval = random.uniform(2, 4)

    def setup_database(self):
        """Configure la connexion à MongoDB"""
        try:
            client = MongoClient(self.mongo_uri)
            self.db = client.jobmatcher
            self.collection = self.db.joboffers
            self.collection.create_index("sourceUrl", unique=True)
            self.collection.create_index([
                ("title", "text"),
                ("company", "text"),
                ("description", "text")
            ])
            logger.info("[SUCCESS] Connecté à MongoDB")
        except Exception as e:
            logger.error(f"[ERROR] Erreur de connexion à MongoDB: {e}")
            raise

    def respect_rate_limit(self):
        """Respecte les limites de taux de requêtes"""
        current_time = time.time()
        time_since_last_request = current_time - self.last_request_time
        
        if time_since_last_request < self.min_request_interval:
            sleep_time = self.min_request_interval - time_since_last_request
            time.sleep(sleep_time)
        
        self.last_request_time = time.time()

    def get_page(self, url: str) -> Optional[BeautifulSoup]:
        """Récupère une page et retourne son contenu parsé"""
        try:
            self.respect_rate_limit()
            response = self.session.get(url)
            response.raise_for_status()
            return BeautifulSoup(response.text, 'html.parser')
        except Exception as e:
            logger.error(f"[ERROR] Erreur lors de la récupération de la page {url}: {e}")
            return None

    def get_page_url(self, page_number: int = 1) -> str:
        """Construit l'URL de la page avec les bons paramètres"""
        if page_number == 1:
            return f"{self.jobs_url}?{self.search_params}"
        return f"{self.jobs_url}?{self.search_params}&p={page_number}"

    def get_total_pages(self, soup: BeautifulSoup) -> int:
        """Récupère le nombre total de pages d'offres en vérifiant chaque page"""
        try:
            max_pages = 1
            current_page = 1
            
            while True:
                # Vérifier si la page actuelle contient des offres
                job_elements = soup.select("article.job")
                if not job_elements:
                    logger.info(f"[INFO] Aucune offre trouvée sur la page {current_page}, fin de la pagination")
                    break
                
                # Chercher le lien vers la page suivante
                next_page = current_page + 1
                next_page_url = self.get_page_url(next_page)
                next_soup = self.get_page(next_page_url)
                
                if not next_soup:
                    logger.info(f"[INFO] Impossible d'accéder à la page {next_page}, fin de la pagination")
                    break
                
                # Vérifier si la page suivante contient des offres
                next_job_elements = next_soup.select("article.job")
                if not next_job_elements:
                    logger.info(f"[INFO] Aucune offre trouvée sur la page {next_page}, fin de la pagination")
                    break
                
                max_pages = next_page
                current_page = next_page
                soup = next_soup
                
                # Pause entre les vérifications de pages
                time.sleep(random.uniform(1, 2))
            
            logger.info(f"[INFO] Nombre total de pages trouvé: {max_pages}")
            return max_pages

        except Exception as e:
            logger.error(f"[ERROR] Erreur lors de la détection des pages: {e}")
            return 1

    def get_job_description(self, job_url: str) -> str:
        """Récupère la description complète d'une offre"""
        try:
            soup = self.get_page(job_url)
            if not soup:
                return ""

            # Essayer différents sélecteurs pour la description
            description_selectors = [
                '.description',  # Sélecteur principal
                '.job-description',
                '.offer-description',
                'div[class*="description"]',
                'div[class*="content"]',
                'div[class*="details"]',
                'div[class*="job-details"]',
                'div[class*="offer-details"]',
                'div[class*="posting-description"]',
                'div[class*="job-content"]'
            ]

            description = ""
            for selector in description_selectors:
                description_element = soup.select_one(selector)
                if description_element:
                    description = self.clean_text(description_element.text)
                    if len(description) > 100:  # Vérifier si la description a une longueur raisonnable
                        break

            if not description:
                # Essayer de trouver n'importe quel texte qui pourrait être une description
                main_content = soup.select_one('main, article, .content, .main-content')
                if main_content:
                    description = self.clean_text(main_content.text)
                    if len(description) <= 100:
                        description = ""

            # Nettoyer la description
            if description:
                # Supprimer les espaces multiples
                description = ' '.join(description.split())
                # Supprimer les lignes vides multiples
                description = '\n'.join(line for line in description.split('\n') if line.strip())
                # Limiter la longueur si nécessaire
                if len(description) > 10000:
                    description = description[:10000] + "..."

            return description

        except Exception as e:
            logger.error(f"[ERROR] Erreur lors de la récupération de la description: {e}")
            return ""

    def clean_text(self, text: str) -> str:
        """Nettoie le texte des offres"""
        if not text:
            return ""
        return " ".join(text.strip().split())

    def parse_date(self, date_str: str) -> datetime:
        """Parse la date de publication"""
        if not date_str:
            return datetime.now()
        
        date_str = date_str.lower()
        if "aujourd'hui" in date_str:
            return datetime.now()
        if "hier" in date_str:
            return datetime.now().replace(day=datetime.now().day - 1)
        
        try:
            # Format Option Carriere: "Publiée le 17/05/2024"
            date_str = date_str.replace("publiée le", "").strip()
            return datetime.strptime(date_str, "%d/%m/%Y")
        except ValueError:
            return datetime.now()

    def extract_job_details(self, job_element) -> Dict:
        """Extrait les détails d'une offre d'emploi"""
        try:
            # Sélecteurs spécifiques à Option Carriere
            title_element = job_element.select_one("h2 a")
            company_element = job_element.select_one(".company")
            location_element = job_element.select_one(".location")
            date_element = job_element.select_one(".date")
            
            # Extraire les données de base
            title = self.clean_text(title_element.text if title_element else "")
            company = self.clean_text(company_element.text if company_element else "")
            location = self.clean_text(location_element.text if location_element else "")
            source_url = urljoin(self.base_url, title_element["href"]) if title_element and "href" in title_element.attrs else ""
            posted_date = self.clean_text(date_element.text if date_element else "")
            
            # Récupérer la description complète avec un délai aléatoire
            time.sleep(random.uniform(1, 2))  # Pause entre les requêtes
            description = self.get_job_description(source_url) if source_url else ""
            
            # Extraire d'autres informations si disponibles
            salary_element = job_element.select_one(".salary")
            contract_element = job_element.select_one(".contract")
            experience_element = job_element.select_one(".experience")
            
            job_details = {
                "title": title,
                "company": company,
                "location": location,
                "description": description,
                "sourceUrl": source_url,
                "postedDate": self.parse_date(posted_date),
                "scrapedDate": datetime.now(),
                "source": "Option Carriere",
                "isNewOffer": True
            }

            # Ajouter les champs optionnels s'ils existent
            if salary_element:
                job_details["salary"] = self.clean_text(salary_element.text)
            if contract_element:
                job_details["contractType"] = self.clean_text(contract_element.text)
            if experience_element:
                job_details["experience"] = self.clean_text(experience_element.text)

            logger.info(f"[INFO] Offre extraite: {title} ({len(description)} caractères de description)")
            return job_details

        except Exception as e:
            logger.error(f"[ERROR] Erreur lors de l'extraction des détails: {e}")
            return None

    def scrape(self):
        """Exécute le scraping des offres d'emploi"""
        try:
            if not self.db:
                self.setup_database()

            logger.info("[INFO] Accès à la page des offres...")
            soup = self.get_page(self.get_page_url())
            if not soup:
                raise Exception("Impossible d'accéder à la page des offres")

            # Obtenir le nombre total de pages en vérifiant chaque page
            total_pages = self.get_total_pages(soup)
            logger.info(f"[INFO] Début du scraping sur {total_pages} pages")
            
            total_new_offers = 0
            current_page = 1
            
            while current_page <= total_pages:
                logger.info(f"[INFO] Scraping de la page {current_page}/{total_pages}")
                
                # Utiliser le bon format d'URL pour chaque page
                page_url = self.get_page_url(current_page)
                soup = self.get_page(page_url)
                
                if not soup:
                    logger.error(f"[ERROR] Impossible d'accéder à la page {current_page}, passage à la suivante")
                    current_page += 1
                    continue
                
                # Récupérer les offres
                job_elements = soup.select("article.job")
                logger.info(f"[INFO] {len(job_elements)} offres trouvées sur la page {current_page}")
                
                if not job_elements:
                    logger.warning(f"[WARNING] Aucune offre trouvée sur la page {current_page}, fin du scraping")
                    break
                
                page_new_offers = 0
                for job_element in job_elements:
                    job_details = self.extract_job_details(job_element)
                    if job_details and job_details["sourceUrl"]:
                        try:
                            existing_offer = self.collection.find_one({"sourceUrl": job_details["sourceUrl"]})
                            if not existing_offer:
                                self.collection.insert_one(job_details)
                                page_new_offers += 1
                                total_new_offers += 1
                                logger.info(f"[SUCCESS] Nouvelle offre ajoutée: {job_details['title']}")
                        except Exception as e:
                            if "duplicate key error" not in str(e).lower():
                                logger.error(f"[ERROR] Erreur lors de la sauvegarde: {e}")
                
                logger.info(f"[SUCCESS] Page {current_page} terminée. {page_new_offers} nouvelles offres trouvées.")
                
                # Pause entre les pages
                if current_page < total_pages:
                    time.sleep(random.uniform(2, 4))
                
                current_page += 1
            
            logger.info(f"[SUCCESS] Scraping terminé. {total_new_offers} nouvelles offres trouvées au total.")
            
        except Exception as e:
            logger.error(f"[ERROR] Erreur de scraping: {str(e)}")

    def close(self):
        """Ferme les connexions"""
        if self.db is not None:
            try:
                self.db.client.close()
            except:
                pass
            self.db = None
        self.session.close()

if __name__ == "__main__":
    scraper = OptionCarriereScraper()
    try:
        scraper.scrape()
    finally:
        scraper.close() 