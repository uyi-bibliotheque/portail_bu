from rest_framework import serializers
from .models import SiteConfiguration


class SiteConfigurationSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteConfiguration
        fields = ["id", "key", "value", "description", "updated_at"]