from rest_framework import serializers
from .models import UserFavorite


class UserFavoriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserFavorite
        fields = ["id", "user", "pmb_notice_id", "note", "created_at"]
        read_only_fields = ["user", "created_at"]

    def validate(self, attrs):
        request = self.context.get('request')
        if request and request.user:
            user = request.user
            pmb_notice_id = attrs.get('pmb_notice_id')
            if UserFavorite.objects.filter(user=user, pmb_notice_id=pmb_notice_id).exists():
                raise serializers.ValidationError({"pmb_notice_id": "Ce document est déjà dans vos favoris."})
        return attrs