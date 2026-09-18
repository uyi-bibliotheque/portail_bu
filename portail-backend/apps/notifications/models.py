# apps/notifications/models.py
from django.db import models
from django.conf import settings


class Notification(models.Model):
    """
    Modèle de notification pour les utilisateurs.
    Stocke les notifications système et les emails envoyés.
    """
    id = models.AutoField(primary_key=True)
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    title = models.CharField(max_length=255, help_text="Titre de la notification")
    message = models.TextField(help_text="Contenu de la notification")
    link = models.CharField(
        max_length=500, 
        blank=True, 
        null=True,
        help_text="Lien vers la page associée"
    )
    is_read = models.BooleanField(
        default=False,
        help_text="Indique si la notification a été lue"
    )
    email_sent = models.BooleanField(
        default=False,
        help_text="Indique si un email a été envoyé"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Notification'
        verbose_name_plural = 'Notifications'
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['user', 'is_read']),
        ]

    def __str__(self):
        return f"{self.title} - {self.user.username} ({'Lu' if self.is_read else 'Non lu'})"

    def mark_as_read(self):
        """Marque la notification comme lue."""
        from django.utils import timezone
        self.is_read = True
        self.read_at = timezone.now()
        self.save(update_fields=['is_read', 'read_at'])
        return self

    def mark_as_unread(self):
        """Marque la notification comme non lue."""
        self.is_read = False
        self.read_at = None
        self.save(update_fields=['is_read', 'read_at'])
        return self