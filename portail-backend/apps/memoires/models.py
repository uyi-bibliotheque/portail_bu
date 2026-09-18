# apps/memoires/models.py
import uuid
from django.conf import settings
from django.db import models
from django.core.exceptions import ValidationError
from django.utils import timezone


class Memoire(models.Model):
    # ─── Types de documents ──────────────────────────────────────────
    class TypeDocument(models.TextChoices):
        MEMOIRE = 'MEMOIRE', 'Mémoire de Master'
        THESE = 'THESE', 'Thèse de Doctorat'

    # ─── Statuts ─────────────────────────────────────────────────────
    STATUS_CHOICES = [
        ('brouillon', 'Brouillon'),
        ('depot_en_ligne', 'Dépôt en ligne effectué'),
        ('convocation_envoyee', 'Convocation envoyée'),
        ('relance_envoyee', 'Relance envoyée'),
        ('en_attente_verification', 'En attente de vérification physique'),
        ('verification_ok', 'Vérification physique OK'),
        ('rejete', 'Rejeté'),
        ('en_attente_quitus', 'En attente de signature du quitus'),
        ('quitus_disponible', 'Quitus disponible'),
        ('quitus_retire', 'Quitus retiré'),
        ('abandonne', 'Abandonné'),
    ]

    STATUS_TRANSITIONS = {
        'brouillon': ['depot_en_ligne'],
        'depot_en_ligne': ['convocation_envoyee', 'abandonne'],
        'convocation_envoyee': ['en_attente_verification', 'relance_envoyee', 'abandonne'],
        'relance_envoyee': ['en_attente_verification', 'abandonne'],
        'en_attente_verification': ['verification_ok', 'rejete'],
        'rejete': ['depot_en_ligne'],
        'verification_ok': ['en_attente_quitus'],
        'en_attente_quitus': ['quitus_disponible'],
        'quitus_disponible': ['quitus_retire'],
        'quitus_retire': [],
        'abandonne': [],
    }

    # ─── Champs de base ─────────────────────────────────────────────
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Type de document
    type_document = models.CharField(
        max_length=10,
        choices=TypeDocument.choices,
        default=TypeDocument.MEMOIRE,
        verbose_name="Type de document"
    )
    
    # Auteur
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name="memoires", 
        verbose_name="Auteur"
    )
    
    # Informations de l'étudiant (pré-remplies mais modifiables)
    matricule = models.CharField(
        max_length=50, 
        blank=True, 
        null=True,
        verbose_name="Matricule"
    )
    full_name = models.CharField(
        max_length=200, 
        blank=True, 
        null=True,
        verbose_name="Nom complet"
    )
    filiere = models.CharField(
        max_length=200, 
        blank=True, 
        null=True,
        verbose_name="Filière / Département"
    )
    unite_recherche = models.CharField(
        max_length=200, 
        blank=True, 
        null=True,
        verbose_name="Unité de recherche"
    )
    laboratoire = models.CharField(
        max_length=200, 
        blank=True, 
        null=True,
        verbose_name="Laboratoire / Spécialité"
    )
    
    # Informations du document
    title = models.CharField(
        max_length=500, 
        verbose_name="Titre du document"
    )
    abstract = models.TextField(
        blank=True, 
        null=True,
        verbose_name="Résumé"
    )
    keywords = models.CharField(
        max_length=500, 
        blank=True, 
        null=True,
        verbose_name="Mots-clés"
    )
    
    # ─── Jury ────────────────────────────────────────────────────────
    president_jury = models.CharField(
        max_length=200, 
        blank=True, 
        null=True,
        verbose_name="Président du jury"
    )
    examinateur_1 = models.CharField(
        max_length=200, 
        blank=True, 
        null=True,
        verbose_name="Examinateur 1"
    )
    examinateur_2 = models.CharField(
        max_length=200, 
        blank=True, 
        null=True,
        verbose_name="Examinateur 2"
    )
    examinateur_3 = models.CharField(
        max_length=200, 
        blank=True, 
        null=True,
        verbose_name="Examinateur 3"
    )
    
    # ─── Fichiers ────────────────────────────────────────────────────
    pdf_file = models.FileField(
        upload_to="memoires_pdf/",
        null=True,
        blank=True,
        verbose_name="Fichier PDF"
    )
    word_file = models.FileField(
        upload_to="memoires_word/",
        null=True,
        blank=True,
        verbose_name="Fichier Word"
    )
    
    # ─── Documents signés ───────────────────────────────────────────
    scanned_document = models.FileField(
        upload_to="memoires_scanned/", 
        null=True, 
        blank=True,
        verbose_name="Document scanné signé"
    )
    
    # ─── Quitus ─────────────────────────────────────────────────────
    quitus_file = models.FileField(
        upload_to="quitus_files/", 
        null=True, 
        blank=True,
        verbose_name="Fichier PDF du Quitus"
    )
    is_quitus_signed = models.BooleanField(
        default=False, 
        verbose_name="Quitus signé électroniquement"
    )
    is_quitus_physically_signed = models.BooleanField(
        default=False, 
        verbose_name="Quitus signé physiquement"
    )
    
    # ─── Statut et workflow ─────────────────────────────────────────
    status = models.CharField(
        max_length=25, 
        choices=STATUS_CHOICES, 
        default='brouillon', 
        verbose_name="Statut"
    )
    rejection_reason = models.TextField(
        blank=True, 
        null=True, 
        verbose_name="Motif de rejet"
    )
    
    # ─── Dates importantes ──────────────────────────────────────────
    submitted_at = models.DateTimeField(
        null=True, 
        blank=True, 
        verbose_name="Date de soumission en ligne"
    )
    convocation_sent_at = models.DateTimeField(
        null=True, 
        blank=True, 
        verbose_name="Date d'envoi de la convocation"
    )
    relance_sent_at = models.DateTimeField(
        null=True, 
        blank=True, 
        verbose_name="Date d'envoi de la relance"
    )
    physical_verified_at = models.DateTimeField(
        null=True, 
        blank=True, 
        verbose_name="Date de vérification physique"
    )
    quitus_available_at = models.DateTimeField(
        null=True, 
        blank=True, 
        verbose_name="Date de disponibilité du quitus"
    )
    quitus_retired_at = models.DateTimeField(
        null=True, 
        blank=True, 
        verbose_name="Date de retrait du quitus"
    )
    quitus_signed_at = models.DateTimeField(
        null=True, 
        blank=True, 
        verbose_name="Date de signature électronique"
    )
    quitus_physically_signed_at = models.DateTimeField(
        null=True, 
        blank=True, 
        verbose_name="Date de signature physique"
    )
    
    # ─── Métadonnées ─────────────────────────────────────────────────
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # ─── Flags ──────────────────────────────────────────────────────
    relance_sent = models.BooleanField(
        default=False, 
        verbose_name="Relance envoyée"
    )
    convocation_sent = models.BooleanField(
        default=False, 
        verbose_name="Convocation envoyée"
    )
    
    # ─── Champs pour le bibliothécaire ─────────────────────────────
    physical_deposit_confirmed = models.BooleanField(
        default=False, 
        verbose_name="Dépôt physique confirmé"
    )
    documents_conform = models.BooleanField(
        default=False, 
        verbose_name="Documents conformes"
    )
    librarian_notes = models.TextField(
        blank=True, 
        null=True, 
        verbose_name="Notes du bibliothécaire"
    )

    # ═══════════════════════════════════════════════════════════════════
    # ─── CHAMPS D'ARCHIVAGE ───────────────────────────────────────────
    # ═══════════════════════════════════════════════════════════════════
    archive_path = models.CharField(
        max_length=500,
        blank=True,
        null=True,
        verbose_name="Chemin du document archivé"
    )
    document_name = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name="Nom du document archivé"
    )
    sequence_number = models.PositiveIntegerField(
        null=True,
        blank=True,
        verbose_name="Numéro de séquence"
    )
    archived_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Date d'archivage"
    )
    is_archived = models.BooleanField(
        default=False,
        verbose_name="Document archivé"
    )

    class Meta:
        app_label = 'memoires'
        verbose_name = "Dépôt"
        verbose_name_plural = "Dépôts"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['matricule']),
            models.Index(fields=['status']),
            models.Index(fields=['author', 'status']),
            models.Index(fields=['is_archived']),
        ]

    # ─── Méthodes ───────────────────────────────────────────────────

    def __str__(self):
        return f"{self.title} - {self.author.get_full_name() or self.author.username} ({self.get_status_display()})"

    def get_jury_count(self):
        """Retourne le nombre de membres du jury selon le type de document"""
        if self.type_document == self.TypeDocument.MEMOIRE:
            return 2
        return 4

    def get_jury_members(self):
        """Retourne la liste des membres du jury"""
        members = []
        if self.president_jury:
            members.append({'role': 'Président', 'name': self.president_jury})
        if self.examinateur_1:
            members.append({'role': 'Examinateur 1', 'name': self.examinateur_1})
        if self.type_document == self.TypeDocument.THESE:
            if self.examinateur_2:
                members.append({'role': 'Examinateur 2', 'name': self.examinateur_2})
            if self.examinateur_3:
                members.append({'role': 'Examinateur 3', 'name': self.examinateur_3})
        return members

    def is_jury_complete(self):
        """Vérifie si le jury est complet selon le type de document"""
        if self.type_document == self.TypeDocument.MEMOIRE:
            return bool(self.president_jury and self.examinateur_1)
        return bool(
            self.president_jury and 
            self.examinateur_1 and 
            self.examinateur_2 and 
            self.examinateur_3
        )

    def is_upload_complete(self):
        """Vérifie si les fichiers sont complets"""
        return bool(self.pdf_file and self.word_file)

    def can_transition_to(self, new_status):
        """Vérifie si la transition vers un nouveau statut est autorisée"""
        if self.status == new_status:
            return True
        return new_status in self.STATUS_TRANSITIONS.get(self.status, [])

    def transition_to(self, new_status, user=None):
        """Effectue la transition vers un nouveau statut"""
        if not self.can_transition_to(new_status):
            raise ValidationError(f"Transition impossible de '{self.status}' vers '{new_status}'")
        
        old_status = self.status
        self.status = new_status
        
        if new_status == 'depot_en_ligne':
            self.submitted_at = timezone.now()
        elif new_status == 'convocation_envoyee':
            self.convocation_sent_at = timezone.now()
            self.convocation_sent = True
        elif new_status == 'relance_envoyee':
            self.relance_sent_at = timezone.now()
            self.relance_sent = True
        elif new_status == 'verification_ok':
            self.physical_verified_at = timezone.now()
        elif new_status == 'quitus_disponible':
            self.quitus_available_at = timezone.now()
        elif new_status == 'quitus_retire':
            self.quitus_retired_at = timezone.now()
        elif new_status == 'quitus_signe':
            self.quitus_signed_at = timezone.now()
            self.is_quitus_signed = True
        
        self.save()
        return True

    def get_status_display_with_icon(self):
        icons = {
            'brouillon': '📝',
            'depot_en_ligne': '📤',
            'convocation_envoyee': '📧',
            'relance_envoyee': '⏰',
            'en_attente_verification': '🔍',
            'verification_ok': '✅',
            'rejete': '❌',
            'en_attente_quitus': '⏳',
            'quitus_disponible': '📄',
            'quitus_retire': '📋',
            'abandonne': '🚫',
        }
        return f"{icons.get(self.status, '')} {self.get_status_display()}"

    # ═══════════════════════════════════════════════════════════════════
    # ─── MÉTHODES POUR OBTENIR LES URLS DES FICHIERS ──────────────────
    # ═══════════════════════════════════════════════════════════════════
    
    def get_pdf_url(self):
        """Retourne l'URL absolue du fichier PDF"""
        if self.pdf_file and hasattr(self.pdf_file, 'url'):
            return self.pdf_file.url
        return None

    def get_word_url(self):
        """Retourne l'URL absolue du fichier Word"""
        if self.word_file and hasattr(self.word_file, 'url'):
            return self.word_file.url
        return None

    def get_scanned_url(self):
        """Retourne l'URL absolue du document scanné"""
        if self.scanned_document and hasattr(self.scanned_document, 'url'):
            return self.scanned_document.url
        return None

    def get_quitus_url(self):
        """Retourne l'URL absolue du quitus"""
        if self.quitus_file and hasattr(self.quitus_file, 'url'):
            return self.quitus_file.url
        return None

    def get_all_file_urls(self):
        """Retourne tous les URLs des fichiers"""
        return {
            'pdf': self.get_pdf_url(),
            'word': self.get_word_url(),
            'scanned': self.get_scanned_url(),
            'quitus': self.get_quitus_url(),
        }

    def get_filename(self, file_field):
        """Retourne le nom du fichier à partir du champ FileField"""
        if file_field and hasattr(file_field, 'name'):
            return file_field.name.split('/')[-1]
        return None

    def get_pdf_filename(self):
        return self.get_filename(self.pdf_file)

    def get_word_filename(self):
        return self.get_filename(self.word_file)

    def get_scanned_filename(self):
        return self.get_filename(self.scanned_document)

    def get_quitus_filename(self):
        return self.get_filename(self.quitus_file)

    # ─── Fin des méthodes ──────────────────────────────────────────

    def clean(self):
        """Validation du modèle"""
        if self.status != 'brouillon':
            if not self.is_jury_complete():
                raise ValidationError({
                    'jury': "Le jury n'est pas complet pour ce type de document"
                })

    def save(self, *args, **kwargs):
        self.clean()
        
        if self.pk:
            try:
                old = Memoire.objects.get(pk=self.pk)
                if old.status != self.status:
                    if not self.can_transition_to(self.status):
                        raise ValidationError(f"Transition impossible de '{old.status}' vers '{self.status}'")
            except Memoire.DoesNotExist:
                pass
        
        super().save(*args, **kwargs)

    def get_absolute_url(self):
        from django.urls import reverse
        return reverse('memoire_detail', kwargs={'pk': self.id})


