# apps/site_content/views.py - VERSION AVEC RECAPTCHA V3
from rest_framework import generics, permissions, status, parsers
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import models
from django.utils import timezone
from django.conf import settings
from .models import Article, ContactMessage
from .serializers import ArticleSerializer, ContactMessageSerializer
import logging
import os

# ═══════════════════════════════════════════════════════════════════
# ─── IMPORT DU SERVICE RECAPTCHA ──────────────────────────────────
# ═══════════════════════════════════════════════════════════════════
from apps.core.recaptcha import verify_recaptcha

logger = logging.getLogger(__name__)


# ═══════════════════════════════════════════════════════════════════
# ─── ARTICLES ─────────────────────────────────────────────────────
# ═══════════════════════════════════════════════════════════════════

class ArticleListCreateView(generics.ListCreateAPIView):
    """Liste et crée des articles."""
    serializer_class = ArticleSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]

    def get_queryset(self):
        queryset = Article.objects.all()
        
        if not self.request.user.is_authenticated or not self.request.user.is_staff:
            queryset = queryset.filter(is_published=True)
            queryset = queryset.filter(
                models.Q(publish_until__isnull=True) |
                models.Q(publish_until__gte=timezone.now())
            )
        
        return queryset.order_by('-created_at')

    def create(self, request, *args, **kwargs):
        """Override create pour logger les erreurs."""
        try:
            logger.info(f"📝 Création article - Data: {request.data}")
            logger.info(f"📝 Fichiers: {request.FILES}")
            
            # Nettoyer les données du formulaire
            if request.content_type and 'multipart/form-data' in request.content_type:
                mutable_data = request.data.copy()
                if mutable_data.get('image') == '':
                    mutable_data.pop('image', None)
                request._full_data = mutable_data
            
            return super().create(request, *args, **kwargs)
        except Exception as e:
            logger.error(f"❌ Erreur création article: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    def perform_create(self, serializer):
        try:
            if self.request.user.is_authenticated:
                serializer.save(author=self.request.user)
            else:
                serializer.save()
            logger.info(f"✅ Article créé avec succès: {serializer.instance.title}")
            logger.info(f"🖼️ Image: {serializer.instance.image}")
            logger.info(f"🖼️ Image URL: {serializer.instance.image_url}")
        except Exception as e:
            logger.error(f"❌ Erreur création article: {str(e)}")
            raise


class ArticleDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Récupère, met à jour ou supprime un article."""
    queryset = Article.objects.all()
    serializer_class = ArticleSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]

    def get_queryset(self):
        queryset = Article.objects.all()
        
        if not self.request.user.is_authenticated or not self.request.user.is_staff:
            queryset = queryset.filter(is_published=True)
            queryset = queryset.filter(
                models.Q(publish_until__isnull=True) |
                models.Q(publish_until__gte=timezone.now())
            )
        
        return queryset

    def retrieve(self, request, *args, **kwargs):
        """Override retrieve pour ajouter des logs."""
        response = super().retrieve(request, *args, **kwargs)
        logger.info(f"📄 Article récupéré: {response.data.get('title')}")
        logger.info(f"🖼️ Image display: {response.data.get('image_display')}")
        return response

    def update(self, request, *args, **kwargs):
        """Override update pour mieux gérer les images."""
        try:
            logger.info(f"📝 Mise à jour article - Data: {request.data}")
            logger.info(f"📝 Fichiers: {request.FILES}")
            
            if request.content_type and 'multipart/form-data' in request.content_type:
                mutable_data = request.data.copy()
                
                if mutable_data.get('image') == '':
                    mutable_data.pop('image', None)
                
                if mutable_data.get('image_url') == '':
                    mutable_data.pop('image_url', None)
                
                if 'remove_image' in mutable_data:
                    mutable_data.pop('image', None)
                    mutable_data.pop('image_url', None)
                
                request._full_data = mutable_data
            
            return super().update(request, *args, **kwargs)
        except Exception as e:
            logger.error(f"❌ Erreur mise à jour article: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    def perform_update(self, serializer):
        try:
            serializer.save()
            logger.info(f"✅ Article mis à jour avec succès: {serializer.instance.title}")
        except Exception as e:
            logger.error(f"❌ Erreur mise à jour article: {str(e)}")
            raise


class ArticleStatusUpdateView(APIView):
    """Met à jour le statut d'un article."""
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        try:
            if not request.user.is_staff:
                return Response(
                    {"error": "Vous n'êtes pas autorisé."},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            article = Article.objects.get(pk=pk)
            is_published = request.data.get('is_published')
            
            if is_published is not None:
                article.is_published = is_published
                article.save()
                return Response(
                    {"message": f"Article {'publié' if is_published else 'dépublié'} avec succès."},
                    status=status.HTTP_200_OK
                )
            
            return Response(
                {"error": "Le champ 'is_published' est requis."},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Article.DoesNotExist:
            return Response(
                {"error": "Article non trouvé."},
                status=status.HTTP_404_NOT_FOUND
            )


# ═══════════════════════════════════════════════════════════════════
# ─── CONTACT — AVEC RECAPTCHA V3 ──────────────────────────────────
# ═══════════════════════════════════════════════════════════════════

class ContactMessageCreateView(generics.CreateAPIView):
    """
    Permet d'envoyer un message via le formulaire de contact.
    Protégé par reCAPTCHA v3.
    """
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        """
        Override pour ajouter la vérification reCAPTCHA avant la création.
        """
        recaptcha_token = request.data.get('recaptcha_token', '')
        
        logger.info(f"📩 Nouveau message de contact reçu de {request.data.get('email', 'inconnu')}")
        
        # ═══════════════════════════════════════════════════════════
        # 1. VÉRIFICATION RECAPTCHA
        # ═══════════════════════════════════════════════════════════
        success, score, result = verify_recaptcha(
            recaptcha_token,
            action='contact_form',
            min_score=0.5,
        )
        
        if not success:
            logger.warning(
                f"🚫 reCAPTCHA a rejeté la soumission — "
                f"IP: {self.get_client_ip()}, score: {score}, "
                f"raison: {result.get('error-codes', 'score trop bas')}"
            )
            return Response(
                {
                    'detail': (
                        'Vérification de sécurité échouée. '
                        'Veuillez réessayer dans quelques instants.'
                    ),
                    'code': 'recaptcha_failed',
                    'score': score,
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        logger.info(f"✅ reCAPTCHA validé (score: {score})")
        
        # ═══════════════════════════════════════════════════════════
        # 2. CRÉATION DU MESSAGE (comportement par défaut)
        # ═══════════════════════════════════════════════════════════
        return super().create(request, *args, **kwargs)

    def get_client_ip(self):
        """Récupère l'IP du client (utile pour les logs)."""
        x_forwarded_for = self.request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = self.request.META.get('REMOTE_ADDR', 'unknown')
        return ip


class ContactMessageListView(generics.ListAPIView):
    """Liste tous les messages de contact (staff uniquement)."""
    serializer_class = ContactMessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return ContactMessage.objects.all().order_by('-created_at')
        return ContactMessage.objects.none()


class ContactMessageDetailView(generics.RetrieveUpdateAPIView):
    """Récupère et met à jour un message de contact."""
    serializer_class = ContactMessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return ContactMessage.objects.all()
        return ContactMessage.objects.none()


class ContactMessageMarkReadView(APIView):
    """Marque un message comme lu."""
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        try:
            if not request.user.is_staff:
                return Response(
                    {"error": "Vous n'êtes pas autorisé."},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            message = ContactMessage.objects.get(pk=pk)
            message.is_read = True
            message.save()
            return Response(
                {"message": "Message marqué comme lu."},
                status=status.HTTP_200_OK
            )
        except ContactMessage.DoesNotExist:
            return Response(
                {"error": "Message non trouvé."},
                status=status.HTTP_404_NOT_FOUND
            )