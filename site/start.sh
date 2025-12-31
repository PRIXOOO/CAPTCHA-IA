#!/bin/bash

# --- LA LIGNE MAGIQUE (Version Mac/Linux) ---
# Cela force le terminal à se placer dans le dossier du script
cd "$(dirname "$0")"
# --------------------------------------------

echo "Je suis maintenant dans le dossier : $(pwd)"
echo "Lancement des commandes..."

# Installation et lancement (npm n'a pas besoin de 'call' sur Mac/Linux)
npm install
npm run build
npm run dev