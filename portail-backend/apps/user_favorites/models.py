import uuid
from django.db import models
from django.conf import settings


class UserFavorite(models.Model):
    """Enregistre les notices ou documents favoris d'un utilisateur."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="favorites")
    pmb_notice_id = models.CharField(max_length=50, verbose_name="ID Notice PMB")
    note = models.TextField(blank=True, verbose_name="Notes personnelles sur le favori")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Favori"
        verbose_name_plural = "Favoris"
        unique_together = ("user", "pmb_notice_id") # Un utilisateur ne peut pas doubler un favori
        ordering = ["-created_at"]

    def __str__(self):
        return f"Favori {self.pmb_notice_id} - {self.user.username}"