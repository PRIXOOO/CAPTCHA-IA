@echo off
cd /d "%~dp0"

echo [1/2] Installation de TOUTES les dependances (Bot + API + Maths)...

:: --- LISTE COMPLETE ---
:: opencv-python      : Pour la vision (cv2) [LLM-VL-1, 2, 3]
:: pyautogui          : Pour bouger la souris [LLM-VL-1, 2, 3]
:: mss                : Capture d'ecran ultra-rapide [LLM-VL-3]
:: scipy              : Pour lisser les courbes (spline) [LLM-VL-3]
:: numpy              : Calculs mathématiques [Tout]
:: google-genai       : NOUVELLE lib IA Google [LLM-VL-1, 2]
:: google-generativeai: ANCIENNE lib IA Google [api.py]
:: fastapi/uvicorn    : Pour le serveur web [api.py]
:: pandas/sklearn     : Pour le Machine Learning [api.py]

python -m pip install opencv-python pyautogui mss scipy numpy google-genai google-generativeai joblib pandas scikit-learn fastapi uvicorn

echo.
echo [2/2] Lancement de l'API...
python api.py
pause