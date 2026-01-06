import tkinter as tk
from tkinter import messagebox
import webbrowser
import os
import subprocess
import platform
import sys
import threading
import stat

# --- Fonctions Logiques ---

def rendre_executable(chemin_script):
    """Rend un fichier .sh exécutable sur Mac/Linux"""
    if platform.system() != "Windows":
        try:
            st = os.stat(chemin_script)
            os.chmod(chemin_script, st.st_mode | stat.S_IEXEC)
        except Exception as e:
            print(f"Warning chmod: {e}")

def lancer_backend_api():
    """Lance le script api.py (Compatible Windows/Mac/Linux)"""
    dossier_racine = os.path.dirname(os.path.abspath(__file__))
    dossier_src = os.path.join(dossier_racine, "Python", "VerifBot", "src")
    
    systeme = platform.system()
    
    # 1. Choix du fichier et de la commande selon l'OS
    if systeme == "Windows":
        nom_script = "start.bat"
        # Windows : start "Titre" cmd /k ...
        cmd_lancement = f'start "Backend API" cmd /k "{os.path.join(dossier_src, nom_script)}"'
    else:
        nom_script = "start.sh"
        chemin_script = os.path.join(dossier_src, nom_script)
        rendre_executable(chemin_script) # On s'assure qu'il est exécutable
        
        # Mac (Darwin)
        if systeme == "Darwin":
            cmd_lancement = f'open -a Terminal "{chemin_script}"'
        # Linux
        else:
            # Essaie d'utiliser l'émulateur par défaut
            cmd_lancement = f'x-terminal-emulator -e "{chemin_script}"'

    chemin_complet = os.path.join(dossier_src, nom_script)

    if os.path.exists(chemin_complet):
        try:
            print(f"Lancement Backend ({systeme}) : {chemin_complet}")
            subprocess.Popen(cmd_lancement, shell=True, cwd=dossier_src)
            
            # Active le bouton suivant (Site)
            try:
                btn_site.config(state="normal", bg="#90ee90")
            except:
                pass
            
        except Exception as e:
            messagebox.showerror("Erreur", f"Impossible de lancer le script : {e}")
    else:
        messagebox.showerror("Erreur", f"Fichier introuvable :\n{chemin_complet}\n(Vérifiez que start.bat ou start.sh existe)")

def lancer_frontend_react():
    """Lance le site (Compatible Windows/Mac/Linux)"""
    dossier_racine = os.path.dirname(os.path.abspath(__file__))
    dossier_site = os.path.join(dossier_racine, "site")
    
    systeme = platform.system()
    
    # 1. Choix du fichier selon l'OS
    if systeme == "Windows":
        nom_script = "serveur.bat"
        cmd_lancement = f'start "Serveur React" "{os.path.join(dossier_site, nom_script)}"'
    else:
        nom_script = "serveur.sh"
        chemin_script = os.path.join(dossier_site, nom_script)
        rendre_executable(chemin_script)
        
        if systeme == "Darwin": # Mac
            cmd_lancement = f'open -a Terminal "{chemin_script}"'
        else: # Linux
            cmd_lancement = f'x-terminal-emulator -e "{chemin_script}"'

    chemin_complet = os.path.join(dossier_site, nom_script)

    if os.path.exists(chemin_complet):
        try:
            print(f"Lancement Frontend ({systeme}) : {chemin_complet}")
            subprocess.Popen(cmd_lancement, shell=True, cwd=dossier_site)
            
            # ON ACTIVE LE BOUTON TEST BOT
            try:
                btn_test_llm.config(state="normal", bg="#57a6ff", fg="white")
            except:
                pass

        except Exception as e:
            messagebox.showerror("Erreur", f"Crash React : {e}")
            return
    else:
        messagebox.showerror("Erreur", f"Script introuvable : {nom_script}")
        return

def sequence_background():
    """Version DEBUG BLINDÉE : Compatible Tous OS"""
    import time
    
    dossier_racine = os.path.dirname(os.path.abspath(__file__))
    dossier_scripts = os.path.join(dossier_racine, "Python", "Trainmodel")
    
    scripts = ["LLM-VL-1.py", "LLM-VL-2.py", "LLM-VL-3.py"]
    
    # --- GESTION CROSS-PLATFORM DU MODE CACHÉ ---
    startupinfo = None
    creationflags = 0
    
    if platform.system() == "Windows":
        # Options spécifiques à Windows pour cacher la fenêtre
        startupinfo = subprocess.STARTUPINFO()
        startupinfo.dwFlags |= subprocess.STARTF_USESHOWWINDOW
        creationflags = subprocess.CREATE_NO_WINDOW
    
    # Variable d'environnement pour l'UTF-8
    env_utf8 = os.environ.copy()
    env_utf8["PYTHONIOENCODING"] = "utf-8"

    print(f"--- DÉBUT SÉQUENCE ({platform.system()}) ---")

    for nom_script in scripts:
        chemin_complet = os.path.join(dossier_scripts, nom_script)
        
        if os.path.exists(chemin_complet):
            print(f" >> Lancement de {nom_script}...")
            
            # On adapte les arguments selon l'OS
            kwargs = {
                "cwd": dossier_scripts,
                "capture_output": True,
                "text": True,
                "encoding": "utf-8",
                "env": env_utf8
            }
            
            # On ajoute les options Windows seulement si on est sous Windows
            if platform.system() == "Windows":
                kwargs["startupinfo"] = startupinfo
                kwargs["creationflags"] = creationflags

            resultat = subprocess.run(
                [sys.executable, chemin_complet],
                **kwargs # On passe les arguments préparés
            )
            
            if resultat.returncode != 0:
                print(f"CRASH de {nom_script} !")
                print("---------------- ERREUR ----------------")
                print(resultat.stderr)
                print("----------------------------------------")
            else:
                print(f"{nom_script} terminé.")
                # print(resultat.stdout) 
            
            print(f"Pause 5s...")
            time.sleep(5)
        else:
            print(f"ERREUR : Fichier introuvable -> {chemin_complet}")

    print("--- FIN SÉQUENCE ---")

