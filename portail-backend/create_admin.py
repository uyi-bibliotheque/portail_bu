# create_admin.py (à la racine du projet, côté backend)
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from accounts.models import PortalUser
from django.contrib.auth import get_user_model

User = get_user_model()

def create_default_admin():
    """Crée l'administrateur par défaut s'il n'existe pas."""
    admin_username = 'admin_bcu'
    admin_email = 'admin@bcu-uyi.cm'
    admin_password = 'AdminBCU2025!'  # À changer lors de la première connexion
    
    if not User.objects.filter(username=admin_username).exists():
        admin = User.objects.create_superuser(
            username=admin_username,
            email=admin_email,
            password=admin_password,
            first_name='Administrateur',
            last_name='BCU',
            role=PortalUser.Role.ADMIN,
            auth_source=PortalUser.AuthSource.LOCAL
        )
        print(f"✅ Administrateur créé avec succès !")
        print(f"   Username: {admin_username}")
        print(f"   Email: {admin_email}")
        print(f"   Password: {admin_password}")
        print("   ⚠️ Veuillez changer le mot de passe lors de la première connexion.")
    else:
        print(f"ℹ️ L'administrateur {admin_username} existe déjà.")

if __name__ == "__main__":
    create_default_admin()