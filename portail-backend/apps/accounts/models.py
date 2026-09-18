# apps/accounts/models.py - AJOUT DU RÔLE AIDE_BIBLIO

import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.utils import timezone


class PortalUserManager(BaseUserManager):
    """Manager personnalisé pour gérer la création d'utilisateurs avec UUID et email/username."""
    
    def create_user(self, username, email=None, password=None, **extra_fields):
        if not username:
            raise ValueError("L'identifiant (username) est obligatoire.")
        if email:
            email = self.normalize_email(email)
            
        # Valeurs par défaut pour les étudiants
        extra_fields.setdefault('role', PortalUser.Role.ETUDIANT)
        extra_fields.setdefault('auth_source', PortalUser.AuthSource.PMB)
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        
        user = self.model(username=username, email=email, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
            
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email=None, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', PortalUser.Role.ADMIN)
        extra_fields.setdefault('auth_source', PortalUser.AuthSource.LOCAL)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Le superutilisateur doit avoir is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Le superutilisateur doit avoir is_superuser=True.')

        return self.create_user(username, email, password, **extra_fields)


class PortalUser(AbstractUser):
    """
    Modèle utilisateur principal du portail (PORTAL_USER).
    Étend AbstractUser pour hériter de la sécurité native de Django.
    """
    
    class Role(models.TextChoices):
        ADMIN = 'ADMIN', 'Administrateur'
        BIBLIO = 'BIBLIO', 'Bibliothécaire'
        AIDE_BIBLIO = 'AIDE_BIBLIO', 'Aide-Bibliothécaire'  # ⬅️ NOUVEAU RÔLE
        ETUDIANT = 'ETUDIANT', 'Étudiant en fin de cycle'
        ENSEIGNANT = 'ENSEIGNANT', 'Enseignant / Chercheur'

    class AuthSource(models.TextChoices):
        LOCAL = 'local', 'Authentification Interne Django'
        PMB = 'pmb', 'Authentification SIGB PMB'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    groups = models.ManyToManyField(
        'auth.Group',
        verbose_name='groups',
        blank=True,
        help_text='The groups this user belongs to.',
        related_name="portal_user_set",
        related_query_name="portal_user",
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        verbose_name='user permissions',
        blank=True,
        help_text='Specific permissions for this user.',
        related_name="portal_user_set",
        related_query_name="portal_user",
    )

    auth_source = models.CharField(
        max_length=10, 
        choices=AuthSource.choices, 
        default=AuthSource.PMB,
        help_text="Origine de l'authentification (local ou pmb)"
    )
    
    pmb_lecteur_id = models.CharField(
        max_length=50, 
        unique=True, 
        null=True, 
        blank=True,
        db_index=True,
        help_text="ID unique de la fiche emprunteur/lecteur dans PMB"
    )
    
    role = models.CharField(
        max_length=15, 
        choices=Role.choices, 
        default=Role.ETUDIANT,
        db_index=True
    )
    
    preferences = models.JSONField(
        default=dict, 
        blank=True,
        help_text="Préférences utilisateur au format JSON (filtres, thèmes, etc.)"
    )
    
    last_pmb_sync = models.DateTimeField(
        null=True, 
        blank=True,
        help_text="Horodatage de la dernière synchronisation réussie des données depuis PMB"
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Date de création du compte sur le portail"
    )

    # Champs pour le personnel
    is_active = models.BooleanField(default=True)
    date_joined = models.DateTimeField(auto_now_add=True)

    objects = PortalUserManager()

    class Meta:
        app_label = 'accounts'
        db_table = 'portal_user'
        verbose_name = 'Utilisateur du Portail'
        verbose_name_plural = 'Utilisateurs du Portail'
        ordering = ['-created_at']

    @property
    def is_staff_member(self) -> bool:
        """Vérifie si l'utilisateur est un agent/administrateur (personnel interne)."""
        return self.role in [self.Role.ADMIN, self.Role.BIBLIO, self.Role.AIDE_BIBLIO] or self.is_staff or self.is_superuser

    @property
    def is_aide_biblio(self) -> bool:
        """Vérifie si l'utilisateur est un aide-bibliothécaire."""
        return self.role == self.Role.AIDE_BIBLIO

    @property
    def is_student(self) -> bool:
        """Vérifie si l'utilisateur est un étudiant."""
        return self.role == self.Role.ETUDIANT

    @property
    def is_teacher(self) -> bool:
        """Vérifie si l'utilisateur est un enseignant."""
        return self.role == self.Role.ENSEIGNANT

    def get_full_name(self):
        """Retourne le nom complet de l'utilisateur."""
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        return self.first_name or self.last_name or self.username

    def __str__(self):
        return f"{self.username} [{self.role}] ({self.auth_source})"

    def sync_with_pmb_data(self, pmb_data: dict):
        """
        Pattern Méthode Métier : Mettre à jour l'entité locale avec les données renvoyées par l'API PMB.
        """
        if 'email' in pmb_data and pmb_data['email']:
            self.email = pmb_data['email']
        if 'nom' in pmb_data:
            self.last_name = pmb_data['nom']
        if 'prenom' in pmb_data:
            self.first_name = pmb_data['prenom']
            
        self.last_pmb_sync = timezone.now()
        self.save()