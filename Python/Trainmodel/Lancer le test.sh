#!/bin/bash

# Installation des dépendances (utilisation de python3 pour mac/linux)
# Note : Sur certains systèmes récents, il peut être nécessaire d'utiliser un environnement virtuel (venv).
python3 -m pip install opencv-python pyautogui mss scipy numpy google-genai --quiet

echo "Le test se lance dans 10sec"
sleep 10

# Lancement du premier script
python3 LLM-VL-1.py
sleep 2

# Lancement du deuxième script
python3 LLM-VL-2.py
sleep 2

# Lancement du troisième script
python3 LLM-VL-3.py
sleep 5

echo "TERMINE."

# Équivalent de la commande "pause" pour attendre une action utilisateur avant de fermer
read -p "Appuyez sur Entrée pour quitter..."