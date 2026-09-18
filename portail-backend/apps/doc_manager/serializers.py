from rest_framework import serializers
from .models import DigitalDocument


class DigitalDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = DigitalDocument
        fields = [
            "id", 
            "title", 
            "description", 
            "pmb_notice_id", 
            "is_restricted", 
            "download_count", 
            "created_at"
        ]