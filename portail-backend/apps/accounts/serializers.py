# apps/accounts/serializers.py - VERSION COMPLÈTE AVEC MISE À JOUR PROFIL

from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from apps.accounts.models import PortalUser


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True, help_text="Email ou matricule")
    password = serializers.CharField(required=True, write_only=True)


class PortalUserSerializer(serializers.ModelSerializer):
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    auth_source_display = serializers.CharField(source='get_auth_source_display', read_only=True)
    is_staff_member = serializers.BooleanField(read_only=True)
    is_aide_biblio = serializers.BooleanField(read_only=True)
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = PortalUser
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'full_name',
            'role',
            'role_display',
            'auth_source',
            'auth_source_display',
            'is_staff_member',
            'is_aide_biblio',
            'pmb_lecteur_id',
            'preferences',
            'last_pmb_sync',
            'created_at',
            'is_active',
            'is_staff',
            'is_superuser',
        ]
        read_only_fields = [
            'id', 'username', 'role', 'auth_source', 'pmb_lecteur_id',
            'last_pmb_sync', 'created_at', 'is_active', 'is_staff', 'is_superuser',
        ]

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username


# ═══════════════════════════════════════════════════════════════════
# ─── SERIALIZER DE MISE À JOUR DU PROFIL (SELF-SERVICE) ────────────
# ═══════════════════════════════════════════════════════════════════

class ProfileUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer pour permettre à un utilisateur de mettre à jour
    ses propres informations (nom, prénom, email, préférences).
    
    ⚠️ Le username, le rôle et l'auth_source ne sont PAS modifiables par l'utilisateur.
    """
    class Meta:
        model = PortalUser
        fields = [
            'first_name',
            'last_name',
            'email',
            'preferences',
        ]
        extra_kwargs = {
            'email': {'required': False, 'allow_blank': False},
            'first_name': {'required': False, 'allow_blank': True},
            'last_name': {'required': False, 'allow_blank': True},
            'preferences': {'required': False},
        }

    def validate_email(self, value):
        """Vérifie que le nouvel email n'est pas déjà utilisé par un autre utilisateur."""
        if not value:
            return value
        
        user = self.instance
        # Exclure l'utilisateur actuel de la vérification d'unicité
        qs = PortalUser.objects.filter(email__iexact=value)
        if user:
            qs = qs.exclude(pk=user.pk)
        
        if qs.exists():
            raise serializers.ValidationError(
                "Cet email est déjà utilisé par un autre compte."
            )
        return value.lower().strip() if value else value

    def validate_first_name(self, value):
        if value:
            return value.strip()
        return value

    def validate_last_name(self, value):
        if value:
            return value.strip()
        return value

    def validate_preferences(self, value):
        """Vérifie que les préférences sont bien un dictionnaire JSON."""
        if value is None:
            return {}
        if not isinstance(value, dict):
            raise serializers.ValidationError(
                "Les préférences doivent être un objet JSON (dictionnaire)."
            )
        return value

    def update(self, instance, validated_data):
        """Applique les modifications partielles."""
        for field, value in validated_data.items():
            setattr(instance, field, value)
        instance.save()
        return instance


# ═══════════════════════════════════════════════════════════════════
# ─── SERIALIZER DE CHANGEMENT DE MOT DE PASSE ──────────────────────
# ═══════════════════════════════════════════════════════════════════

class PasswordChangeSerializer(serializers.Serializer):
    """
    Serializer pour permettre à un utilisateur de changer son mot de passe.
    Vérifie l'ancien mot de passe avant d'appliquer le nouveau.
    """
    old_password = serializers.CharField(
        required=True, write_only=True,
        help_text="Mot de passe actuel"
    )
    new_password = serializers.CharField(
        required=True, write_only=True,
        min_length=6,
        help_text="Nouveau mot de passe (min. 6 caractères)"
    )
    confirm_password = serializers.CharField(
        required=True, write_only=True,
        help_text="Confirmation du nouveau mot de passe"
    )

    def validate_old_password(self, value):
        """Vérifie que l'ancien mot de passe est correct."""
        user = self.context.get('user')
        if not user:
            raise serializers.ValidationError("Utilisateur non identifié.")
        
        if not user.check_password(value):
            raise serializers.ValidationError(
                "L'ancien mot de passe est incorrect."
            )
        return value

    def validate(self, data):
        """Vérifie la cohérence des nouveaux mots de passe."""
        if data.get('new_password') != data.get('confirm_password'):
            raise serializers.ValidationError({
                'confirm_password': 'Les nouveaux mots de passe ne correspondent pas.'
            })
        
        if data.get('old_password') == data.get('new_password'):
            raise serializers.ValidationError({
                'new_password': 'Le nouveau mot de passe doit être différent de l\'ancien.'
            })
        
        # Validation Django native du mot de passe
        user = self.context.get('user')
        try:
            validate_password(data.get('new_password'), user=user)
        except DjangoValidationError as e:
            raise serializers.ValidationError({
                'new_password': list(e.messages)
            })
        
        return data

    def save(self, **kwargs):
        """Applique le nouveau mot de passe."""
        user = self.context.get('user')
        if not user:
            raise serializers.ValidationError("Utilisateur non identifié.")
        
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user


