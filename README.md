<!--
  PRIXOOOCAPTCHA-IA — Captcha sous LLM
  README proposé à partir du rapport de projet.
-->

<div align="center">

# CAPTCHA-IA — Captcha sous LLM ![Google CAPTCHA](https://developers.google.com/static/recaptcha/images/newCaptchaAnchor.gif?hl=fr)

**Un CAPTCHA comportemental full‑stack : détection Humain vs Bot via mouvements de souris + modèle ML hybride (Random Forest + second avis LLM en zone de doute).**

<!-- Remplace par votre bannière -->
<!-- ![Bannière](./assets/banner.png) -->

[![Python](https://img.shields.io/badge/Python-3.13-blue)](#)  
[![FastAPI](https://img.shields.io/badge/FastAPI-API-green)](#)
[![React](https://img.shields.io/badge/React-Frontend-61DAFB)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-3178C6)](#)

</div>

---

## ⚠️Configuration — Clé Gemini

Le projet fonctionne sur **Windows** et théoriquement sur Linux/MacOS

Le projet peut utiliser **Gemini** comme “second avis” en *zone de doute* côté API, et aussi pour le bot attaquant.  
➡️ Pour activer ça, il faut renseigner une clé API Gemini dans :
- `/Python/Verifbot/src/API.py` (ligne 22)

![API](https://i.ibb.co/sJ3cspG2/API-py.png)
- `/Python/Trainmodel/LLM-VL-1.py` (ligne 14)
- `/Python/Trainmodel/LLM-VL-2.py` (ligne 12)

---

## Pourquoi ce projet ?

Sur un web de plus en plus automatisé, distinguer un humain d’un bot est un enjeu concret de cybersécurité.  
Ce projet propose un **CAPTCHA comportemental** : au lieu de lire du texte déformé ou de cocher une case, l’utilisateur réalise de petites épreuves et le système analyse la dynamique de la souris (vitesse, accélération, hésitations, régularité, “rectitude” des trajectoires). 

---

## Fonctionnalités

- **3 mini‑jeux CAPTCHA** (frontend) : Trace, Puzzle, Sélection d’images, conçus pour capturer des signaux de motricité fine. 
- **Backend IA (API FastAPI)** : réception des séries temporelles \((x, y, t)\), extraction de features cinématiques, puis prédiction **Humain / Robot**. 
- **Détection hybride** : le Random Forest tranche si la confiance est élevée, sinon un **LLM (Gemini)** est sollicité en “zone de doute” pour un second avis. 
- **Bot attaquant** (adversaire) : script autonome utilisant OpenCV pour repérer l’interface à l’écran et Gemini pour générer des trajectoires “humaines”, exécutées via automatisation souris.
- **Dashboard d’administration (Tkinter)** : lancement/gestion des services (API + site) sans manipulations complexes en ligne de commande.

---

## Démo

![DEMO](https://github.com/PRIXOOO/CAPTCHA-IA/raw/30001de2ef3d5608cbc6cf60c629ede2f8caa4d7/DEMO.gif)



---

## Architecture (vue d’ensemble)

**Pipeline principal :** navigateur (jeux) → API FastAPI → extraction de features → modèle ML → verdict.  
**Renforcement :** si incertitude, appel LLM (Gemini) pour arbitrage final.
**Objectif “clés en main” :** un dashboard central orchestre le lancement des briques.

<!-- Ajoutez un schéma -->
<!-- ![Architecture](./assets/architecture.png) -->

---

## Stack technique

- Frontend : **React + TypeScript + Vite**.
- Backend : **FastAPI** (serveur ASGI via **Uvicorn**).
- ML/Data : **scikit‑learn (Random Forest)**, Pandas, NumPy, Joblib.
- Bot attaquant : OpenCV, PyAutoGUI (+ génération de trajectoires via Gemini).
- Orchestration : Dashboard **Tkinter**, scripts `.bat` / `.sh`.

---

## Démarrage rapide (recommandé : Dashboard)

### Prérequis

- Python **3.10**  ou au dessus (Python 3.14 est à éviter).
- Node.js (pour le frontend React).
- Ports locaux libres : **8000** (API) et **3000** (frontend).
- (Optionnel) Une **clé API Gemini** si vous activez l’arbitrage LLM en zone de doute.

### Lancer

1. Se placer à la racine du projet. 
2. Lancer le Dashboard : `start.bat` (Windows) ou `start.sh` (macOS/Linux). 
   - Si besoin : exécuter directement `python APP.py`.
3. Dans le dashboard : lancer le backend (détecteur) puis le site (client).
4. Ouvrir : `http://localhost:3000`.

---

## Lancement manuel (plan B)

### Frontend

Depuis le dossier du site : 
tapez "cmd"(ou shell) dans la barre d'adresse  (ou vous pouvez accéder au dossier courant en utilisant 'cd') , puis dans le cmd(shell) tapez :

`npm install`

puis,

`npm run build`


`npm run dev`

Le site est accessible sur `http://localhost:3000`.

### Backend (API)

Lancer directement API.py dans `/Python/Verifbot/src/API.py`
L’API est servie via Uvicorn (FastAPI).
Puis consulter la doc interactive : `http://localhost:8000/docs`.

---

## Comment l’utiliser (parcours utilisateur)

1. Ouvrir le site et initialiser le test.
2. Réaliser les 3 épreuves (Puzzle, Sélection d’images, Trace) naturellement.
3. Les sessions \((x, y, t)\) sont envoyées au backend.
4. Le backend renvoie un verdict **Humain** ou **Robot** + un score (indice de confiance).
5. En cas de doute, une vérification renforcée via Gemini peut augmenter le temps de réponse.

---

## Bot attaquant (mode test)

![DEMO_BOT](https://github.com/PRIXOOO/CAPTCHA-IA/raw/f9490c2c9450f87d85633c833552d19f7f9a84ed/DEMO_BOT.gif)

Le projet inclut un bot “adversaire” pour évaluer la robustesse du système : capture écran + repérage via OpenCV + trajectoires générées/ajustées par Gemini + exécution souris.
Le dashboard propose un bouton de test automatique qui lance successivement plusieurs scripts (protocole 1/2/3).

> Important : certains tests nécessitent le navigateur en plein écran ,une initialisation préalable et d'une connexion stable (avec un upload correct!), sinon la détection d’éléments à l’écran peut être perturbée.

> Temps : en général 2/3min avec un ordinateur correct + une connexion assez rapide
---

## Entraînement du modèle (ML) 

- Les données sont des séries temporelles de points \((x, y, timestamp)\), transformées en features (vitesse, accélération, variabilité, rectitude…). 
- Modèle : **Random Forest** entraîné sur un dataset Humains vs Bots, avec validation croisée (Stratified K‑Fold).
- Un premier dataset minimal mentionné : **120 sessions humaines** et **100 sessions bot** pour valider la chaîne de bout en bout.

---

## Roadmap / Perspectives

- Collecter davantage de données et tester un modèle séquentiel (ex. LSTM) pour mieux exploiter la dimension temporelle.
- Renforcer la sécurité de l’API (auth, anti‑rejeu).
- Dockeriser l’ensemble pour simplifier installation et compatibilité.

---

## Auteurs

Projet réalisé du 7 octobre 2025 au 6 janvier 2026.

Membres :
| Nom & Prénom       | Identifiant GitHub            |
|--------------------|-------------------------------|
| Kebbache Walid     | [PRIXOOO](https://github.com/PRIXOOO) |
| Yahou Sarah        |               |


---

## Licence

MIT
