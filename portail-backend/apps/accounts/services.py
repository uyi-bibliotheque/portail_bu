# apps/accounts/services.py - VERSION CORRIGÉE

from django.contrib.auth import authenticate
from django.db.models import Q
from rest_framework_simplejwt.tokens import RefreshToken
from apps.accounts.models import PortalUser
from pmb_gateway.services.auth_service import PMBAuthService
import logging

logger = logging.getLogger(__name__)


class AuthenticationService:
    def __init__(self):
        self.pmb_auth_service = PMBAuthService()

    def get_user_by_identifier(self, identifier: str):
        """
        Récupère un utilisateur par son email ou son matricule (username).
        """
        try:
            user = PortalUser.objects.filter(
                Q(email__iexact=identifier) | Q(username__iexact=identifier)
            ).first()
            return user
        except PortalUser.DoesNotExist:
            return None
        except Exception as e:
            logger.error(f"❌ Erreur get_user_by_identifier pour {identifier}: {str(e)}")
            return None

    def authenticate_user(self, username_or_email: str, password: str) -> dict:
        """
        Authentifie un utilisateur via :
        1. Stratégie locale (Django)
        2. Stratégie PMB (webservice)
        """
        logger.info(f"🔐 Tentative d'authentification pour: {username_or_email}")
        
        # 1. STRATÉGIE LOCALE - Vérifier par email ou username
        user = self.get_user_by_identifier(username_or_email)
        
        if user and user.is_active:
            # Vérifier le mot de passe local
            if user.check_password(password):
                logger.info(f"✅ Connexion LOCALE réussie pour: {username_or_email} (Rôle: {user.role})")
                return self._generate_jwt_response(user)
        
        # 2. STRATÉGIE PMB - Utiliser le username (matricule)
        username = username_or_email
        if '@' in username_or_email:
            user_by_email = self.get_user_by_identifier(username_or_email)
            if user_by_email:
                username = user_by_email.username
        
        logger.info(f"🔐 Tentative d'authentification PMB pour: {username}")
        
        try:
            # Vérifier les identifiants PMB
            session_id = self.pmb_auth_service.verifier_identifiants_pmb(username, password)
            
            if session_id:
                logger.info(f"✅ Authentification PMB réussie pour: {username} (Session: {session_id[:10]}...)")
                
                # Récupérer le profil du lecteur
                pmb_profile = self.pmb_auth_service.recuperer_profil_lecteur(session_id) or {}
                
                # Extraire les informations
                pmb_id = str(pmb_profile.get('id_empr', pmb_profile.get('empr_id', '')))
                email = pmb_profile.get('empr_mail', pmb_profile.get('email', ''))
                nom = pmb_profile.get('empr_nom', pmb_profile.get('nom', ''))
                prenom = pmb_profile.get('empr_prenom', pmb_profile.get('prenom', ''))
                
                logger.info(f"📋 Profil PMB: {prenom} {nom} - {email} (ID: {pmb_id})")

                # Vérifier si l'utilisateur existe déjà
                existing_user = self.get_user_by_identifier(username)
                
                if existing_user:
                    user = existing_user
                    # Mettre à jour les données PMB si nécessaire
                    if pmb_profile:
                        user.sync_with_pmb_data({
                            'email': email,
                            'nom': nom,
                            'prenom': prenom,
                        })
                    logger.info(f"🔄 Mise à jour de l'utilisateur PMB existant: {username}")
                else:
                    # Créer un nouvel utilisateur
                    # S'assurer que l'email est unique
                    if not email:
                        email = f"{username}@pmb.lecteur"
                    
                    # Vérifier si l'email existe déjà
                    if PortalUser.objects.filter(email=email).exists():
                        email = f"{username}_{pmb_id}@pmb.lecteur" if pmb_id else f"{username}_pmb@pmb.lecteur"
                    
                    user = PortalUser.objects.create(
                        username=username,
                        auth_source=PortalUser.AuthSource.PMB,
                        role=PortalUser.Role.ETUDIANT,
                        pmb_lecteur_id=pmb_id if pmb_id else None,
                        email=email,
                        first_name=prenom or username,
                        last_name=nom or "Utilisateur PMB",
                    )
                    # Définir un mot de passe local pour la future connexion locale
                    user.set_password(password)
                    user.save()
                    logger.info(f"👤 Nouvel utilisateur PMB créé: {username} (ID: {user.id})")
                
                return self._generate_jwt_response(user)
            else:
                logger.warning(f"⚠️ Échec d'authentification PMB pour: {username}")

        except Exception as e:
            logger.error(f"❌ Erreur lors de l'authentification PMB de {username}: {str(e)}")
            import traceback
            traceback.print_exc()

        return None

    def _generate_jwt_response(self, user: PortalUser) -> dict:
        """
        Génère les tokens JWT pour un utilisateur.
        """
        refresh = RefreshToken.for_user(user)
        refresh['role'] = user.role
        refresh['auth_source'] = user.auth_source
        refresh['is_staff_member'] = user.is_staff_member

        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': user
        }