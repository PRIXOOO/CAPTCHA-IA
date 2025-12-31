import sys
import os
import joblib
import pandas as pd
import google.generativeai as genai
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any

# 1. On importe ta boîte à outils (utilitis.py)
# Cela évite de réécrire le code, on l'utilise directement.
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from utilitis import extract_features

# --- CONFIGURATION ---
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, "output", "model.pkl")
FEAT_PATH = os.path.join(BASE_DIR, "output", "features.pkl")

# --- TA CLÉ GEMINI ---
GOOGLE_API_KEY = "Votre Clé" 
genai.configure(api_key=GOOGLE_API_KEY)

app = FastAPI()

# Autoriser ton site à parler à l'API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Variables globales (pour charger le modèle UNE SEULE FOIS en mémoire)
model = None
feat_cols = None

@app.on_event("startup")
def load_brain():
    """Cette fonction se lance toute seule au démarrage du serveur"""
    global model, feat_cols
    if os.path.exists(MODEL_PATH):
        model = joblib.load(MODEL_PATH)
        feat_cols = joblib.load(FEAT_PATH)
        print("✅ Cerveau chargé en mémoire ! Prêt à analyser.")
    else:
        print("❌ ERREUR CRITIQUE : Modèle introuvable. Lance train.py d'abord.")

def ask_gemini(session_json, task_name, features):
    """
    On envoie à Gemini les données BRUTES + les STATS calculées (features).
    On lui donne aussi des consignes strictes pour ne pas être parano.
    """
    try:
        gemini = genai.GenerativeModel('gemini-3-pro-preview')
        
        # On prépare les stats pour aider Gemini
        stats_text = f"""
        - Variation de vitesse (Speed Std): {features.get('speed_std', 0):.4f} (Un humain est souvent > 0.05)
        - Accélération Moyenne: {features.get('accel_mean', 0):.4f} (Un humain a des micro-tremblements)
        - Ligne droite (Straightness): {features.get('straightness', 0):.4f} (1.0 = Parfait = Suspect)
        - Nombre de pauses: {features.get('n_pauses', 0)}
        """

        prompt = f"""
        Tu es un expert en Test de Turing (détection Humain vs Bot).
        
        CONTEXTE :
        Un algorithme statistique hésite sur cet utilisateur pour la tâche '{task_name}'.
        Ton rôle est de trancher.
        
        RÈGLES D'ANALYSE :
        1. Un HUMAIN a des mouvements imparfaits, une vitesse variable (Speed Std élevée) et des micro-tremblements.
        2. Un BOT a une trajectoire trop parfaite, une vitesse constante ou mécanique.
        3. **IMPORTANT : En cas de doute ou de mouvement "naturel", le verdict doit être HUMAIN.** Ne sois pas trop sévère.

        LES STATISTIQUES CALCULÉES :
        {stats_text}

        ÉCHANTILLON DES DONNÉES BRUTES (Events JSON) :
        {str(session_json.get('events', []))[:2000]}...
        
        Réponds UNIQUEMENT par ce JSON : 
        {{"is_bot": true/false, "reason": "courte explication en une phrase"}}
        """
        
        response = gemini.generate_content(prompt)
        txt = response.text.replace("```json", "").replace("```", "").strip()
        import json
        return json.loads(txt)
        
    except Exception as e:
        print(f"Erreur Gemini : {e}")
        return {"is_bot": False, "reason": "Erreur API Gemini (Par défaut Humain)"}

# --- LA ROUTE QUE TON SITE APPELLE ---
@app.post("/analyze/{task_id}")
async def analyze_game(task_id: str, payload: Dict[Any, Any]):
    print(f"📥 Réception données tâche : {task_id}")

    if not model:
        return {"verdict": "ERROR", "message": "API non prête"}

    # 1. On utilise ton utilitis.py pour transformer le JSON en chiffres
    features = extract_features(payload)
    
    if not features:
        return {"verdict": "ERROR", "message": "Données vides"}

    # 2. On prépare les données pour le modèle
    df = pd.DataFrame([features]).reindex(columns=feat_cols, fill_value=0)
    
    # 3. Prédiction RAPIDE (Local)
    # C'est ici que l'API fait le travail de predict.py
    proba_bot = model.predict_proba(df)[0][1] # Score entre 0.0 et 1.0
    
    final_verdict = "HUMAIN"
    final_score = proba_bot
    source = "Local Random Forest"

    # 4. Logique de Doute (Hybride)
# Dans api.py

    # 4. Logique de Doute (Hybride)
    if 0.30 < proba_bot < 0.80:
        print(f"🤔 Doute ({proba_bot:.2f}). Appel Gemini...")
        gemini_res = ask_gemini(payload, task_id, features)
        
        is_bot_gemini = gemini_res.get("is_bot", False)
        
        if is_bot_gemini:
            final_verdict = "ROBOT"
            # final_score = 0.95  
            final_score = proba_bot + 0.2 # On pénalise un peu mais on garde la nuance
            if final_score > 1.0: final_score = 0.99
        else:
            final_verdict = "HUMAIN"
            # final_score = 0.10 
            final_score = proba_bot - 0.2 # On bonifie un peu
            if final_score < 0.0: final_score = 0.01


    else:
        # Cas clair
        if proba_bot > 0.5:
            final_verdict = "ROBOT"
        else:
            final_verdict = "HUMAIN"

    print(f"👉 Résultat : {final_verdict} ({final_score:.2f}) via {source}")

    # Ce que l'API renvoie à ton site
    return {
        "verdict": final_verdict,
        "confidence": round(final_score, 2),
        "source": source
    }

# Lancement facile
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)