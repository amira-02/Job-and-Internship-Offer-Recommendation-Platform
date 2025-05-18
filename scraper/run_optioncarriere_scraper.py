import os
import time
import schedule
from datetime import datetime
from dotenv import load_dotenv
from optioncarriere_scraper import OptionCarriereScraper

# Charger les variables d'environnement
load_dotenv()

def run_scraping():
    """Exécute le scraping et gère les erreurs"""
    print(f"🕒 Démarrage du scraping à {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    scraper = OptionCarriereScraper()
    try:
        scraper.scrape()
    except Exception as e:
        print(f"❌ Erreur lors du scraping: {str(e)}")
    finally:
        scraper.close()

def main():
    """Fonction principale qui configure et lance le scraping programmé"""
    # Récupérer l'intervalle de scraping depuis les variables d'environnement (par défaut: 5 minutes)
    scrape_interval = int(os.getenv("SCRAPE_INTERVAL", "5"))
    
    print("🚀 Service de scraping Option Carriere démarré")
    print(f"⏰ Intervalle de scraping: {scrape_interval} minutes")
    
    # Exécuter le scraping immédiatement
    run_scraping()
    
    # Programmer le scraping à intervalles réguliers
    schedule.every(scrape_interval).minutes.do(run_scraping)
    
    # Boucle principale
    try:
        while True:
            schedule.run_pending()
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n👋 Arrêt du service de scraping")

if __name__ == "__main__":
    main() 