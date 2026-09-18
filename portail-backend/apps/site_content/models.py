# apps/site_content/models.py
import uuid
from django.db import models
from django.conf import settings
from django.utils import timezone
import os


class Article(models.Model):
    """Représente une actualité ou un événement publié sur le portail."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255, verbose_name="Titre")
    content = models.TextField(verbose_name="Contenu")
    
    # ─── Gestion des images ─────────────────────────────────────────
    image = models.ImageField(
        upload_to="news_images/", 
        blank=True, 
        null=True, 
        verbose_name="Illustration (upload local)"
    )
    image_url = models.URLField(
        max_length=500,
        blank=True,
        null=True,
        verbose_name="URL de l'image externe"
    )
    
    CATEGORY_CHOICES = [
        ('Informations', 'Informations'),
        ('Acquisitions', 'Acquisitions'),
        ('Événements', 'Événements'),
        ('Formation', 'Formation'),
        ('Annonces', 'Annonces'),
        ('Services', 'Services'),
        ('Ressources', 'Ressources'),
    ]
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='Informations', verbose_name="Catégorie")
    
    is_event = models.BooleanField(default=False, verbose_name="Est-ce un événement ?")
    event_date = models.DateTimeField(blank=True, null=True, verbose_name="Date de l'événement")
    
    is_published = models.BooleanField(default=True, verbose_name="Publié")
    publish_until = models.DateTimeField(blank=True, null=True, verbose_name="Date d'expiration")
    
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="articles",
        verbose_name="Auteur"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Actualité / Événement"
        verbose_name_plural = "Actualités & Événements"
        ordering = ["-created_at"]

    def __str__(self):
        return self.title

    def is_expired(self):
        """Vérifie si l'article a expiré."""
        if self.publish_until:
            return self.publish_until < timezone.now()
        return False

    def get_image_display(self):
        """Retourne l'URL de l'image (priorité à image_url si disponible)."""
        # Priorité 1: image_url externe
        if self.image_url:
            return self.image_url
        
        # Priorité 2: image uploadée localement
        if self.image:
            try:
                return self.image.url
            except ValueError:
                return None
        
        return None

    def get_image_filename(self):
        """Retourne le nom du fichier image."""
        if self.image:
            return os.path.basename(self.image.name)
        return None


class ContactMessage(models.Model):
    """Enregistre les messages de contact envoyés par les utilisateurs ou visiteurs."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=150, verbose_name="Nom complet")
    email = models.EmailField(verbose_name="Adresse Email")
    subject = models.CharField(max_length=200, verbose_name="Sujet")
    message = models.TextField(verbose_name="Message")
    is_read = models.BooleanField(default=False, verbose_name="Lu par l'administration ?")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Message de Contact"
        verbose_name_plural = "Messages de Contact"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.subject} - De {self.name}"