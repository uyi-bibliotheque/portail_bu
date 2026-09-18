import os
import sys
import django
import json

# Setup Django environment
sys.path.append('/home/john-nguembu/portail_bu/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from pmb_gateway.client import PMBClient

def debug_pmb_profile():
    username = "johnny"
    password = "123456789John"
    
    print(f"--- DEBUG PMB PROFIL LECTEUR ---")
    client = PMBClient()
    
    params = {
        "empr_login": username,
        "empr_password": password
    }
    
    try:
        print("1. Authentification...")
        session_id = client.call("pmbesOPACEmpr_login", params)
        print(f"Session ID obtenue : {session_id}")
        
        if session_id:
            print("\n2. Récupération du profil...")
            profil = client.call("pmbesOPACEmpr_get_account_info", {"session_id": session_id})
            print("\n=== RÉPONSE BRUTE DE PMB ===")
            print(json.dumps(profil, indent=2, ensure_ascii=False))
            print("============================\n")
            
        else:
            print("Échec de connexion.")
    except Exception as e:
        print(f"ERREUR : {e}")

if __name__ == "__main__":
    debug_pmb_profile()