# ═══════════════════════════════════════════════════════════════════
# ─── SERIALIZER DE PRÉFÉRENCES ─────────────────────────────────────
# ═══════════════════════════════════════════════════════════════════

class PreferencesSerializer(serializers.Serializer):
    """Serializer pour ne mettre à jour que les préférences JSON."""
    preferences = serializers.JSONField(required=True)

    def validate_preferences(self, value):
        if not isinstance(value, dict):
            raise serializers.ValidationError(
                "Les préférences doivent être un objet JSON (dictionnaire)."
            )
        return value

    def update(self, instance, validated_data):
        instance.preferences = validated_data['preferences']
        instance.save()
        return instance


# ═══════════════════════════════════════════════════════════════════
# ─── SERIALIZERS ADMIN (création / modification par admin) ─────────
# ═══════════════════════════════════════════════════════════════════

class PortalUserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = PortalUser
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'role', 'auth_source', 'password', 'is_active'
        ]

    def create(self, validated_data):
        password = validated_data.pop('password')
        validated_data.setdefault('auth_source', PortalUser.AuthSource.PMB)
        validated_data.setdefault('role', PortalUser.Role.ETUDIANT)

        if validated_data.get('role') in [
            PortalUser.Role.AIDE_BIBLIO,
            PortalUser.Role.BIBLIO,
            PortalUser.Role.ADMIN,
        ]:
            validated_data['is_staff'] = True

        user = PortalUser.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for k, v in validated_data.items():
            setattr(instance, k, v)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


class StaffUserCreateSerializer(serializers.ModelSerializer):
    """Serializer pour la création de personnel (BIBLIO, AIDE_BIBLIO, ADMIN)."""
    password = serializers.CharField(write_only=True, required=True)
    confirm_password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = PortalUser
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'role', 'password', 'confirm_password', 'is_active'
        ]

    def validate(self, data):
        if data.get('password') != data.get('confirm_password'):
            raise serializers.ValidationError({
                'confirm_password': 'Les mots de passe ne correspondent pas.'
            })

        allowed_roles = [
            PortalUser.Role.ADMIN,
            PortalUser.Role.BIBLIO,
            PortalUser.Role.AIDE_BIBLIO,
        ]
        if data.get('role') not in allowed_roles:
            raise serializers.ValidationError({
                'role': 'Seuls les rôles ADMIN, BIBLIO et AIDE_BIBLIO peuvent être créés ici.'
            })

        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        password = validated_data.pop('password')

        validated_data['auth_source'] = PortalUser.AuthSource.LOCAL
        validated_data['is_staff'] = True

        user = PortalUser.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        return user


class StudentRegistrationSerializer(serializers.ModelSerializer):
    """Serializer pour l'inscription des étudiants sans compte PMB."""
    matricule = serializers.CharField(required=True, write_only=True)
    confirm_password = serializers.CharField(write_only=True, required=True)
    faculte = serializers.CharField(required=True, write_only=True)
    departement = serializers.CharField(required=True, write_only=True)
    niveau = serializers.CharField(required=True, write_only=True)

    class Meta:
        model = PortalUser
        fields = [
            'id', 'username', 'matricule', 'email', 'first_name', 'last_name',
            'faculte', 'departement', 'niveau',
            'password', 'confirm_password', 'role', 'auth_source'
        ]
        extra_kwargs = {
            'password': {'write_only': True, 'required': True},
            'username': {'read_only': True},
            'role': {'read_only': True},
            'auth_source': {'read_only': True},
            'is_staff': {'read_only': True},
            'is_superuser': {'read_only': True},
        }

    def validate_matricule(self, value):
        if PortalUser.objects.filter(username=value).exists():
            raise serializers.ValidationError("Ce matricule est déjà utilisé.")
        return value

    def validate_email(self, value):
        if PortalUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("Cet email est déjà utilisé.")
        return value

    def validate(self, data):
        if data.get('password') != data.get('confirm_password'):
            raise serializers.ValidationError({
                'confirm_password': 'Les mots de passe ne correspondent pas.'
            })

        if len(data.get('password', '')) < 6:
            raise serializers.ValidationError({
                'password': 'Le mot de passe doit contenir au moins 6 caractères.'
            })

        return data

    def create(self, validated_data):
        matricule = validated_data.pop('matricule')
        password = validated_data.pop('password')
        validated_data.pop('confirm_password')

        faculte = validated_data.pop('faculte')
        departement = validated_data.pop('departement')
        niveau = validated_data.pop('niveau')

        validated_data['username'] = matricule
        validated_data['role'] = PortalUser.Role.ETUDIANT
        validated_data['auth_source'] = PortalUser.AuthSource.LOCAL
        validated_data['is_staff'] = False
        validated_data['is_superuser'] = False

        validated_data['preferences'] = {
            'faculte': faculte,
            'departement': departement,
            'niveau': niveau,
        }

        user = PortalUser.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        return user