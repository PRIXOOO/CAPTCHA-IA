import cv2
import numpy as np
import pyautogui
import time
import random
import ctypes
from mss import mss
from scipy.interpolate import splprep, splev

# --- CONFIGURATION CRITIQUE ---
SPEED = 3.5 
STABILIZATION_TIME = 0.5 

# C'EST ICI QUE TU RÈGLES TON PROBLÈME
# 1.0 = Suit exactement la ligne détectée
# 1.05 = Exagère la vague de 5% (Monte plus haut, descend plus bas)
# 1.10 = Exagère de 10% (Si il coupe encore trop les virages, mets 1.1)
AMPLITUDE_BOOST = 1.08 

# On ignore le début/fin pour éviter les clics foi0173eux
SKIP_START = 0.03
SKIP_END = 0.05

# --- CORRECTION DPI ---
try:
    ctypes.windll.shcore.SetProcessDpiAwareness(2) 
except Exception:
    ctypes.windll.user32.SetProcessDPIAware()

def get_path_boosted():
    with mss() as sct:
        monitor = sct.monitors[1]
        screenshot = np.array(sct.grab(monitor))
        img = cv2.cvtColor(screenshot, cv2.COLOR_BGRA2BGR)
        
        full_h, full_w, _ = img.shape
        
        # 1. Zone de travail (Large)
        mask_zone = np.zeros((full_h, full_w), dtype=np.uint8)
        cv2.rectangle(mask_zone, (0, int(full_h * 0.20)), (full_w, int(full_h * 0.80)), 255, -1)
        
        # 2. Détection Cyan
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        lower_blue = np.array([80, 50, 50])
        upper_blue = np.array([135, 255, 255])
        color_mask = cv2.inRange(hsv, lower_blue, upper_blue)
        final_mask = cv2.bitwise_and(color_mask, color_mask, mask=mask_zone)
        
        # 3. Dilatation pour connecter les points (Adaptatif)
        k_size = max(3, int(full_h * 0.006)) 
        kernel = np.ones((k_size, k_size), np.uint8)
        processed_mask = cv2.dilate(final_mask, kernel, iterations=3)
        
        contours, _ = cv2.findContours(processed_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        if not contours: return None, 1, 1

        largest_contour = max(contours, key=lambda c: cv2.boundingRect(c)[2])
        if cv2.boundingRect(largest_contour)[2] < full_w * 0.1: return None, 1, 1

        # 4. Extraction des points
        x, y, w, h = cv2.boundingRect(largest_contour)
        sub_mask = processed_mask[y:y+h, x:x+w]
        
        points = []
        
        # Coupe des extrémités
        start_x = int(w * SKIP_START)
        end_x = int(w * (1 - SKIP_END))
        step = max(2, int(full_w * 0.003)) 
        
        for col in range(start_x, end_x, step):
            whites = np.where(sub_mask[:, col] > 0)[0]
            if len(whites) > 0:
                # On utilise la médiane pour être bien au centre de la ligne bleue
                mid_y = int(np.median(whites)) + y
                abs_x = x + col
                points.append((abs_x + monitor["left"], mid_y + monitor["top"]))

        # --- 5. BOOST D'AMPLITUDE (La Correction) ---
        if points:
            # On trouve l'axe central horizontal (l'horizon de la vague)
            all_y = [p[1] for p in points]
            horizon_y = sum(all_y) / len(all_y)
            
            boosted_points = []
            for px, py in points:
                # On calcule l'écart par rapport au centre
                dist_from_horizon = py - horizon_y
                
                # On MULTIPLIE cet écart pour forcer le robot à aller plus loin
                new_dist = dist_from_horizon * AMPLITUDE_BOOST
                
                new_py = horizon_y + new_dist
                boosted_points.append((px, new_py))
            
            points = boosted_points

        sx = pyautogui.size()[0] / full_w
        sy = pyautogui.size()[1] / full_h
        
        return points, sx, sy

def get_smooth_path(points):
    if len(points) < 5: return []
    x = [p[0] for p in points]
    y = [p[1] for p in points]
    try:
        # Interpolation douce pour garder les courbes
        tck, u = splprep([x, y], s=len(points)*5, k=3) 
        u_new = np.linspace(u.min(), u.max(), len(points))
        x_new, y_new = splev(u_new, tck)
        return list(zip(x_new, y_new))
    except:
        return points

def main():
    print(f"--- PROTOCOLE V10 : AMPLITUDE BOOST ({AMPLITUDE_BOOST}) ---")
    print("Correction : J'exagère les courbes pour ne pas couper les virages.")
    time.sleep(3)
    
    data = get_path_boosted()
    if not data:
        print("Erreur vision.")
        return
        
    raw_points, sx, sy = data
    path = get_smooth_path(raw_points)

    if not path: return

    try:
        # Approche
        start_x = path[0][0] * sx
        start_y = path[0][1] * sy
        
        pyautogui.moveTo(start_x, start_y, duration=0.6, tween=pyautogui.easeOutQuad)
        time.sleep(STABILIZATION_TIME)
        
        pyautogui.mouseDown()
        
        step_time = SPEED / len(path)
        
        # Tremblement léger
        chaos_lvl = 2
        
        for px, py in path[1:]:
            real_x = px * sx
            real_y = py * sy
            
            noise_x = random.uniform(-chaos_lvl, chaos_lvl)
            noise_y = random.uniform(-chaos_lvl, chaos_lvl)
            
            pyautogui.moveTo(real_x + noise_x, real_y + noise_y)
            time.sleep(step_time)
            
        time.sleep(0.1)
        pyautogui.mouseUp()
        print("Terminé.")
        
    except pyautogui.FailSafeException:
        pass

if __name__ == "__main__":
    pyautogui.FAILSAFE = True
    pyautogui.PAUSE = 0
    main()