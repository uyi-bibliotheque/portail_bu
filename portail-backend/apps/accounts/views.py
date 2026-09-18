# apps/accounts/views.py - VERSION COMPLÈTE AVEC MISE À JOUR PROFIL

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions, generics
from rest_framework.permissions import IsAdminUser, IsAuthenticated, AllowAny
from apps.accounts.serializers import (
    LoginSerializer, PortalUserSerializer,
    PortalUserCreateSerializer, StaffUserCreateSerializer,
    StudentRegistrationSerializer,
    ProfileUpdateSerializer, PasswordChangeSerializer, PreferencesSerializer,
)
from apps.accounts.services import AuthenticationService
from apps.accounts.models import PortalUser
from apps.accounts.permissions import (
    IsAdminOrStaff,
    IsAdminUser,
    IsAdminOrBiblio,
    IsAideBiblio,
)
import logging

logger = logging.getLogger(__name__)


# ═══════════════════════════════════════════════════════════════════
# ─── AUTHENTIFICATION ─────────────────────────────────────────────
# ═══════════════════════════════════════════════════════════════════

class LoginView(APIView):
    """POST /api/auth/login/"""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        identifier = serializer.validated_data['username']
        password = serializer.validated_data['password']

        auth_service = AuthenticationService()
        result = auth_service.authenticate_user(identifier, password)

        if not result:
            return Response(
                {"detail": "Identifiants invalides. Veuillez vérifier votre email/matricule et mot de passe."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        user_data = PortalUserSerializer(result['user']).data

        return Response({
            'access': result['access'],
            'refresh': result['refresh'],
            'user': user_data
        }, status=status.HTTP_200_OK)


# ═══════════════════════════════════════════════════════════════════
# ─── PROFIL UTILISATEUR (GET / PATCH / PUT) ────────────────────────
# ═══════════════════════════════════════════════════════════════════

class UserProfileView(APIView):
    """
    GET  /api/auth/me/  → Récupérer le profil
    PATCH /api/auth/me/ → Mettre à jour partiellement son profil
    PUT  /api/auth/me/  → Mettre à jour complètement son profil
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = PortalUserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request):
        """Mise à jour partielle du profil (nom, prénom, email, préférences)."""
        serializer = ProfileUpdateSerializer(
            request.user, data=request.data, partial=True
        )
        if not serializer.is_valid():
            return Response(
                {'success': False, 'errors': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = serializer.save()
        logger.info(f"✏️ Profil mis à jour : {user.username}")

        return Response({
            'success': True,
            'message': 'Profil mis à jour avec succès.',
            'user': PortalUserSerializer(user).data
        }, status=status.HTTP_200_OK)

    def put(self, request):
        """Mise à jour complète du profil (identique à PATCH mais sans partial)."""
        serializer = ProfileUpdateSerializer(request.user, data=request.data)
        if not serializer.is_valid():
            return Response(
                {'success': False, 'errors': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = serializer.save()
        logger.info(f"✏️ Profil mis à jour (PUT) : {user.username}")

        return Response({
            'success': True,
            'message': 'Profil mis à jour avec succès.',
            'user': PortalUserSerializer(user).data
        }, status=status.HTTP_200_OK)


# ═══════════════════════════════════════════════════════════════════
# ─── CHANGEMENT DE MOT DE PASSE ────────────────────────────────────
# ═══════════════════════════════════════════════════════════════════

class PasswordChangeView(APIView):
    """
    POST /api/auth/change-password/
    Permet à l'utilisateur connecté de changer son mot de passe.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = PasswordChangeSerializer(
            data=request.data,
            context={'user': request.user}
        )
        if not serializer.is_valid():
            return Response(
                {'success': False, 'errors': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer.save()
        logger.info(f"🔑 Mot de passe changé : {request.user.username}")

        return Response({
            'success': True,
            'message': 'Mot de passe changé avec succès.'
        }, status=status.HTTP_200_OK)


# ═══════════════════════════════════════════════════════════════════
# ─── PRÉFÉRENCES UTILISATEUR ───────────────────────────────────────
# ═══════════════════════════════════════════════════════════════════

class PreferencesUpdateView(APIView):
    """
    PATCH /api/auth/preferences/
    Met à jour uniquement les préférences JSON de l'utilisateur.
    """
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request):
        serializer = PreferencesSerializer(
            request.user, data=request.data, partial=True
        )
        if not serializer.is_valid():
            return Response(
                {'success': False, 'errors': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = serializer.save()
        logger.info(f"⚙️ Préférences mises à jour : {user.username}")

        return Response({
            'success': True,
            'message': 'Préférences mises à jour.',
            'preferences': user.preferences
        }, status=status.HTTP_200_OK)


# ═══════════════════════════════════════════════════════════════════
# ─── ADMINISTRATION ────────────────────────────────────────────────
# ═══════════════════════════════════════════════════════════════════

class AdminUserListCreateView(generics.ListCreateAPIView):
    """GET /api/accounts/users/ - POST /api/accounts/users/"""
    permission_classes = [IsAdminUser]
    serializer_class = PortalUserSerializer

    def get_serializer_class(self):
        if self.request.method == 'POST':
            data = self.request.data
            if data.get('role') in [
                PortalUser.Role.ADMIN,
                PortalUser.Role.BIBLIO,
                PortalUser.Role.AIDE_BIBLIO,
            ]:
                return StaffUserCreateSerializer
            return PortalUserCreateSerializer
        return PortalUserSerializer

    def get_queryset(self):
        return PortalUser.objects.all().order_by('-created_at')


class AdminUserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET/PATCH/DELETE /api/accounts/users/<uuid>/"""
    permission_classes = [IsAdminUser]
    queryset = PortalUser.objects.all()
    lookup_field = 'id'

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            data = self.request.data
            if data.get('role') in [
                PortalUser.Role.ADMIN,
                PortalUser.Role.BIBLIO,
                PortalUser.Role.AIDE_BIBLIO,
            ]:
                return StaffUserCreateSerializer
            return PortalUserCreateSerializer
        return PortalUserSerializer


class StaffOnlyView(APIView):
    """Endpoint de test pour le personnel."""
    permission_classes = [IsAdminOrBiblio]

    def get(self, request):
        return Response({
            'message': 'Bienvenue personnel de la bibliothèque !',
            'user': PortalUserSerializer(request.user).data
        })


# ═══════════════════════════════════════════════════════════════════
# ─── AIDE-BIBLIOTHÉCAIRE ──────────────────────────────────────────
# ═══════════════════════════════════════════════════════════════════

class AideBiblioDashboardView(APIView):
    """GET /api/auth/aide-dashboard/"""
    permission_classes = [IsAideBiblio]

    def get(self, request):
        return Response({
            'success': True,
            'message': 'Bienvenue sur votre tableau de bord Aide-Bibliothécaire',
            'user': PortalUserSerializer(request.user).data,
            'dashboard': {
                'title': 'Tableau de bord - Aide-Bibliothécaire',
                'sections': [
                    {
                        'id': 'cataloguer',
                        'title': 'Cataloguer un ouvrage',
                        'description': 'Ajouter ou modifier des ouvrages dans le catalogue PMB',
                        'icon': '📚',
                        'action': 'open_pmb_catalog',
                        'url': '/pmb/catalog/new'
                    },
                    {
                        'id': 'rechercher',
                        'title': 'Rechercher un ouvrage',
                        'description': 'Rechercher des ouvrages dans le catalogue PMB',
                        'icon': '🔍',
                        'action': 'search_pmb_catalog',
                        'url': '/pmb/catalog/search'
                    },
                    {
                        'id': 'modifier',
                        'title': 'Modifier un ouvrage',
                        'description': "Modifier les informations d'un ouvrage existant",
                        'icon': '✏️',
                        'action': 'edit_pmb_catalog',
                        'url': '/pmb/catalog/edit'
                    }
                ],
                'pmb_url': 'https://pmb.bcu-uyi.cm'
            }
        }, status=status.HTTP_200_OK)


class AideBiblioCatalogRedirectView(APIView):
    """POST /api/auth/aide-catalog/"""
    permission_classes = [IsAideBiblio]

    def post(self, request):
        action = request.data.get('action', 'new')

        pmb_urls = {
            'new': 'https://pmb.bcu-uyi.cm/index.php?lvl=notice_add',
            'search': 'https://pmb.bcu-uyi.cm/index.php?lvl=search',
            'edit': 'https://pmb.bcu-uyi.cm/index.php?lvl=notice_edit',
        }

        pmb_url = pmb_urls.get(action, pmb_urls['new'])

        logger.info(f"Aide-Bibliothécaire {request.user.username} redirigé vers PMB: {action}")

        return Response({
            'success': True,
            'redirect_url': pmb_url,
            'action': action,
            'message': f'Redirection vers PMB pour {action}',
        }, status=status.HTTP_200_OK)


class AideBiblioStatsView(APIView):
    """GET /api/auth/aide-stats/"""
    permission_classes = [IsAideBiblio]

    def get(self, request):
        return Response({
            'success': True,
            'stats': {
                'total_ouvrages': 15234,
                'ouvrages_ajoutes_mois': 43,
                'ouvrages_modifies_mois': 87,
                'derniere_action': '2026-08-10 14:30:00'
            }
        }, status=status.HTTP_200_OK)


# ═══════════════════════════════════════════════════════════════════
# ─── INSCRIPTION ÉTUDIANT ──────────────────────────────────────────
# ═══════════════════════════════════════════════════════════════════

class StudentRegistrationView(APIView):
    """POST /api/auth/register/"""
    permission_classes = [AllowAny]

    def post(self, request):
        if request.user and request.user.is_authenticated:
            return Response({
                'success': False,
                'detail': 'Vous êtes déjà connecté.'
            }, status=status.HTTP_400_BAD_REQUEST)

        serializer = StudentRegistrationSerializer(data=request.data)

        if not serializer.is_valid():
            return Response({
                'success': False,
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = serializer.save()
            logger.info(f"Nouvel étudiant inscrit: {user.username} - {user.email}")

            return Response({
                'success': True,
                'message': 'Inscription réussie ! Vous pouvez maintenant vous connecter.',
                'user': PortalUserSerializer(user).data
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f"Erreur inscription: {str(e)}")
            return Response({
                'success': False,
                'detail': "Erreur lors de l'inscription. Veuillez réessayer."
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CheckAvailabilityView(APIView):
    """GET /api/auth/check-availability/?type=matricule&value=MAT001"""
    permission_classes = [AllowAny]

    def get(self, request):
        check_type = request.query_params.get('type')
        value = request.query_params.get('value')

        if not check_type or not value:
            return Response({
                'success': False,
                'detail': 'Paramètres manquants'
            }, status=status.HTTP_400_BAD_REQUEST)

        if check_type == 'matricule':
            exists = PortalUser.objects.filter(username=value).exists()
            return Response({
                'success': True,
                'available': not exists,
                'field': 'matricule',
                'value': value
            })

        elif check_type == 'email':
            exists = PortalUser.objects.filter(email=value).exists()
            return Response({
                'success': True,
                'available': not exists,
                'field': 'email',
                'value': value
            })

        return Response({
            'success': False,
            'detail': 'Type de vérification invalide'
        }, status=status.HTTP_400_BAD_REQUEST)