def ouvrir_site_nodejs():
    """Ouvre la page de téléchargement de Node.js"""
    webbrowser.open("https://nodejs.org/en/download/")

def lancer_test_llm_sequence():
    import pyautogui
    import time
    
    # 1. On cache l'interface Python
    root.iconify() 
    
    # 2. On ouvre le site
    url_locale = "http://localhost:3000"
    webbrowser.open(url_locale)
    
    # 3. Automatisation Visuelle
    def action_visuelle():
        try:
            time.sleep(0.5)
            largeur, hauteur = pyautogui.size()
            
            # Gestion Plein écran selon l'OS
            if platform.system() == "Darwin": # Mac
                pyautogui.hotkey('command', 'ctrl', 'f')
            else: # Windows / Linux
                pyautogui.press('f11')
            
            time.sleep(2) 
            
            # Clic sur "Initialiser" (60% hauteur)
            # On recalcule la taille car le plein écran a pu changer la donne
            largeur, hauteur = pyautogui.size()
            pyautogui.moveTo(largeur / 2, hauteur * 0.60, duration=0.5)
            pyautogui.click()
            
            print("Site prêt. Lancement des robots...")
            
            thread_bot = threading.Thread(target=sequence_background)
            thread_bot.start()
            
        except Exception as e:
            messagebox.showerror("Erreur", f"Erreur automatisation : {e}")

    root.after(4000, action_visuelle)


# --- Gestion de la Fenêtre 'Assistant' ---

def ouvrir_fenetre_assistant():
    fenetre_srv = tk.Toplevel(root)
    fenetre_srv.title("Assistant d'Installation")
    fenetre_srv.geometry("450x550") 

    # --- ÉTAPE 1 ---
    lbl_et1 = tk.Label(fenetre_srv, text="Étape 1 : Prérequis", font=("Arial", 10, "bold"))
    lbl_et1.pack(pady=(10, 2))
    btn_node = tk.Button(fenetre_srv, text="Installer Node.js (Client)", command=ouvrir_site_nodejs, width=40)
    btn_node.pack()
    tk.Frame(fenetre_srv, height=2, bd=1, relief="sunken").pack(fill="x", padx=20, pady=10)

    # --- ÉTAPE 2 ---
    lbl_et2 = tk.Label(fenetre_srv, text="Étape 2 : Backend", font=("Arial", 10, "bold"))
    lbl_et2.pack(pady=2)
    btn_api = tk.Button(fenetre_srv, text="Lancer le Détecteur de Bot", command=lancer_backend_api, width=40, height=2)
    btn_api.pack(pady=5)
    tk.Frame(fenetre_srv, height=2, bd=1, relief="sunken").pack(fill="x", padx=20, pady=10)

    # --- ÉTAPE 3 ---
    lbl_et3 = tk.Label(fenetre_srv, text="Étape 3 : Frontend", font=("Arial", 10, "bold"))
    lbl_et3.pack(pady=2)
    
    global btn_site
    btn_site = tk.Button(fenetre_srv, 
                         text="Lancer le Site (Client React)", 
                         command=lancer_frontend_react, 
                         state="disabled", 
                         width=40, height=2)
    btn_site.pack(pady=5)
    tk.Frame(fenetre_srv, height=2, bd=1, relief="sunken").pack(fill="x", padx=20, pady=10)

    # --- ÉTAPE 4 (TEST BOT) ---
    lbl_et4 = tk.Label(fenetre_srv, text="Phase de test (optionnelle) : merci de ne pas intervenir durant le processus", font=("Arial", 10, "bold"))
    lbl_et4.pack(pady=2)

    global btn_test_llm
    btn_test_llm = tk.Button(fenetre_srv, 
                             text="Test du bot LLM-VL(5min)", 
                             command=lancer_test_llm_sequence,
                             state="disabled", 
                             width=40, height=2,
                             bg="SystemButtonFace") 
    btn_test_llm.pack(pady=5)


# --- Interface Principale ---
root = tk.Tk()
root.title("Dashboard Admin")
root.geometry("300x150")

label_main = tk.Label(root, text="Panneau de Contrôle", font=("Arial", 12))
label_main.pack(pady=20)

btn_srv_main = tk.Button(root, text="Ouvrir l'Assistant", command=ouvrir_fenetre_assistant, width=25, height=2)
btn_srv_main.pack(pady=5)

root.mainloop()

