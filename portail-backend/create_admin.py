# create_admin.py
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()


def create_default_admin():
    """Crée l'administrateur par défaut s'il n'existe pas."""

    admin_username = 'admin_bcu'
    admin_email = 'admin@bcu-uyi.cm'
    admin_password = os.getenv('DEFAULT_ADMIN_PASSWORD')

    if not admin_password:
        raise RuntimeError(
            "DEFAULT_ADMIN_PASSWORD n'est pas défini dans l'environnement."
        )

    try:
        admin = User.objects.get(username=admin_username)

        # Si le compte existe déjà, on ne modifie PAS son mot de passe.
        print(f"ℹ️ L'administrateur {admin_username} existe déjà.")

        # On s'assure simplement qu'il possède les privilèges nécessaires.
        changed = False

        if not admin.is_staff:
            admin.is_staff = True
            changed = True

        if not admin.is_superuser:
            admin.is_superuser = True
            changed = True

        if hasattr(admin, 'role') and admin.role != User.Role.ADMIN:
            admin.role = User.Role.ADMIN
            changed = True

        if changed:
            admin.save()
            print("✅ Privilèges administrateur vérifiés/corrigés.")

        return

    except User.DoesNotExist:
        pass

    # Création du compte
    admin = User.objects.create_superuser(
        username=admin_username,
        email=admin_email,
        password=admin_password,
        first_name='Administrateur',
        last_name='BCU',
        role=User.Role.ADMIN,
        auth_source=User.AuthSource.LOCAL,
    )

    print("✅ Administrateur créé avec succès !")
    print(f"   Username : {admin_username}")
    print(f"   Email    : {admin_email}")


if __name__ == '__main__':
    create_default_admin()

