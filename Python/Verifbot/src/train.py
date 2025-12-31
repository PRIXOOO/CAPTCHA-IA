import os
import json
import joblib
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import StratifiedKFold, cross_val_score
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler

# On réutilise ta fonction d'extraction existante
import sys
from utilitis import extract_features

# CONFIGURATION
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_HUMAN = os.path.join(BASE_DIR, "data", "human")
DATA_LLM = os.path.join(BASE_DIR, "data", "llm")
OUTPUT_DIR = os.path.join(BASE_DIR, "output")

def process_content(content, label, X_list, y_list, filename):
    """
    Fonction helper qui traite le contenu JSON (qu'il soit liste ou dict)
    et ajoute les features aux listes X_list et y_list.
    """
    # Cas 1 : Le fichier contient une LISTE de sessions (ton cas actuel)
    if isinstance(content, list):
        print(f"   -> Fichier groupé détecté : {len(content)} sessions trouvées.")
        for i, session in enumerate(content):
            feats = extract_features(session)
            if feats:
                X_list.append(feats)
                y_list.append(label)
            else:
                print(f"      Session {i} vide ou invalide.")

    # Cas 2 : Le fichier est une session UNIQUE (ancien format)
    elif isinstance(content, dict):
        feats = extract_features(content)
        if feats:
            X_list.append(feats)
            y_list.append(label)

def load_data():
    X_list = []
    y_list = []
    
    # --- CHARGEMENT HUMAINS (Label 0) ---
    if os.path.exists(DATA_HUMAN):
        print(f"Lecture du dossier {DATA_HUMAN}...")
        for f in os.listdir(DATA_HUMAN):
            if f.endswith(".json"):
                path = os.path.join(DATA_HUMAN, f)
                try:
                    with open(path, 'r', encoding='utf-8') as fp:
                        content = json.load(fp)
                        process_content(content, 0, X_list, y_list, f)
                except Exception as e:
                    print(f"Erreur lecture {f}: {e}")

    # --- CHARGEMENT BOTS (Label 1) ---
    if os.path.exists(DATA_LLM):
        print(f"Lecture du dossier {DATA_LLM}...")
        for f in os.listdir(DATA_LLM):
            if f.endswith(".json"):
                path = os.path.join(DATA_LLM, f)
                try:
                    with open(path, 'r', encoding='utf-8') as fp:
                        content = json.load(fp)
                        process_content(content, 1, X_list, y_list, f)
                except Exception as e:
                    print(f"Erreur lecture {f}: {e}")
                        
    return pd.DataFrame(X_list), np.array(y_list)

def main():
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)
        
    print("--- 1. Chargement des données ---")
    X, y = load_data()
    
    # Vérification
    n_total = len(X)
    n_human = np.sum(y == 0)
    n_bot = np.sum(y == 1)
    
    print(f"\nRÉSUMÉ DONNÉES :")
    print(f"Total sessions extraites : {n_total}")
    print(f"Humains : {n_human}")
    print(f"Bots    : {n_bot}")
    
    if n_total < 10:
        print("ERREUR : Pas assez de données pour entraîner. Vérifiez vos fichiers JSON.")
        return

    # Sauvegarde des noms de colonnes
    feature_cols = list(X.columns)
    joblib.dump(feature_cols, os.path.join(OUTPUT_DIR, "features.pkl"))

    print("\n--- 2. Entraînement & Validation ---")
    pipeline = Pipeline([
        ('imputer', SimpleImputer(strategy='mean')),
        ('scaler', StandardScaler()),
        ('clf', RandomForestClassifier(n_estimators=100, random_state=42))
    ])
    
    # Validation croisée
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    
    # Note: Si tu as peu d'exemples (<5 par classe), StratifiedKFold va râler.
    # Si ça plante ici, réduit n_splits à 3 ou 2.
    try:
        scores = cross_val_score(pipeline, X, y, cv=cv, scoring='accuracy')
        print(f"Précision moyenne (Accuracy) : {scores.mean():.2f} (+/- {scores.std():.2f})")
    except ValueError:
        print("Attention : Pas assez de données pour faire 5 folds. On passe directement à l'entraînement.")

    print("\n--- 3. Sauvegarde du modèle ---")
    pipeline.fit(X, y)
    
    model_path = os.path.join(OUTPUT_DIR, "model.pkl")
    joblib.dump(pipeline, model_path)
    print(f"Modèle sauvegardé : {model_path}")

    # Top Features
    rf = pipeline.named_steps['clf']
    importances = pd.Series(rf.feature_importances_, index=feature_cols).sort_values(ascending=False)
    print("\nTop 3 Features qui trahissent les bots :")
    print(importances.head(3))

if __name__ == "__main__":
    main()