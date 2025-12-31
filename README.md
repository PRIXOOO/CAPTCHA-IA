<!--
  PRIXOOOCAPTCHA-IA — Captcha sous LLM
  README proposé à partir du rapport de projet.
-->

<div align="center">

# CAPTCHA-IA — Captcha sous LLM ![Google CAPTCHA](https://developers.google.com/static/recaptcha/images/newCaptchaAnchor.gif?hl=fr)

**Un CAPTCHA comportemental full‑stack : détection Humain vs Bot via mouvements de souris + modèle ML hybride (Random Forest + second avis LLM en zone de doute).**

<!-- Remplace par votre bannière -->
<!-- ![Bannière](./assets/banner.png) -->

[![Python](https://img.shields.io/badge/Python-3.10-blue)](#)  
[![FastAPI](https://img.shields.io/badge/FastAPI-API-green)](#)
[![React](https://img.shields.io/badge/React-Frontend-61DAFB)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-3178C6)](#)

</div>

---

## ⚠️Configuration — Clé Gemini (optionnel)

Le projet peut utiliser **Gemini** comme “second avis” en *zone de doute* côté API, et aussi pour le bot attaquant.  
➡️ Pour activer ça, il faut renseigner une clé API Gemini dans :
- `/Python/Verifbot/API.py`
- `/Python/Trainmodel/LLM-VL-1.py`
- `/Python/Trainmodel/LLM-VL-2.py`
---

## Pourquoi ce projet ? [file:1]

Sur un web de plus en plus automatisé, distinguer un humain d’un bot est un enjeu concret de cybersécurité. [file:1]  
Ce projet propose un **CAPTCHA comportemental** : au lieu de lire du texte déformé ou de cocher une case, l’utilisateur réalise de petites épreuves et le système analyse la dynamique de la souris (vitesse, accélération, hésitations, régularité, “rectitude” des trajectoires). [file:1]

---

## Fonctionnalités [file:1]

- **3 mini‑jeux CAPTCHA** (frontend) : Trace, Puzzle, Sélection d’images, conçus pour capturer des signaux de motricité fine. [file:1]
- **Backend IA (API FastAPI)** : réception des séries temporelles \((x, y, t)\), extraction de features cinématiques, puis prédiction **Humain / Robot**. [file:1]
- **Détection hybride** : le Random Forest tranche si la confiance est élevée, sinon un **LLM (Gemini)** est sollicité en “zone de doute” pour un second avis. [file:1]
- **Bot attaquant** (adversaire) : script autonome utilisant OpenCV pour repérer l’interface à l’écran et Gemini pour générer des trajectoires “humaines”, exécutées via automatisation souris. [file:1]
- **Dashboard d’administration (Tkinter)** : lancement/gestion des services (API + site) sans manipulations complexes en ligne de commande. [file:1]

---

## Démo (à compléter)

- Vidéo / GIF de l’expérience utilisateur (mini‑jeux → verdict).  
  <!-- Ajoutez votre GIF ici -->
- Capture de l’architecture.  
  <!-- Ajoutez votre schéma ici -->



---

## Architecture (vue d’ensemble) [file:1]

**Pipeline principal :** navigateur (jeux) → API FastAPI → extraction de features → modèle ML → verdict. [file:1]  
**Renforcement :** si incertitude, appel LLM (Gemini) pour arbitrage final. [file:1]  
**Objectif “clés en main” :** un dashboard central orchestre le lancement des briques. [file:1]

<!-- Ajoutez un schéma -->
<!-- ![Architecture](./assets/architecture.png) -->

---

## Stack technique [file:1]

- Frontend : **React + TypeScript + Vite**. [file:1]
- Backend : **FastAPI** (serveur ASGI via **Uvicorn**). [file:1]
- ML/Data : **scikit‑learn (Random Forest)**, Pandas, NumPy, Joblib. [file:1]
- Bot attaquant : OpenCV, PyAutoGUI (+ génération de trajectoires via Gemini). [file:1]
- Orchestration : Dashboard **Tkinter**, scripts `.bat` / `.sh`. [file:1]

---

## Démarrage rapide (recommandé : Dashboard) [file:1]

### Prérequis [file:1]

- Python **3.10** (Python 3.14 est à éviter selon le rapport). [file:1]
- Node.js (pour le frontend React). [file:1]
- Ports locaux libres : **8000** (API) et **3000** (frontend). [file:1]
- (Optionnel) Une **clé API Gemini** si vous activez l’arbitrage LLM en zone de doute. [file:1]

### Lancer [file:1]

1. Se placer à la racine du projet. [file:1]
2. Lancer le Dashboard : `start.bat` (Windows) ou `start.sh` (macOS/Linux). [file:1]  
   - Si besoin : exécuter directement `python APP.py`. [file:1]
3. Dans le dashboard : lancer le backend (détecteur) puis le site (client). [file:1]
4. Ouvrir : `http://localhost:3000`. [file:1]

---

## Lancement manuel (plan B) [file:1]

### Frontend [file:1]

Depuis le dossier du site :
npm install
npm run build
npm run dev

Le site est accessible sur `http://localhost:3000`. [file:1]

### Backend (API) [file:1]

L’API est servie via Uvicorn (FastAPI). [file:1]  
Puis consulter la doc interactive : `http://localhost:8000/docs`. [file:1]

---

## Comment l’utiliser (parcours utilisateur) [file:1]

1. Ouvrir le site et initialiser le test. [file:1]
2. Réaliser les 3 épreuves (Puzzle, Sélection d’images, Trace) naturellement. [file:1]
3. Les sessions \((x, y, t)\) sont envoyées au backend. [file:1]
4. Le backend renvoie un verdict **Humain** ou **Robot** + un score (indice de confiance). [file:1]
5. En cas de doute, une vérification renforcée via Gemini peut augmenter le temps de réponse. [file:1]

---

## Bot attaquant (mode test) [file:1]

Le projet inclut un bot “adversaire” pour évaluer la robustesse du système : capture écran + repérage via OpenCV + trajectoires générées/ajustées par Gemini + exécution souris. [file:1]  
Le dashboard propose un bouton de test automatique qui lance successivement plusieurs scripts (protocole 1/2/3). [file:1]

> Important : certains tests nécessitent le navigateur en plein écran et une initialisation préalable, sinon la détection d’éléments à l’écran peut être perturbée. [file:1]

---

## Entraînement du modèle (ML) [file:1]

- Les données sont des séries temporelles de points \((x, y, timestamp)\), transformées en features (vitesse, accélération, variabilité, rectitude…). [file:1]
- Modèle : **Random Forest** entraîné sur un dataset Humains vs Bots, avec validation croisée (Stratified K‑Fold). [file:1]
- Un premier dataset minimal mentionné : **20 sessions humaines** et **20 sessions bot** pour valider la chaîne de bout en bout. [file:1]

---

## Roadmap / Perspectives [file:1]

- Collecter davantage de données et tester un modèle séquentiel (ex. LSTM) pour mieux exploiter la dimension temporelle. [file:1]
- Renforcer la sécurité de l’API (auth, anti‑rejeu). [file:1]
- Dockeriser l’ensemble pour simplifier installation et compatibilité. [file:1]

---

## Auteurs [file:1]

Projet réalisé du 7 octobre 2025 au 6 janvier 2026. [file:1]  
Membres : **Kebbache Walid** & **Yahou Sarah**. [file:1]

---

## Licence

MIT
