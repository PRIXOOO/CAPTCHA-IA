@echo off
echo Installation des dependances...

REM Cree le fichier Verification.txt s'il n'existe pas
if not exist Verification.txt (
    echo Creation du fichier Verification.txt...
    echo. > Verification.txt
)

REM --- BLOCS EXISTANTS ---

findstr /C:"Fastapi installe" Verification.txt >nul
if %ERRORLEVEL% NEQ 0 (
    echo Installation de Fastapi...
    pip install fastapi
    echo Fastapi installe >> Verification.txt
    echo [OK] Fastapi installe avec succes
) else (
    echo Fastapi deja installe
)

findstr /C:"Uvicorn installe" Verification.txt >nul
if %ERRORLEVEL% NEQ 0 (
    echo Installation de Uvicorn...
    pip install uvicorn
    echo Uvicorn installe >> Verification.txt
    echo [OK] Uvicorn installe avec succes
) else (
    echo Uvicorn deja installe
)

findstr /C:"tensorflow installe" Verification.txt >nul
if %ERRORLEVEL% NEQ 0 (
    echo Installation de tensorflow...
    pip install tensorflow
    echo tensorflow installe >> Verification.txt
    echo [OK] tensorflow installe avec succes
) else (
    echo tensorflow deja installe
)

findstr /C:"torch installe" Verification.txt >nul
if %ERRORLEVEL% NEQ 0 (
    echo Installation de torch...
    pip install torch --index-url https://download.pytorch.org/whl/cpu
    echo torch installe >> Verification.txt
    echo [OK] torch installe avec succes
) else (
    echo torch deja installe
)

REM --- NOUVELLES LIBRAIRIES AJOUTEES ---

findstr /C:"OpenCV installe" Verification.txt >nul
if %ERRORLEVEL% NEQ 0 (
    echo Installation de OpenCV ^(cv2^)...
    pip install opencv-python
    echo OpenCV installe >> Verification.txt
    echo [OK] OpenCV installe avec succes
) else (
    echo OpenCV deja installe
)

findstr /C:"Numpy installe" Verification.txt >nul
if %ERRORLEVEL% NEQ 0 (
    echo Installation de Numpy...
    pip install numpy
    echo Numpy installe >> Verification.txt
    echo [OK] Numpy installe avec succes
) else (
    echo Numpy deja installe
)

findstr /C:"PyAutoGUI installe" Verification.txt >nul
if %ERRORLEVEL% NEQ 0 (
    echo Installation de PyAutoGUI...
    pip install pyautogui
    echo PyAutoGUI installe >> Verification.txt
    echo [OK] PyAutoGUI installe avec succes
) else (
    echo PyAutoGUI deja installe
)

findstr /C:"MSS installe" Verification.txt >nul
if %ERRORLEVEL% NEQ 0 (
    echo Installation de MSS...
    pip install mss
    echo MSS installe >> Verification.txt
    echo [OK] MSS installe avec succes
) else (
    echo MSS deja installe
)

findstr /C:"Scipy installe" Verification.txt >nul
if %ERRORLEVEL% NEQ 0 (
    echo Installation de Scipy...
    pip install scipy
    echo Scipy installe >> Verification.txt
    echo [OK] Scipy installe avec succes
) else (
    echo Scipy deja installe
)

findstr /C:"GoogleGenAI installe" Verification.txt >nul
if %ERRORLEVEL% NEQ 0 (
    echo Installation de Google GenAI SDK...
    pip install google-genai
    echo GoogleGenAI installe >> Verification.txt
    echo [OK] Google GenAI SDK installe avec succes
) else (
    echo Google GenAI SDK deja installe
)

findstr /C:"GoogleGenerativeAI installe" Verification.txt >nul
if %ERRORLEVEL% NEQ 0 (
    echo Installation de Google Generative AI...
    pip install google-generativeai
    echo GoogleGenerativeAI installe >> Verification.txt
    echo [OK] Google Generative AI installe avec succes
) else (
    echo Google Generative AI deja installe
)

findstr /C:"Joblib installe" Verification.txt >nul
if %ERRORLEVEL% NEQ 0 (
    echo Installation de Joblib...
    pip install joblib
    echo Joblib installe >> Verification.txt
    echo [OK] Joblib installe avec succes
) else (
    echo Joblib deja installe
)

findstr /C:"Pandas installe" Verification.txt >nul
if %ERRORLEVEL% NEQ 0 (
    echo Installation de Pandas...
    pip install pandas
    echo Pandas installe >> Verification.txt
    echo [OK] Pandas installe avec succes
) else (
    echo Pandas deja installe
)

echo.
echo Installation terminee !
pause