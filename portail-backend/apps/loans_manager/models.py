# apps/loans_manager/models.py
import uuid
from django.db import models
from django.conf import settings


class Reservation(models.Model):
    """Enregistre les réservations de documents faites par les utilisateurs."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="reservations")
    pmb_notice_id = models.CharField(max_length=50, verbose_name="ID Notice PMB")
    status = models.CharField(max_length=50, default="En attente", verbose_name="Statut de la réservation")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Réservation"
        verbose_name_plural = "Réservations"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Réservation {self.pmb_notice_id} par {self.user.username}"


class Loan(models.Model):
    """Enregistre les prêts des utilisateurs."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="loans")
    pmb_notice_id = models.CharField(max_length=50, verbose_name="ID Notice PMB")
    pmb_item_id = models.CharField(max_length=50, verbose_name="ID Exemplaire PMB", blank=True, null=True)
    title = models.CharField(max_length=255, verbose_name="Titre du document", blank=True)
    author = models.CharField(max_length=255, verbose_name="Auteur", blank=True)
    loan_date = models.DateTimeField(verbose_name="Date du prêt", null=True, blank=True)
    due_date = models.DateTimeField(verbose_name="Date de retour prévue", null=True, blank=True)
    returned_date = models.DateTimeField(verbose_name="Date de retour effectif", null=True, blank=True)
    status = models.CharField(max_length=50, default="En cours", verbose_name="Statut du prêt")
    is_renewable = models.BooleanField(default=False, verbose_name="Renouvelable")
    is_late = models.BooleanField(default=False, verbose_name="En retard")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Prêt"
        verbose_name_plural = "Prêts"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Prêt {self.pmb_notice_id} - {self.user.username}"

    @property
    def is_overdue(self):
        """Vérifie si le prêt est en retard."""
        if self.due_date and not self.returned_date:
            from django.utils import timezone
            return self.due_date < timezone.now()
        return False