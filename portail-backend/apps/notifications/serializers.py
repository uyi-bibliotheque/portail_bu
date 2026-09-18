# apps/notifications/serializers.py
from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer pour les notifications."""
    
    time_ago = serializers.SerializerMethodField()
    is_unread = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = [
            'id', 'user', 'title', 'message', 'link', 
            'is_read', 'is_unread', 'created_at', 'time_ago'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'time_ago', 'is_unread']

    def get_time_ago(self, obj):
        """Retourne le temps écoulé depuis la création."""
        from django.utils import timezone
        from django.utils.timesince import timesince
        
        if obj.created_at:
            return timesince(obj.created_at, timezone.now())
        return ""

    def get_is_unread(self, obj):
        """Retourne True si la notification n'est pas lue."""
        return not obj.is_read