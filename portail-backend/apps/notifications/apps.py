# apps/notifications/apps.py
from django.apps import AppConfig
import logging

logger = logging.getLogger(__name__)


class NotificationsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.notifications'
    verbose_name = 'Notifications'
    
    def ready(self):
        """
        Charge les signaux de l'application.
        """
        try:
            import apps.notifications.signals
            logger.info("✅ Signaux de notifications chargés avec succès")
        except ImportError:
            logger.debug("ℹ️ Aucun fichier signals.py trouvé pour notifications")
        except Exception as e:
            logger.warning(f"⚠️ Erreur lors du chargement des signaux de notifications: {str(e)}")