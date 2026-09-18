# apps/memoires/serializers.py - VERSION COMPLÈTE AVEC archive_path

from rest_framework import serializers
from .models import Memoire
from django.utils import timezone


class MemoireSerializer(serializers.ModelSerializer):
    author_name = serializers.ReadOnlyField(source='author.username')
    author_full_name = serializers.ReadOnlyField(source='author.get_full_name')
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    status_icon = serializers.SerializerMethodField()
    jury_complete = serializers.BooleanField(read_only=True)
    upload_complete = serializers.BooleanField(read_only=True)
    can_transition = serializers.SerializerMethodField()
    jury_members = serializers.SerializerMethodField()
    type_display = serializers.CharField(source='get_type_document_display', read_only=True)
    
    # ─── URLs DES FICHIERS ───────────────────────────────────────────
    pdf_url = serializers.SerializerMethodField()
    word_url = serializers.SerializerMethodField()
    scanned_url = serializers.SerializerMethodField()
    quitus_url = serializers.SerializerMethodField()
    
    pdf_filename = serializers.SerializerMethodField()
    word_filename = serializers.SerializerMethodField()
    scanned_filename = serializers.SerializerMethodField()
    quitus_filename = serializers.SerializerMethodField()
    
    # ─── CHAMPS D'ARCHIVAGE ──────────────────────────────────────────
    is_archived = serializers.BooleanField(read_only=True)
    archive_info = serializers.SerializerMethodField()
    archive_path = serializers.SerializerMethodField()

    class Meta:
        model = Memoire
        fields = [
            'id', 'type_document', 'type_display',
            'author', 'author_name', 'author_full_name',
            'matricule', 'full_name', 'filiere',
            'unite_recherche', 'laboratoire',
            'title', 'abstract', 'keywords',
            'president_jury', 'examinateur_1', 'examinateur_2', 'examinateur_3',
            'pdf_file', 'word_file', 'scanned_document',
            'quitus_file', 'is_quitus_signed', 'is_quitus_physically_signed',
            'status', 'status_display', 'status_icon',
            'rejection_reason',
            'submitted_at', 'convocation_sent_at', 'relance_sent_at',
            'physical_verified_at', 'quitus_available_at', 'quitus_retired_at',
            'quitus_signed_at', 'quitus_physically_signed_at',
            'created_at', 'updated_at',
            'relance_sent', 'convocation_sent',
            'physical_deposit_confirmed', 'documents_conform', 'librarian_notes',
            'jury_complete', 'upload_complete', 'can_transition',
            'jury_members',
            # URLs des fichiers
            'pdf_url', 'word_url', 'scanned_url', 'quitus_url',
            'pdf_filename', 'word_filename', 'scanned_filename', 'quitus_filename',
            # Champs d'archivage
            'is_archived', 'archive_info', 'archive_path',
        ]
        read_only_fields = [
            'id', 'author', 'author_name', 'author_full_name',
            'submitted_at', 'convocation_sent_at', 'relance_sent_at',
            'physical_verified_at', 'quitus_available_at', 'quitus_retired_at',
            'quitus_signed_at', 'quitus_physically_signed_at',
            'created_at', 'updated_at',
            'relance_sent', 'convocation_sent',
            'status', 'status_display', 'status_icon',
            'jury_complete', 'upload_complete', 'can_transition',
            'jury_members', 'type_display',
            'is_quitus_signed', 'is_quitus_physically_signed',
            # URLs en lecture seule
            'pdf_url', 'word_url', 'scanned_url', 'quitus_url',
            'pdf_filename', 'word_filename', 'scanned_filename', 'quitus_filename',
            # Champs d'archivage en lecture seule
            'is_archived', 'archive_info', 'archive_path',
        ]
        extra_kwargs = {
            'pdf_file': {'required': False},
            'word_file': {'required': False},
            'scanned_document': {'required': False},
            'quitus_file': {'required': False},
            'rejection_reason': {'required': False, 'allow_null': True, 'allow_blank': True},
            'physical_deposit_confirmed': {'required': False},
            'documents_conform': {'required': False},
            'librarian_notes': {'required': False},
        }

    # ─── MÉTHODES POUR LES URLS ──────────────────────────────────────
    
    def get_pdf_url(self, obj):
        return obj.get_pdf_url()

    def get_word_url(self, obj):
        return obj.get_word_url()

    def get_scanned_url(self, obj):
        return obj.get_scanned_url()

    def get_quitus_url(self, obj):
        return obj.get_quitus_url()

    def get_pdf_filename(self, obj):
        return obj.get_pdf_filename()

    def get_word_filename(self, obj):
        return obj.get_word_filename()

    def get_scanned_filename(self, obj):
        return obj.get_scanned_filename()

    def get_quitus_filename(self, obj):
        return obj.get_quitus_filename()

    # ─── MÉTHODES POUR L'ARCHIVAGE ──────────────────────────────────
    
    def get_archive_info(self, obj):
        """
        Retourne les informations d'archivage du document.
        """
        if not obj.is_archived:
            return None
        
        from .document_service import DocumentArchiveService
        return DocumentArchiveService.get_archive_info(obj)

    def get_archive_path(self, obj):
        """
        Retourne le chemin d'archivage direct du document.
        Utile pour le téléchargement depuis le frontend.
        """
        if not obj.is_archived or not obj.archive_path:
            return None
        return obj.archive_path

    # ─── FIN DES MÉTHODES ──────────────────────────────────────────

    def get_status_icon(self, obj):
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
        return icons.get(obj.status, '')

    def get_can_transition(self, obj):
        return obj.STATUS_TRANSITIONS.get(obj.status, [])

    def get_jury_members(self, obj):
        return obj.get_jury_members()

    def validate(self, data):
        type_doc = data.get('type_document', self.instance.type_document if self.instance else None)
        
        required_fields = ['title', 'abstract', 'matricule', 'full_name', 'filiere']
        for field in required_fields:
            if not data.get(field) and not getattr(self.instance, field, None):
                raise serializers.ValidationError({field: f"Le champ '{field}' est requis."})

        if not data.get('president_jury') and not getattr(self.instance, 'president_jury', None):
            raise serializers.ValidationError({'president_jury': 'Le président du jury est requis.'})
        
        if not data.get('examinateur_1') and not getattr(self.instance, 'examinateur_1', None):
            raise serializers.ValidationError({'examinateur_1': "L'examinateur 1 est requis."})

        if type_doc == Memoire.TypeDocument.THESE:
            if not data.get('examinateur_2') and not getattr(self.instance, 'examinateur_2', None):
                raise serializers.ValidationError({'examinateur_2': "L'examinateur 2 est requis pour une thèse."})
            if not data.get('examinateur_3') and not getattr(self.instance, 'examinateur_3', None):
                raise serializers.ValidationError({'examinateur_3': "L'examinateur 3 est requis pour une thèse."})

        return data

    def create(self, validated_data):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['author'] = request.user
        else:
            raise serializers.ValidationError("L'utilisateur n'est pas authentifié")
        
        user = request.user
        validated_data.setdefault('full_name', user.get_full_name() or user.username)
        validated_data.setdefault('matricule', user.username)
        
        return super().create(validated_data)


