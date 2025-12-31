export type Language = 'fr' | 'en';

export const translations = {
  fr: {
    app: {
      title: "Protocole Humanité",
      verify_title: "Vérification d'Humanité",
      verify_desc: "Séquence d'analyse biométrique interactive.",
      init_btn: "INITIALISER LE PROTOCOLE",
      secure_connection: "CONNEXION_SECURISEE",
      captured: "CAPTURÉ",
      switch_lang: "Switch to English version"
    },
    puzzle: {
      title: "Protocole 1 : Résolution du Puzzle",
      instr: "Glissez la pièce dans la zone cible.",
      feedback_retry: "Placement hors limites. Réessai du protocole...",
    },
    image: {
      title: "Protocole 2 : Reconnaissance Visuelle",
      instr_prefix: "Sélectionnez",
      instr_suffix: "les images contenant :",
      verify_btn: "Vérifier la sélection",
      loading: "ÉTABLISSEMENT DE LA LIAISON BIO-DB...",
      error_category: "Sélection invalide. Retirez les objets qui ne sont pas",
      error_empty: "Aucune entité biologique correspondante sélectionnée.",
      cats: "Chat",
      dogs: "Chien",
      cars: "Voiture",
      birds: "Oiseau"
    },
    trace: {
      title: "Protocole 3 : Précision",
      instr: "Tracez la ligne du début à la fin.",
      release: "Relâchez pour terminer.",
      error_short: "Tracé trop court. Veuillez parcourir toute la ligne.",
    },
    results: {
      complete_title: "Analyse Terminée",
      complete_desc: "Données de session capturées. Prêt pour vérification.",
      btn_verify: "LANCER LA VÉRIFICATION",
      btn_restart: "Recommencer le Captcha",
      metrics_title: "Métriques de Session",
      velocity_title: "Profil de Vélocité",
      export_manual: "Export Manuel (Actuel)",
      export_training: "Données d'Entraînement (Cumul)",
      reset_storage: "RÉINITIALISER LE STOCKAGE LOCAL",
      pass: "SUCCÈS",
      fail: "ÉCHEC",
      verifying: {
        init: "INITIALISATION",
        handshake: "Protocole en cours...",
        neural: "LIAISON NEURONALE ACTIVE",
        transmit_puzzle: "Transmission des données [Puzzle]...",
        semantic: "ANALYSE EN COURS...",
        sync_image: "Sync. Schémas Cognitifs [Image]...",
        finalizing: "FINALISATION BIOMÉTRIQUE",
        decrypt_trace: "Décryptage Micro-Mouvements [Trace]...",
        human_verif: "HUMAIN VÉRIFIÉ",
        bot_detect: "ROBOT DÉTECTÉ",
        welcome: "Bienvenue dans le monde réel.",
        access_denied: "Accès Refusé.",
        error: "ERREUR",
        lost: "Connexion Perdue."
      }
    },
    loader: {
      confidence: "Score de Confiance",
      sys_root: "SYS.RACINE",
      mem_alloc: "MEM.ALLOC",
      bio_metrics: "BIO.METRIQUES",
      encryption: "CHIFFREMENT",
      capturing: "CAPTURE...",
      init_handshake: "INIT. LIAISON... OK",
      reserved: "RÉSERVÉ"
    },
    verdict: {
      human_detected: "Humain Détecté",
      bot_detected: "Automate Détecté",
      human_desc: "Les schémas biométriques confirment une origine organique. Le chaos du contrôle moteur et le raisonnement sémantique sont dans la norme humaine.",
      bot_desc: "Linéarité algorithmique détectée. Le manque d'entropie dans le mouvement du curseur et le timing cognitif suggèrent un agent artificiel.",
      restart_btn: "Refaire le captcha",
      next_btn: "Suite",
      humanity: "Humanité",
      artificiality: "Artificialité",
      likelihood: "Probabilité"
    },
    grade: {
      title: "Évaluez l'Expérience",
      subtitle: "Votre avis influence le climat du système.",
      score_label: "Note Attribuée",
      btn_restart: "Refaire le Captcha",
      disclaimer: "Note : Il s'agit d'un ajout uniquement visuel. Nous ne procédons à aucune collecte d’informations."
    }
  },
  en: {
    app: {
      title: "Humanity Protocol",
      verify_title: "Verify Humanity",
      verify_desc: "Interactive biometric analysis sequence.",
      init_btn: "INITIALIZE PROTOCOL",
      secure_connection: "SECURE_CONNECTION",
      captured: "CAPTURED",
      switch_lang: "Passer en version Française"
    },
    puzzle: {
      title: "Protocol 1: Motor Control",
      instr: "Drag the piece to the target zone.",
      feedback_retry: "Placement out of bounds. Retrying protocol...",
    },
    image: {
      title: "Protocol 2: Semantic Logic",
      instr_prefix: "Select",
      instr_suffix: "all images containing a:",
      verify_btn: "Verify Selection",
      loading: "ESTABLISHING UPLINK TO BIO-DB...",
      error_category: "Invalid selection. Remove objects that are NOT",
      error_empty: "No matching biological entities selected.",
      cats: "Cat",
      dogs: "Dog",
      cars: "Car",
      birds: "Bird"
    },
    trace: {
      title: "Protocol 3: Precision",
      instr: "Trace the line from start to finish.",
      release: "Release to finish.",
      error_short: "Trace too short. Please cover the full path.",
    },
    results: {
      complete_title: "Analysis Complete",
      complete_desc: "Session data captured. Ready for verification.",
      btn_verify: "START VERIFICATION",
      btn_restart: "Restart Captcha",
      metrics_title: "Current Session Metrics",
      velocity_title: "Velocity Profile",
      export_manual: "Manual Export (Current)",
      export_training: "Training Data (Stacked)",
      reset_storage: "RESET LOCAL STORAGE",
      pass: "PASS",
      fail: "FAIL",
      verifying: {
        init: "INITIALIZING",
        handshake: "Handshake protocol...",
        neural: "NEURAL UPLINK ACTIVE",
        transmit_puzzle: "Transmitting Motor Control Data [Puzzle]...",
        semantic: "SEMANTIC ANALYSIS",
        sync_image: "Syncing Cognitive Patterns [Image]...",
        finalizing: "FINALIZING BIOMETRICS",
        decrypt_trace: "Decrypting Micro-Movements [Trace]...",
        human_verif: "HUMAN VERIFIED",
        bot_detect: "BOT DETECTED",
        welcome: "Welcome to the real world.",
        access_denied: "Access Denied.",
        error: "ERROR",
        lost: "Connection Lost."
      }
    },
    grade: {
      title: "Rate the Experience",
      subtitle: "Your feedback controls the system climate.",
      score_label: "Assigned Grade",
      btn_restart: "Restart Captcha",
      disclaimer: "Note: This is a purely visual addition. We do not collect any information."
    },
    loader: {
      confidence: "Confidence Score",
      sys_root: "SYS.ROOT",
      mem_alloc: "MEM.ALLOC",
      bio_metrics: "BIO.METRICS",
      encryption: "ENCRYPTION",
      capturing: "CAPTURING...",
      init_handshake: "INITIALIZING HANDSHAKE... OK",
      reserved: "RESERVED"
    },
    verdict: {
      human_detected: "Human Detected",
      bot_detected: "Automaton Detected",
      human_desc: "Biometric patterns confirm organic origin. Motor control chaos and semantic reasoning within human baseline.",
      bot_desc: "Algorithmic linearity detected. Lack of entropy in cursor movement and cognitive timing suggests artificial agent.",
      restart_btn: "Restart Captcha",
      next_btn: "Next",
      humanity: "Humanity",
      artificiality: "Artificiality",
      likelihood: "Likelihood"
    }
  }
};