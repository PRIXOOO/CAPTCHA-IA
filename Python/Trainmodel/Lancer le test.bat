@echo off
python -m pip install opencv-python pyautogui mss scipy numpy google-genai --quiet

echo le test se lance dans 10sec
timeout /t 10 /nobreak >nul

call python LLM-VL-1.py
timeout /t 2 /nobreak >nul

call python LLM-VL-2.py
timeout /t 2 /nobreak >nul

call python LLM-VL-3.py
timeout /t 5 /nobreak >nul

echo TERMINE.
pause