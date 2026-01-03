import cv2
import numpy as np
import pyautogui
import time
import json
import random
import math
from google import genai
from google.genai import types

# --- CONFIGURATION ---
API_KEY = "Votre clé" 
PREFERRED_MODEL = "gemini-3-pro-preview" 
client = genai.Client(api_key=API_KEY)

pyautogui.FAILSAFE = True

# --- FONCTIONS DE MOUVEMENT HUMAIN (PHYSICS) ---

def ease_out_quad(t):
    """Fonction de lissage pour ralentir à la fin (comme une main qui vise)."""
    return -t * (t - 2)

def human_move_to(target_x, target_y, duration=0.5):
    """
    Déplace la souris vers (x, y) en utilisant une courbe de Bézier
    pour simuler un mouvement humain (pas de ligne droite).
    """
    start_x, start_y = pyautogui.position()
    
    # Si le déplacement est minuscule, on clique direct
    dist = math.hypot(target_x - start_x, target_y - start_y)
    if dist < 5:
        pyautogui.moveTo(target_x, target_y)
        return

    # 1. Création de points de contrôle aléatoires pour faire un arc
    # On ajoute du "bruit" pour que la courbe ne soit jamais la même
    control1_x = start_x + (target_x - start_x) * random.uniform(0.1, 0.4) + random.uniform(-50, 50)
    control1_y = start_y + (target_y - start_y) * random.uniform(0.1, 0.4) + random.uniform(-50, 50)
    
    control2_x = start_x + (target_x - start_x) * random.uniform(0.6, 0.9) + random.uniform(-50, 50)
    control2_y = start_y + (target_y - start_y) * random.uniform(0.6, 0.9) + random.uniform(-50, 50)

    # 2. Génération de la trajectoire
    steps = int(dist / 2) # Plus c'est loin, plus il y a de pas
    steps = max(steps, 15) # Minimum de pas pour la fluidité
    
    for i in range(steps + 1):
        t = i / steps
        # Application de l'accélération/décélération
        t_smooth = ease_out_quad(t) 
        
        # Formule de Bézier Cubique
        u = 1 - t_smooth
        tt = t_smooth * t_smooth
        uu = u * u
        uuu = uu * u
        ttt = tt * t_smooth
        
        px = uuu * start_x + 3 * uu * t_smooth * control1_x + 3 * u * tt * control2_x + ttt * target_x
        py = uuu * start_y + 3 * uu * t_smooth * control1_y + 3 * u * tt * control2_y + ttt * target_y
        
        # Petit tremblement aléatoire (imperfection humaine)
        jitter_x = random.uniform(-1, 1)
        jitter_y = random.uniform(-1, 1)
        
        pyautogui.moveTo(px + jitter_x, py + jitter_y, _pause=False)
        
        # Pause minuscule variable entre chaque pas (vitesse non constante)
        time.sleep(random.uniform(0.0001, 0.005))
    
    # Correction finale précise
    pyautogui.moveTo(target_x, target_y, duration=0.1)

# --- FONCTIONS VISION & IA (INCHANGÉES) ---

def get_screen_scale(image_path):
    img = cv2.imread(image_path)
    phys_h, phys_w, _ = img.shape
    screen_w, screen_h = pyautogui.size()
    return phys_w / screen_w, phys_h / screen_h

