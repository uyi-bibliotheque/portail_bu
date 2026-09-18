import uuid
from django.db import models


class DigitalDocument(models.Model):
    """Représente un document numérique téléchargeable sur le portail."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255, verbose_name="Titre du document")
    description = models.TextField(blank=True, verbose_name="Description")
    file = models.FileField(upload_to="digital_documents/", verbose_name="Fichier (PDF)")
    
    # Lien optionnel avec une notice PMB
    pmb_notice_id = models.CharField(max_length=50, blank=True, null=True, verbose_name="ID Notice PMB associée")
    
    # Contrôle d'accès
    is_restricted = models.BooleanField(default=True, verbose_name="Réservé aux connectés ?")
    
    # Statistiques
    download_count = models.PositiveIntegerField(default=0, verbose_name="Nombre de téléchargements")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Document Numérique"
        verbose_name_plural = "Documents Numériques"
        ordering = ["-created_at"]

    def __str__(self):
        return self.title