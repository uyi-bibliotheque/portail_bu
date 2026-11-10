# apps/accounts/apps.py
from django.apps import AppConfig
import logging

logger = logging.getLogger(__name__)


class AccountsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.accounts'
    verbose_name = 'Comptes utilisateurs'

    def ready(self):
        """
        Charge les signaux de l'application et crée l'administrateur par défaut.
        Utilise une fonction différée pour éviter les imports circulaires.
        """
        # Importer à l'intérieur de la méthode ready pour éviter l'import circulaire
        from django.db.models.signals import post_migrate
        from django.contrib.auth import get_user_model
        from django.apps import apps
        
        import os
        def create_default_admin(sender, **kwargs):
            """Crée l'administrateur par défaut après les migrations."""
            try:
                User = get_user_model()
                PortalUser = apps.get_model('accounts', 'PortalUser')
                admin_password = os.environ.get('ADMIN_BCU_PASSWORD')
                if not admin_password:
                    logger.error("ADMIN_BCU_PASSWORD environment variable is not set. Cannot create default admin user.")
                    return
                if not User.objects.filter(username='admin_bcu').exists():
                    admin = User.objects.create_superuser(
                        username='admin_bcu',
                        email='admin@bcu-uyi.cm',
                        password=admin_password,
                        first_name='Administrateur',
                        last_name='BCU',
                        role=PortalUser.Role.ADMIN,
                        auth_source=PortalUser.AuthSource.LOCAL
                    )
                    logger.info("✅ Administrateur par défaut créé : admin_bcu")
                else:
                    logger.info("ℹ️ Administrateur par défaut existe déjà.")
            except Exception as e:
                logger.error(f"Erreur création administrateur: {e}")
        
        # Connecter la fonction au signal post_migrate
        post_migrate.connect(create_default_admin, sender=self)
        logger.info("✅ Signaux de accounts chargés avec succès")