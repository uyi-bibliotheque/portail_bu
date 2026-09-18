import os
import sys
import django

# Setup Django environment
sys.path.append('/home/john-nguembu/portail_bu/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from pmb_gateway.client import PMBClient

def test_login():
    username = "john-claude"
    password = "123456789John"
    
    print(f"Tentative de connexion PMB pour l'utilisateur: {username}")
    client = PMBClient()
    
    params = {
        "empr_login": username,
        "empr_password": password
    }
    
    try:
        print(f"URL ciblée: {client.endpoint}")
        session_id = client.call("pmbesOPACEmpr_login", params)
        print(f"Résultat Brut: {session_id}")
    except Exception as e:
        print(f"ERREUR LORS DE LA CONNEXION : {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_login()
