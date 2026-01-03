import cv2
import numpy as np
import pyautogui
import time
import json
import random
import sys
import platform
import ctypes
from google import genai
from google.genai import types

# --- CONFIGURATION ---
API_KEY = "Votre clé" 
OFFSET_X = 0
OFFSET_Y = 0

client = genai.Client(api_key=API_KEY)
pyautogui.FAILSAFE = True

# --- 1. SCANNER D'ÉCHELLE (Responsive) ---
def get_screen_specs():
    """Détecte la vraie résolution et le facteur de zoom Windows"""
    if platform.system() != "Windows":
        return pyautogui.size()[0], pyautogui.size()[1], 1.0

    try:
        user32 = ctypes.windll.user32
        user32.SetProcessDPIAware()
        real_w = user32.GetSystemMetrics(0)
        real_h = user32.GetSystemMetrics(1)
        return real_w, real_h
    except:
        return 1920, 1080

# --- 2. VISION "CENTER-LOCK" ---
def get_coordinates_opencv(image_path, debug=True):
    img = cv2.imread(image_path)
    if img is None: return None, None
        
    h_screen, w_screen, _ = img.shape
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    
    lower_blue = np.array([90, 100, 100])
    upper_blue = np.array([130, 255, 255])
    
    lower_target = np.array([40, 40, 40])
    upper_target = np.array([95, 255, 255])
    
    mask_blue = cv2.inRange(hsv, lower_blue, upper_blue)
    mask_target_raw = cv2.inRange(hsv, lower_target, upper_target)
    mask_target = cv2.subtract(mask_target_raw, mask_blue)
    
    dilate_size = int(w_screen * 0.015) 
    if dilate_size < 5: dilate_size = 5
    
    kernel = np.ones((dilate_size, dilate_size), np.uint8)
    mask_target_dilated = cv2.dilate(mask_target, kernel, iterations=3)
    
    start_point = None
    end_point = None

    contours_blue, _ = cv2.findContours(mask_blue, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if contours_blue:
        largest_blue = max(contours_blue, key=cv2.contourArea)
        bx, by, bw, bh = cv2.boundingRect(largest_blue)
        start_point = (bx + bw // 2, by + bh // 2)

    contours_target, _ = cv2.findContours(mask_target_dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    valid_targets = []
    for c in contours_target:
        area = cv2.contourArea(c)
        if area < (w_screen * h_screen * 0.001): continue
        tx, ty, tw, th = cv2.boundingRect(c)
        center_y = ty + th // 2
        if center_y < h_screen * 0.20: continue 
        if center_y > h_screen * 0.80: continue 
        valid_targets.append((c, area))

    if valid_targets:
        target_contour = max(valid_targets, key=lambda x: x[1])[0]
        tx, ty, tw, th = cv2.boundingRect(target_contour)
        end_point = (tx + tw // 2, ty + th // 2)

    return start_point, end_point

# --- 3. GÉNÉRATION IA ---
def generate_human_path(start_x, start_y, end_x, end_y):
    dist = ((end_x - start_x)**2 + (end_y - start_y)**2)**0.5
    if dist < 10: return None

    print(f"Gemini calcule le trajet : ({start_x},{start_y}) -> ({end_x},{end_y})")
    
    prompt = f"""
    Tu es un moteur de souris biométrique.
    Départ : ({start_x}, {start_y})
    Arrivée : ({end_x}, {end_y})
    
    Génère une liste de coordonnées JSON pour déplacer la souris du Départ à l'Arrivée.
    Règles :
    1. La trajectoire ne doit pas être une ligne droite parfaite (léger arc).
    2. Le dernier point DOIT être strictement égal à l'Arrivée.
    3. Génère entre 20 et 40 points.
    
    Format JSON: {{"path": [{{"x": int, "y": int}}, ...]}}
    """
    
    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
            config=types.GenerateContentConfig(response_mime_type="application/json")
        )
        data = json.loads(response.text)
        return data.get("path", [])
    except Exception as e:
        print(f"Erreur IA : {e}")
        return [{"x": end_x, "y": end_y}]

def execute_human_move(path):
    if not path: return
    
    # --- MODIFICATION ICI : APPROCHE HUMAINE ---
    # 1. On va au départ (Le cube bleu) depuis la position actuelle
    first = path[0]
    
    # On génère une durée aléatoire pour l'approche (ex: entre 0.6 et 1.2 secondes)
    approach_duration = random.uniform(0.6, 1.2)
    
    print("Mouse approach...")
    # 'easeOutQuad' fait ralentir la souris à l'arrivée (effet naturel)
    pyautogui.moveTo(first['x'], first['y'], duration=approach_duration, tween=pyautogui.easeOutQuad)
    
    # Petite pause avant de saisir le cube (hésitation humaine)
    time.sleep(random.uniform(0.15, 0.3))
    pyautogui.mouseDown()
    
    # 2. On parcourt le chemin (Drag & Drop)
    total = len(path)
    for i, p in enumerate(path[1:]):
        progress = i / total
        speed = 0.005 
        
        if progress > 0.8: 
            speed = 0.02
            
        pyautogui.moveTo(p['x'], p['y'], duration=speed)

    # 3. Relâchement sécurisé
    last = path[-1]
    pyautogui.moveTo(last['x'], last['y']) 
    time.sleep(random.uniform(0.3, 0.5))
    pyautogui.mouseUp()

def main():
    print("Démarrage... (3s)")
    time.sleep(3)
    
    screenshot_path = "scan_screen.png"
    pyautogui.screenshot(screenshot_path)
    
    img_coords_start, img_coords_end = get_coordinates_opencv(screenshot_path)
    
    if not img_coords_start or not img_coords_end:
        print("Échec Vision : Bouton ou Cible introuvable.")
        return

    img = cv2.imread(screenshot_path)
    img_h, img_w, _ = img.shape
    
    screen_w, screen_h = pyautogui.size()
    
    ratio_x = screen_w / img_w
    ratio_y = screen_h / img_h
    
    real_start_x = int(img_coords_start[0] * ratio_x) + OFFSET_X
    real_start_y = int(img_coords_start[1] * ratio_y) + OFFSET_Y
    
    real_end_x = int(img_coords_end[0] * ratio_x) + OFFSET_X
    real_end_y = int(img_coords_end[1] * ratio_y) + OFFSET_Y
    
    print(f"Cible verrouillée à : {real_end_x}, {real_end_y}")

    path = generate_human_path(real_start_x, real_start_y, real_end_x, real_end_y)
    execute_human_move(path)

if __name__ == "__main__":
    main()

