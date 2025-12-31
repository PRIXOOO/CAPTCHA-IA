@echo off
:: --- LA LIGNE MAGIQUE ---
cd /d "%~dp0"
:: ------------------------

echo Je suis maintenant dans le dossier : %CD%
echo Lancement des commandes...

:: (Le reste de ton code reste pareil)
call npm install
call npm run build
call npm run dev