# apps/memoires/services.py
import logging
from datetime import timedelta
from django.utils import timezone
from apps.notifications.services import EmailService, get_email_context
from apps.memoires.models import Memoire

logger = logging.getLogger(__name__)


class MemoireEmailService:
    """Service d'envoi d'emails pour les dépôts de mémoires"""
    
    @staticmethod
    def send_depot_confirmation(memoire):
        """Envoie l'email de confirmation de dépôt"""
        try:
            type_doc = "Mémoire de Master" if memoire.type_document == Memoire.TypeDocument.MEMOIRE else "Thèse de Doctorat"
            
            context = get_email_context(memoire.author, {
                'type_document': type_doc,
                'titre': memoire.title,
                'matricule': memoire.matricule,
                'filiere': memoire.filiere,
                'dossier_id': memoire.id,
                'date_limite': (timezone.now() + timedelta(days=7)).strftime('%d/%m/%Y'),
                'link': f'/mon-compte/depots/{memoire.id}',
                'message': f"Votre dépôt de {type_doc} a bien été enregistré."
            })
            
            EmailService.send_async_email(
                user=memoire.author,
                subject=f"📝 Confirmation de dépôt - {memoire.id.hex[:8]}",
                template_name='emails/depot_confirmation.html',
                context=context,
                notification_title="📝 Dépôt de mémoire initié",
                notification_message=f"Votre dépôt de {type_doc} a bien été enregistré."
            )
            
            logger.info(f"✅ Email confirmation envoyé pour {memoire.id}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Erreur envoi email confirmation: {str(e)}")
            return False

    @staticmethod
    def send_convocation(memoire):
        """Envoie la convocation pour le dépôt physique"""
        try:
            type_doc = "Mémoire de Master" if memoire.type_document == Memoire.TypeDocument.MEMOIRE else "Thèse de Doctorat"
            
            context = get_email_context(memoire.author, {
                'type_document': type_doc,
                'titre': memoire.title,
                'dossier_id': memoire.id,
                'date_limite': (timezone.now() + timedelta(days=7)).strftime('%d/%m/%Y'),
                'link': f'/mon-compte/depots/{memoire.id}',
                'message': f"Vous devez vous présenter à la bibliothèque pour le dépôt physique de votre {type_doc}."
            })
            
            EmailService.send_async_email(
                user=memoire.author,
                subject=f"📋 Convocation - Dépôt physique - {memoire.id.hex[:8]}",
                template_name='emails/convocation.html',
                context=context,
                notification_title="📋 Convocation pour dépôt physique",
                notification_message=f"Veuillez vous présenter à la bibliothèque pour le dépôt physique."
            )
            
            logger.info(f"✅ Email convocation envoyé pour {memoire.id}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Erreur envoi email convocation: {str(e)}")
            return False

    @staticmethod
    def send_relance(memoire):
        """Envoie un email de relance pour le dépôt physique"""
        try:
            type_doc = "Mémoire de Master" if memoire.type_document == Memoire.TypeDocument.MEMOIRE else "Thèse de Doctorat"
            
            context = get_email_context(memoire.author, {
                'type_document': type_doc,
                'titre': memoire.title,
                'dossier_id': memoire.id,
                'date_limite': (timezone.now() + timedelta(days=7)).strftime('%d/%m/%Y'),
                'link': f'/mon-compte/depots/{memoire.id}',
                'message': f"RAPPEL : Vous devez déposer vos documents physiques pour votre {type_doc}."
            })
            
            EmailService.send_async_email(
                user=memoire.author,
                subject=f"⏰ RAPPEL - Dépôt physique - {memoire.id.hex[:8]}",
                template_name='emails/relance.html',
                context=context,
                notification_title="⏰ Rappel de dépôt physique",
                notification_message=f"Vous avez dépassé le délai pour le dépôt physique de votre {type_doc}."
            )
            
            logger.info(f"✅ Email relance envoyé pour {memoire.id}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Erreur envoi email relance: {str(e)}")
            return False

    @staticmethod
    def send_quitus_available(memoire):
        """Envoie l'email de disponibilité du quitus"""
        try:
            type_doc = "Mémoire de Master" if memoire.type_document == Memoire.TypeDocument.MEMOIRE else "Thèse de Doctorat"
            
            context = get_email_context(memoire.author, {
                'type_document': type_doc,
                'dossier_id': memoire.id,
                'link': f'/mon-compte/depots/{memoire.id}',
                'message': f"Votre quitus pour votre {type_doc} est maintenant disponible."
            })
            
            EmailService.send_async_email(
                user=memoire.author,
                subject=f"📄 Quitus disponible - {memoire.id.hex[:8]}",
                template_name='emails/quitus_disponible.html',
                context=context,
                notification_title="📄 Quitus disponible",
                notification_message=f"Votre quitus est disponible. Veuillez venir le retirer à la bibliothèque."
            )
            
            logger.info(f"✅ Email quitus disponible envoyé pour {memoire.id}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Erreur envoi email quitus disponible: {str(e)}")
            return False

    @staticmethod
    def send_rejection(memoire):
        """Envoie l'email de rejet du dépôt"""
        try:
            type_doc = "Mémoire de Master" if memoire.type_document == Memoire.TypeDocument.MEMOIRE else "Thèse de Doctorat"
            
            context = get_email_context(memoire.author, {
                'type_document': type_doc,
                'titre': memoire.title,
                'dossier_id': memoire.id,
                'motif': memoire.rejection_reason or 'Non conforme',
                'link': f'/mon-compte/depots/{memoire.id}',
                'message': f"Votre dépôt de {type_doc} a été rejeté."
            })
            
            EmailService.send_async_email(
                user=memoire.author,
                subject=f"❌ Dépôt rejeté - {memoire.id.hex[:8]}",
                template_name='emails/rejet.html',
                context=context,
                notification_title="❌ Dépôt rejeté",
                notification_message=f"Votre dépôt a été rejeté. Motif : {memoire.rejection_reason}"
            )
            
            logger.info(f"✅ Email rejet envoyé pour {memoire.id}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Erreur envoi email rejet: {str(e)}")
            return False