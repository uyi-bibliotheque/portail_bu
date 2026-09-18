import os
from django.http import FileResponse, Http404
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import DigitalDocument
from .serializers import DigitalDocumentSerializer


class DigitalDocumentListView(generics.ListAPIView):
    """Liste l'ensemble des documents numériques disponibles."""
    queryset = DigitalDocument.objects.all()
    serializer_class = DigitalDocumentSerializer
    permission_classes = [permissions.AllowAny]


class SecureDownloadView(APIView):
    """Gère le téléchargement sécurisé avec vérification des permissions."""
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get(self, request, pk, format=None):
        try:
            document = DigitalDocument.objects.get(pk=pk)
        except DigitalDocument.DoesNotExist:
            raise Http404("Document numérique introuvable.")

        # Vérification des restrictions d'accès pour les utilisateurs non connectés
        if document.is_restricted and not request.user.is_authenticated:
            return Response(
                {"detail": "Authentification requise pour télécharger ce document."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        if not document.file or not os.path.exists(document.file.path):
            return Response(
                {"detail": "Le fichier physique est introuvable sur le serveur."},
                status=status.HTTP_404_NOT_FOUND
            )

        # Mise à jour des statistiques de téléchargement
        document.download_count += 1
        document.save(update_fields=["download_count"])

        # Transmission sécurisée du fichier en pièce jointe
        response = FileResponse(open(document.file.path, 'rb'), as_attachment=True)
        return response