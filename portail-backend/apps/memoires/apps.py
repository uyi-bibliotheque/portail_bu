# apps/memoires/apps.py
from django.apps import AppConfig
import logging

logger = logging.getLogger(__name__)


class MemoiresConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.memoires'
    verbose_name = "Mémoires et Thèses"

    def ready(self):
        try:
            import apps.memoires.signals
            logger.info("Signaux des mémoires chargés avec succès")
        except ImportError as e:
            logger.warning(f"Impossible de charger les signaux des mémoires: {str(e)}")
        except Exception as e:
            logger.error(f"Erreur lors du chargement des signaux des mémoires: {str(e)}")