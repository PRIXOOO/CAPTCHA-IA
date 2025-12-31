@echo off
setlocal enabledelayedexpansion

:: Boucle de 1 a 20
for /L %%i in (1,1,20) do (
    echo   TEST N° %%i / 20    
    timeout /t 5 /nobreak >nul

    python -c "import pyautogui; w, h = pyautogui.size(); pyautogui.click(int(w/2), int(h*0.6))"

    timeout /t 2 /nobreak >nul

    call python LLM-VL-1.py
    timeout /t 8 /nobreak >nul
    
    call python LLM-VL-2.py
    timeout /t 8 /nobreak >nul
    
    call python LLM-VL-3.py

    python -c "import pyautogui; w, h = pyautogui.size(); pyautogui.click(int(w*0.35), int(h*0.75))"
    timeout /t 1 /nobreak >nul
    

    python -c "import pyautogui; w, h = pyautogui.size(); pyautogui.click(int(w*0.50), int(h*0.75))"
    timeout /t 1 /nobreak >nul
    

    python -c "import pyautogui; w, h = pyautogui.size(); pyautogui.click(int(w*0.65), int(h*0.75))"
    timeout /t 1 /nobreak >nul


    python -c "import pyautogui; w, h = pyautogui.size(); pyautogui.click(int(w/2), int(h*0.9))"
)

pause