class MemoireStatusUpdateSerializer(serializers.Serializer):
    """Serializer pour la mise à jour du statut d'un mémoire"""
    status = serializers.ChoiceField(choices=Memoire.STATUS_CHOICES)
    rejection_reason = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    librarian_notes = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    documents_conform = serializers.BooleanField(required=False)

    def validate(self, data):
        status = data.get('status')
        rejection_reason = data.get('rejection_reason', '')
        
        if status == 'rejete':
            cleaned_reason = rejection_reason.strip() if rejection_reason else ''
            if not cleaned_reason:
                raise serializers.ValidationError({
                    'rejection_reason': 'Un motif de rejet est requis pour le rejet du dépôt.'
                })
            data['rejection_reason'] = cleaned_reason
        else:
            data['rejection_reason'] = None
        
        return data


class MemoireSearchSerializer(serializers.Serializer):
    matricule = serializers.CharField(required=True, max_length=50)


class MemoireVerifySerializer(serializers.Serializer):
    documents_conform = serializers.BooleanField(required=True)
    librarian_notes = serializers.CharField(required=False, allow_blank=True, allow_null=True)


class MemoireDepotSerializer(serializers.ModelSerializer):
    """
    Serializer pour le formulaire de dépôt (étudiant).
    """
    author = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Memoire
        fields = [
            'author',
            'type_document',
            'matricule', 'full_name', 'filiere',
            'unite_recherche', 'laboratoire',
            'title', 'abstract', 'keywords',
            'president_jury', 'examinateur_1', 'examinateur_2', 'examinateur_3',
            'pdf_file', 'word_file',
        ]
        extra_kwargs = {
            'pdf_file': {'required': True},
            'word_file': {'required': True},
            'matricule': {'read_only': True},
            'full_name': {'read_only': True},
            'filiere': {'read_only': True},
            'unite_recherche': {'required': False, 'allow_blank': True},
            'laboratoire': {'required': False, 'allow_blank': True},
            'keywords': {'required': False, 'allow_blank': True},
            'examinateur_2': {'required': False, 'allow_blank': True},
            'examinateur_3': {'required': False, 'allow_blank': True},
        }

    def create(self, validated_data):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['author'] = request.user
        else:
            raise serializers.ValidationError("L'utilisateur n'est pas authentifié")
        
        user = request.user
        if not validated_data.get('full_name'):
            validated_data['full_name'] = user.get_full_name() or user.username
        if not validated_data.get('matricule'):
            validated_data['matricule'] = user.username
        if not validated_data.get('filiere'):
            validated_data['filiere'] = 'Non spécifié'
        
        return super().create(validated_data)

    def validate(self, data):
        type_doc = data.get('type_document')
        
        if not data.get('title'):
            raise serializers.ValidationError({'title': 'Le titre est requis.'})
        if not data.get('abstract'):
            raise serializers.ValidationError({'abstract': 'Le résumé est requis.'})
        if not data.get('president_jury'):
            raise serializers.ValidationError({'president_jury': 'Le président du jury est requis.'})
        if not data.get('examinateur_1'):
            raise serializers.ValidationError({'examinateur_1': "L'examinateur 1 est requis."})
        
        if type_doc == 'THESE':
            if not data.get('examinateur_2'):
                raise serializers.ValidationError({'examinateur_2': "L'examinateur 2 est requis pour une thèse."})
            if not data.get('examinateur_3'):
                raise serializers.ValidationError({'examinateur_3': "L'examinateur 3 est requis pour une thèse."})
        
        return data