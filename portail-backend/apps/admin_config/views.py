from rest_framework import generics, permissions
from .models import SiteConfiguration
from .serializers import SiteConfigurationSerializer


class SiteConfigurationListView(generics.ListAPIView):
    """Permet à tout le monde de consulter les paramètres publics du portail."""
    queryset = SiteConfiguration.objects.all()
    serializer_class = SiteConfigurationSerializer
    permission_classes = [permissions.AllowAny]


class SiteConfigurationUpdateView(generics.UpdateAPIView):
    """Permet aux administrateurs de modifier un paramètre de configuration."""
    queryset = SiteConfiguration.objects.all()
    serializer_class = SiteConfigurationSerializer
    permission_classes = [permissions.IsAdminUser]