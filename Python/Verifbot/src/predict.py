import sys
import os
import json
import joblib
import pandas as pd
import numpy as np

# 1. Gestion des imports (pour trouver utilitis.py)
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from utilitis import extract_features 

# 2. Chemins relatifs vers les fichiers output
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, "output", "model.pkl")
FEAT_PATH = os.path.join(BASE_DIR, "output", "features.pkl")

def predict(json_path):
    # --- Chargement du modèle ---
    if not os.path.exists(MODEL_PATH):
        print(f"ERREUR : Modèle introuvable ici : {MODEL_PATH}")
        print("Avez-vous lancé 'python src/train.py' ?")
        return

    try:
        pipeline = joblib.load(MODEL_PATH)
        feature_cols = joblib.load(FEAT_PATH)
    except Exception as e:
        print(f"Erreur lors du chargement du modèle : {e}")
        return
    
    # --- Lecture du fichier JSON ---
    if not os.path.exists(json_path):
        print(f"ERREUR : Le fichier '{json_path}' n'existe pas.")
        return

    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            content = json.load(f)
    except Exception as e:
        print(f"Erreur de lecture JSON : {e}")
        return
        
    # --- Gestion Liste vs Objet Unique ---
    session_to_test = None
    if isinstance(content, list):
        if len(content) > 0:
            # On prend la première session de la liste pour le test
            session_to_test = content[0]
        else:
            print("Erreur : Le fichier JSON est une liste vide.")
            return
    else:
        session_to_test = content

    # --- Extraction des features ---
    feats = extract_features(session_to_test)
    if feats is None:
        print("Erreur : Impossible d'extraire les features (données vides ou invalides).")
        return

    # --- Prédiction ---
    # Conversion en DataFrame
    df = pd.DataFrame([feats])
    # Alignement des colonnes (ordre exact de l'entraînement)
    df = df.reindex(columns=feature_cols, fill_value=0)
    
    # Calcul probabilités
    proba = pipeline.predict_proba(df)[0]
    score_bot = proba[1] # Probabilité classe 1 (Bot)
    
    # --- Affichage Résultat ---
    print("\n" + "="*50)
    print(f"FICHIER : {os.path.basename(json_path)}")
    print("="*50)
    print(f"Probabilité d'être un BOT : {score_bot*100:.2f}%")
    
    if score_bot > 0.5:
        print("\n>>> VERDICT : 🤖 ROBOT DETECTÉ")
    else:
        print("\n>>> VERDICT : 👤 HUMAIN VALIDÉ")
    print("="*50 + "\n")

if __name__ == "__main__":
    # C'est ici que ça se joue : on vérifie si tu as écrit un chemin dans le terminal
    if len(sys.argv) > 1:
        # sys.argv[0] c'est le nom du script, sys.argv[1] c'est ton fichier json
        fichier_a_tester = sys.argv[1]
        predict(fichier_a_tester)
    else:
        print("\n--- MODE D'EMPLOI ---")
        print("Vous devez indiquer le fichier à tester.")
        print("Exemple : python src/predict.py data/llm/session_trace_LLM.json")