# ═══════════════════════════════════════════════════════════════════
# ─── DOCUMENT SEQUENCE ─────────────────────────────────────────────
# ═══════════════════════════════════════════════════════════════════

class DocumentSequence(models.Model):
    """
    Gère la séquence de numérotation pour les documents validés.
    """
    class Meta:
        app_label = 'memoires'
        verbose_name = "Séquence de documents"
        verbose_name_plural = "Séquences de documents"
    
    YEAR_CHOICES = [(y, str(y)) for y in range(2020, 2031)]
    
    year = models.IntegerField(
        choices=YEAR_CHOICES,
        default=timezone.now().year,
        verbose_name="Année"
    )
    document_type = models.CharField(
        max_length=10,
        choices=Memoire.TypeDocument.choices,
        verbose_name="Type de document"
    )
    faculty = models.CharField(
        max_length=50,
        verbose_name="Faculté"
    )
    counter = models.PositiveIntegerField(
        default=0,
        verbose_name="Compteur"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['year', 'document_type', 'faculty']
        ordering = ['-year', 'document_type', 'faculty']

    def __str__(self):
        return f"{self.year} - {self.document_type} - {self.faculty} - {self.counter}"

    @classmethod
    def get_next_number(cls, year, document_type, faculty):
        """
        Récupère le prochain numéro de séquence pour un type de document,
        une faculté et une année donnés.
        """
        sequence, created = cls.objects.get_or_create(
            year=year,
            document_type=document_type,
            faculty=faculty,
            defaults={'counter': 0}
        )
        sequence.counter += 1
        sequence.save()
        return sequence.counter