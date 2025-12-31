@echo off
python -m pip install opencv-python pyautogui mss scipy numpy google-genai --quiet

for /L %%i in (1,1,40) do (
    echo ========================================================
    echo CYCLE %%i SUR 10
    echo ========================================================

    echo [1/3] Lancement de LLM-VL-1...
    call python LLM-VL-1.py
    timeout /t 2 /nobreak >nul

    echo [2/3] Lancement de LLM-VL-2...
    call python LLM-VL-2.py
    timeout /t 2 /nobreak >nul

    echo [3/3] Lancement de LLM-VL-3...
    call python LLM-VL-3.py
    
    echo Attente de 5 secondes...
    timeout /t 5 /nobreak >nul
    
    echo Lancement de la reconnaissance visuelle...
    call python clicker.py
    
    echo Pause de securite...
    timeout /t 3 /nobreak >nul
)

echo TERMINE.
pause