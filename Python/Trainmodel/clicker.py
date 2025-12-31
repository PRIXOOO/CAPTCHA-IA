import pyautogui
import time
import random
import os

# --- REGLAGES ---
# Nom de ton image (garde ta capture HD, ça suffira)
image_name = 'bouton.png'

# --- PLAN A : RECONNAISSANCE D'IMAGE (Mode "Tolérant") ---
print("--- TENTATIVE 1 : RECONNAISSANCE VISUELLE ---")
found = False
target_x, target_y = 0, 0

if os.path.exists(image_name):
    try:
        # confidence=0.6 signifie qu'il accepte l'image même si elle est un peu floue
        # ou si la taille change un tout petit peu (c'est très permissif)
        location = pyautogui.locateCenterOnScreen(image_name, confidence=0.6, grayscale=True)
        if location:
            target_x, target_y = location
            print(f"Image trouvée à : {target_x}, {target_y}")
            found = True
    except Exception:
        pass
else:
    print("Pas d'image trouvée dans le dossier, passage au mode Mathématique.")

# --- PLAN B : MATHEMATIQUES CENTREES (Si l'image échoue) ---
if not found:
    print("--- TENTATIVE 2 : CALCUL MATHEMATIQUE (CENTRE + DECALAGE) ---")
    w, h = pyautogui.size()
    
    # LOGIQUE : Le site est centré.
    # Le bouton est toujours à droite du centre exact de l'écran.
    # On prend le milieu (w/2) et on ajoute environ 160 pixels vers la droite.
    
    target_x = int((w / 2) + 160) 
    target_y = int(h * 0.28) # La hauteur de 28% semble correcte d'après tes tests précédents
    
    print(f"Coordonnées calculées : {target_x}, {target_y}")

# --- ACTION : MOUVEMENT ET CLIC ---
# On ajoute une petite vérification pour ne pas cliquer hors écran
scr_w, scr_h = pyautogui.size()
if target_x < scr_w and target_y < scr_h:
    print(f"Déplacement vers la cible...")
    
    # Mouvement humain
    duration = random.uniform(0.5, 1.0)
    pyautogui.moveTo(target_x, target_y, duration=duration, tween=pyautogui.easeInOutQuad)
    
    pyautogui.click()
    print("--- CLIC EFFECTUE ---")
else:
    print("ERREUR : Les coordonnées sont hors de l'écran !")