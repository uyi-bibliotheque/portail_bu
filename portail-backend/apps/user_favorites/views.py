from rest_framework import generics, permissions
from .models import UserFavorite
from .serializers import UserFavoriteSerializer


class UserFavoriteListCreateView(generics.ListCreateAPIView):
    """Permet de lister les favoris de l'utilisateur connecté ou d'en ajouter un nouveau."""
    serializer_class = UserFavoriteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserFavorite.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class UserFavoriteDetailView(generics.DestroyAPIView):
    """Permet de supprimer un favori existant de l'utilisateur."""
    serializer_class = UserFavoriteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserFavorite.objects.filter(user=self.request.user)