def get_captcha_grid(image_path):
    img = cv2.imread(image_path)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    edges = cv2.Canny(blurred, 50, 200)
    kernel = np.ones((3,3), np.uint8)
    dilated = cv2.dilate(edges, kernel, iterations=1)
    contours, _ = cv2.findContours(dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    valid_boxes = []
    for cnt in contours:
        area = cv2.contourArea(cnt)
        if area > 2000: 
            x, y, w, h = cv2.boundingRect(cnt)
            if 0.8 <= float(w)/h <= 1.2:
                valid_boxes.append((x, y, w, h))

    if len(valid_boxes) >= 4:
        min_x = min([b[0] for b in valid_boxes])
        min_y = min([b[1] for b in valid_boxes])
        max_x = max([b[0] + b[2] for b in valid_boxes])
        max_y = max([b[1] + b[3] for b in valid_boxes])
        return (min_x, min_y, max_x - min_x, max_y - min_y)
    return None

def find_verify_button(image_path, grid_rect):
    img = cv2.imread(image_path)
    gx, gy, gw, gh = grid_rect
    roi_y, roi_h = gy + gh, 300
    roi = img[roi_y:roi_y+roi_h, gx:gx+gw]
    
    hsv = cv2.cvtColor(roi, cv2.COLOR_BGR2HSV)
    lower_blue = np.array([90, 80, 100])
    upper_blue = np.array([130, 255, 255])
    mask = cv2.inRange(hsv, lower_blue, upper_blue)
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    if contours:
        largest = max(contours, key=cv2.contourArea)
        if cv2.contourArea(largest) > 500:
            x, y, w, h = cv2.boundingRect(largest)
            return (gx + x + w//2, roi_y + y + h//2)
    return None

def analyze_with_gemini(image_path, grid_rect):
    gx, gy, gw, gh = grid_rect
    img = cv2.imread(image_path)
    
    # Crop large pour la consigne
    y_start = max(0, gy - 200) 
    y_end = min(img.shape[0], gy + gh + 10)
    x_start = max(0, gx - 20)
    x_end = min(img.shape[1], gx + gw + 20)
    crop = img[y_start:y_end, x_start:x_end]
    _, buffer = cv2.imencode('.jpg', crop)
    
    # Prompt renforcé pour éviter le blabla
    prompt = """
    Rôle : Tu es un assistant d'accessibilité visuelle.
    Tâche :
    1. LIS le texte en haut de l'image (ex: "Select all images containing a...").
    2. Identifie les cases (1 à 9) qui correspondent à cette demande.
    
    IMPORTANT :
    - Réponds UNIQUEMENT au format JSON brut.
    - Pas de markdown (```json), pas d'introduction, pas de conclusion.
    - Si la consigne est "Cat", ignore les lions/tigres.
    
    Format attendu :
    { "target_object": "objet lu", "matches": [1, 5, 9] }
    """
    
    # On tente 3 fois max si l'IA échoue ou renvoie un format bizarre
    max_retries = 3
    for attempt in range(max_retries):
        try:
            print(f"   ⏳ Tentative IA {attempt+1}/{max_retries}...")
            
            response = client.models.generate_content(
                model=PREFERRED_MODEL,
                contents=[prompt, types.Part.from_bytes(data=buffer.tobytes(), mime_type="image/jpeg")],
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.1 # Réduit la créativité pour être plus strict
                )
            )
            
            raw_text = response.text
            
            # --- NETTOYAGE DU JSON (Le correctif est ici) ---
            # Parfois Gemini met ```json ... ```, on doit l'enlever
            cleaned_text = raw_text.replace("```json", "").replace("```", "").strip()
            
            data = json.loads(cleaned_text)
            
            # Vérification basique que le JSON est valide
            if "matches" in data:
                return data
            else:
                print(f"JSON incomplet reçu : {cleaned_text}")
                
        except Exception as e:
            print(f"Erreur lors de la tentative {attempt+1} : {e}")
            # Si c'est la dernière tentative, on affiche la réponse brute pour débugger
            if attempt == max_retries - 1:
                print(f"Échec définitif. Réponse brute de l'IA : {raw_text if 'raw_text' in locals() else 'Aucune'}")
            time.sleep(1) # Petite pause avant de réessayer

    return None

def main():
    print("Démarrage dans 2 secondes...")
    time.sleep(2)
    
    screenshot_file = "current_screen.png"
    pyautogui.screenshot(screenshot_file)
    
    sx, sy = get_screen_scale(screenshot_file)
    grid_rect = get_captcha_grid(screenshot_file)
    
    if not grid_rect:
        print("Grille introuvable.")
        return

    print("Analyse IA (Lecture consigne + Vision)...")
    result = analyze_with_gemini(screenshot_file, grid_rect)
    
    if result and "matches" in result:
        target = result.get("target_object", "Inconnu")
        matches = list(set(result["matches"]))
        print(f"Consigne : '{target}' | Cases : {matches}")
        
        gx, gy, gw, gh = grid_rect
        cell_w, cell_h = gw // 3, gh // 3
        
        for num in matches:
            if not (1 <= num <= 9): continue
            idx = num - 1
            
            # Cible : centre de la case
            px = gx + (idx % 3 * cell_w) + (cell_w // 2)
            py = gy + (idx // 3 * cell_h) + (cell_h // 2)
            
            # Ajout d'un offset aléatoire pour ne pas cliquer PILE au centre (très robotique)
            offset_x = random.randint(-20, 20)
            offset_y = random.randint(-20, 20)
            
            target_x = int((px + offset_x) / sx)
            target_y = int((py + offset_y) / sy)
            
            print(f"  -> Mouvement humain vers case {num}")
            
            # UTILISATION DU MOUVEMENT HUMAIN
            human_move_to(target_x, target_y)
            pyautogui.click()
            
            # Pause humaine aléatoire après clic
            time.sleep(random.uniform(0.2, 0.6))
            
        print("Validation...")
        btn_pos = find_verify_button(screenshot_file, grid_rect)
        if btn_pos:
            tx = int(btn_pos[0] / sx)
            ty = int(btn_pos[1] / sy)
            human_move_to(tx, ty)
            pyautogui.click()
        else:
            tx = int((gx + gw/2) / sx)
            ty = int((gy + gh + 80) / sy)
            human_move_to(tx, ty)
            pyautogui.click()
            
    else:
        print("L'IA n'a pas compris le captcha.")

if __name__ == "__main__":
    main()
