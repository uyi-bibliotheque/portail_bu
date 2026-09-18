from rest_framework import serializers
from .models import Reservation


class ReservationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reservation
        fields = ["id", "user", "pmb_notice_id", "status", "created_at"]
        read_only_fields = ["user", "status", "created_at"]