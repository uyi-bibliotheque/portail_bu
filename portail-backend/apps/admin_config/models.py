import uuid
from django.db import models


class SiteConfiguration(models.Model):
    """Stocke les paramètres de configuration globale du portail documentaire."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    key = models.CharField(max_length=100, unique=True, verbose_name="Clé de configuration")
    value = models.TextField(blank=True, verbose_name="Valeur")
    description = models.CharField(max_length=255, blank=True, verbose_name="Description du paramètre")
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        app_label = 'admin_config'  # <-- Ajoute cette ligne explicitement
        verbose_name = "Configuration du Portail"
        verbose_name_plural = "Configurations du Portail"
        ordering = ["key"]

    def __str__(self):
        return f"{self.key} : {self.value[:50]}"