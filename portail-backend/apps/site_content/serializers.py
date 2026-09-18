# apps/site_content/serializers.py
from rest_framework import serializers
from django.utils import timezone
from .models import Article, ContactMessage


class ArticleSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()
    is_expired = serializers.SerializerMethodField()
    status_display = serializers.SerializerMethodField()
    image_display = serializers.SerializerMethodField()
    image_url_display = serializers.SerializerMethodField()
    image_filename = serializers.SerializerMethodField()

    class Meta:
        model = Article
        fields = [
            "id", "title", "content", 
            "image", "image_url", "image_display", "image_url_display", "image_filename",
            "category",
            "is_event", "event_date",
            "is_published", "publish_until",
            "author", "author_name",
            "created_at", "updated_at",
            "is_expired", "status_display"
        ]
        read_only_fields = ["id", "author", "created_at", "updated_at"]
        extra_kwargs = {
            'image': {
                'required': False, 
                'allow_null': True,
            },
            'image_url': {
                'required': False, 
                'allow_null': True, 
                'allow_blank': True
            },
        }

    def get_author_name(self, obj):
        if obj.author:
            return obj.author.username
        return None

    def get_is_expired(self, obj):
        return obj.is_expired()

    def get_status_display(self, obj):
        if obj.is_expired():
            return "Expiré"
        if obj.is_published:
            return "Publié"
        return "Brouillon"

    def get_image_display(self, obj):
        """Retourne l'URL complète de l'image"""
        return obj.get_image_display()

    def get_image_url_display(self, obj):
        """Retourne l'URL externe si disponible"""
        return obj.image_url

    def get_image_filename(self, obj):
        """Retourne le nom du fichier image"""
        return obj.get_image_filename()

    def validate_image(self, value):
        """Validation personnalisée pour le champ image."""
        if value == '' or value is None:
            return None
        return value

    def validate(self, data):
        """Validation personnalisée."""
        if data.get('image_url') and data.get('image_url') != '':
            if not data['image_url'].startswith(('http://', 'https://')):
                raise serializers.ValidationError({
                    'image_url': 'L\'URL doit commencer par http:// ou https://'
                })
        
        if data.get('image') == '':
            data.pop('image', None)
        
        return data

    def to_internal_value(self, data):
        """Override pour mieux gérer les données entrantes."""
        if hasattr(data, 'get') and data.get('image') == '':
            data = data.copy() if hasattr(data, 'copy') else data
            if 'image' in data:
                del data['image']
        
        return super().to_internal_value(data)

    def to_representation(self, instance):
        """Override pour s'assurer que l'URL de l'image est correcte."""
        data = super().to_representation(instance)
        
        # S'assurer que l'URL de l'image est complète
        if data.get('image_display') and not data['image_display'].startswith(('http://', 'https://')):
            if not data['image_display'].startswith('/media/'):
                data['image_display'] = f"/media/{data['image_display'].lstrip('/')}"
        
        return data


class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ["id", "name", "email", "subject", "message", "is_read", "created_at"]
        read_only_fields = ["id", "is_read", "created_at"]