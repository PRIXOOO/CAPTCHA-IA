import numpy as np
import pandas as pd

def compute_kinematics(df_events):
    """Calcule la physique sur des coordonnées normalisées (0.0 à 1.0)."""
    if len(df_events) < 2:
        return pd.Series(dtype=float), pd.Series(dtype=float), pd.Series(dtype=float), pd.Series(dtype=float)

    # Delta temps (ms)
    dt = df_events['t'].diff().fillna(0)
    
    # Delta positions (Normalisées !)
    # Si on est en 0-1, dx=0.5 signifie "moitié de l'écran"
    dx = df_events['x_norm'].diff().fillna(0)
    dy = df_events['y_norm'].diff().fillna(0)
    
    # Distance (en % d'écran)
    dist_segment = np.sqrt(dx**2 + dy**2)
    
    # Vitesse (% d'écran par ms)
    # Remplacer 0 par infini puis nettoyer pour éviter division par zéro
    speed = dist_segment / dt.replace(0, np.inf)
    speed = speed.replace(np.inf, 0)
    
    # Accélération
    accel = speed.diff().fillna(0) / dt.replace(0, np.inf)
    accel = accel.replace(np.inf, 0)

    return dist_segment, speed, accel, dt

def extract_features(json_content):
    # 1. Gestion Liste vs Dict
    if isinstance(json_content, list):
        if len(json_content) > 0:
            session = json_content[0]
        else:
            return None 
    else:
        session = json_content

    events = session.get('events', [])
    screen = session.get('screen', {})
    
    # Récupérer la taille d'écran (avec sécurité anti-zéro)
    width = float(screen.get('width', 0))
    height = float(screen.get('height', 0))
    if width == 0: width = 1920.0 # Valeur par défaut si manquant
    if height == 0: height = 1080.0

    features = {
        'duration': 0.0,
        'n_events': 0.0,
        'path_length': 0.0,
        'speed_mean': 0.0,
        'speed_std': 0.0,
        'accel_mean': 0.0,
        'straightness': 0.0,
        'n_pauses': 0.0
    }
    
    if not events or len(events) < 2:
        return features

    # 2. DataFrame
    df = pd.DataFrame(events)
    df['x'] = df['x'].astype(float)
    df['y'] = df['y'].astype(float)
    df['t'] = df['t'].astype(float)
    df = df.sort_values('t')

    # --- NORMALISATION CRITIQUE ---
    # On convertit tout en échelle 0.0 -> 1.0
    df['x_norm'] = df['x'] / width
    df['y_norm'] = df['y'] / height

    # 3. Calculs
    t_start = df['t'].iloc[0]
    t_end = df['t'].iloc[-1]
    
    features['n_events'] = len(df)
    features['duration'] = t_end - t_start
    
    # Cinématique sur les données NORMALISÉES
    dist_segment, speed, accel, dt = compute_kinematics(df)
    
    features['path_length'] = dist_segment.sum() # Longueur totale en % d'écran
    features['speed_mean'] = speed.mean()
    features['speed_std'] = speed.std()        # La variation reste pure (et comparable) !
    features['accel_mean'] = accel.abs().mean()
    
    # Straightness (Ratio) - Invariant à l'échelle de base, mais bon de le recalculer proprement
    start_pt = np.array([df['x_norm'].iloc[0], df['y_norm'].iloc[0]])
    end_pt = np.array([df['x_norm'].iloc[-1], df['y_norm'].iloc[-1]])
    dist_direct = np.linalg.norm(end_pt - start_pt)
    
    if dist_direct > 0:
        features['straightness'] = features['path_length'] / dist_direct
    else:
        features['straightness'] = 1.0
        
    features['n_pauses'] = (dt > 150).sum()
    
    return features