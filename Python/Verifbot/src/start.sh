#!/bin/bash

# --- LA LIGNE MAGIQUE (Version Mac/Linux) ---
# Se place dans le dossier du script
cd "$(dirname "$0")"
# --------------------------------------------

echo "[1/2] Installation de TOUTES les dependances (Bot + API + Maths)..."

# Note : Sur Mac/Linux, on utilise souvent 'python3' explicitement
python3 -m pip install opencv-python pyautogui mss scipy numpy google-genai google-generativeai joblib pandas scikit-learn fastapi uvicorn

echo ""
echo "[2/2] Lancement de l'API..."
python3 api.py

# Equivalent du 'pause' pour ne pas fermer la fenetre si erreur
echo "Appuyez sur Entrée pour quitter..."
read