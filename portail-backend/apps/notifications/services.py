# apps/notifications/services.py
import logging
import threading
from django.core.mail import send_mail, EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
from .models import Notification

logger = logging.getLogger(__name__)


class EmailThread(threading.Thread):
    """
    Thread pour l'envoi d'emails en arrière-plan.
    Évite de bloquer la réponse HTTP.
    """
    
    def __init__(self, subject, message, recipient_list, html_message=None, 
                 from_email=None, reply_to=None, attachments=None):
        self.subject = subject
        self.message = message
        self.recipient_list = recipient_list
        self.html_message = html_message
        self.from_email = from_email or settings.DEFAULT_FROM_EMAIL
        self.reply_to = reply_to or ['bibliotheque@bcu-uyi.cm']
        self.attachments = attachments or []
        threading.Thread.__init__(self)

    def run(self):
        try:
            # Utiliser EmailMultiAlternatives pour supporter HTML + texte
            email = EmailMultiAlternatives(
                subject=self.subject,
                body=self.message,
                from_email=self.from_email,
                to=self.recipient_list,
                reply_to=self.reply_to,
            )
            
            # Ajouter le HTML si présent
            if self.html_message:
                email.attach_alternative(self.html_message, "text/html")
            
            # Ajouter les pièces jointes
            for attachment in self.attachments:
                email.attach(*attachment)
            
            # Envoyer l'email
            email.send(fail_silently=False)
            
            logger.info(f"📧 Email envoyé avec succès à {self.recipient_list}")
            
        except Exception as e:
            logger.error(f"❌ Erreur d'envoi d'email à {self.recipient_list}: {str(e)}")


class EmailService:
    """
    Service d'envoi d'emails avec templates et notifications.
    """
    
    @staticmethod
    def send_async_email(user, subject, template_name, context, 
                         notification_title=None, notification_message=None,
                         reply_to=None, attachments=None):
        """
        Envoie un email en asynchrone avec template et crée une notification.
        
        Args:
            user: L'utilisateur destinataire
            subject: Sujet de l'email
            template_name: Nom du template HTML (ex: 'emails/depot_confirmation.html')
            context: Dictionnaire de contexte pour le template
            notification_title: Titre de la notification (si différent du sujet)
            notification_message: Message de la notification
            reply_to: Liste des adresses de réponse
            attachments: Liste des pièces jointes [(filename, content, mimetype)]
        """
        try:
            # Vérifier que l'utilisateur a un email
            if not user or not user.email:
                logger.warning(f"⚠️ L'utilisateur {user.username if user else 'inconnu'} n'a pas d'email")
                return False
            
            # Vérifier que le template existe
            try:
                html_message = render_to_string(template_name, context)
            except Exception as e:
                logger.error(f"❌ Erreur rendu template {template_name}: {str(e)}")
                # Fallback: utiliser un message simple
                html_message = f"<p>{context.get('message', '')}</p>"
            
            plain_message = strip_tags(html_message)
            
            # Envoyer l'email en arrière-plan
            EmailThread(
                subject=subject,
                message=plain_message,
                recipient_list=[user.email],
                html_message=html_message,
                reply_to=reply_to,
                attachments=attachments,
            ).start()
            
            # Créer une notification dans le système
            if notification_title or subject:
                Notification.objects.create(
                    user=user,
                    title=notification_title or subject,
                    message=notification_message or plain_message[:200] + ('...' if len(plain_message) > 200 else ''),
                    link=context.get('link', '/mon-compte/depots')
                )
            
            logger.info(f"📧 Email mis en file d'attente pour {user.email} - Sujet: {subject}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Erreur envoi email à {user.email if user else 'inconnu'}: {str(e)}")
            return False

    @staticmethod
    def send_sync_email(user, subject, template_name, context, 
                        notification_title=None, notification_message=None):
        """
        Envoie un email de manière synchrone (bloquant).
        """
        try:
            if not user or not user.email:
                logger.warning(f"⚠️ L'utilisateur {user.username if user else 'inconnu'} n'a pas d'email")
                return False
            
            html_message = render_to_string(template_name, context)
            plain_message = strip_tags(html_message)
            
            send_mail(
                subject=subject,
                message=plain_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False,
                html_message=html_message,
            )
            
            if notification_title or subject:
                Notification.objects.create(
                    user=user,
                    title=notification_title or subject,
                    message=notification_message or plain_message[:200] + ('...' if len(plain_message) > 200 else ''),
                    link=context.get('link', '/mon-compte/depots')
                )
            
            logger.info(f"📧 Email envoyé à {user.email} - Sujet: {subject}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Erreur envoi email à {user.email if user else 'inconnu'}: {str(e)}")
            return False

    @staticmethod
    def send_notification_only(user, title, message, link=None):
        """
        Crée uniquement une notification sans envoyer d'email.
        """
        try:
            Notification.objects.create(
                user=user,
                title=title,
                message=message,
                link=link or '/'
            )
            return True
        except Exception as e:
            logger.error(f"❌ Erreur création notification: {str(e)}")
            return False

    @staticmethod
    def send_bulk_async_email(users, subject, template_name, context, 
                              notification_title=None):
        """
        Envoie le même email à plusieurs utilisateurs.
        """
        success_count = 0
        for user in users:
            if EmailService.send_async_email(
                user=user,
                subject=subject,
                template_name=template_name,
                context=context,
                notification_title=notification_title
            ):
                success_count += 1
        return success_count


# ─── Fonctions utilitaires pour les templates ─────────────────────

def get_email_context(user, extra_context=None):
    """
    Retourne le contexte de base pour les emails.
    """
    from django.utils import timezone
    context = {
        'user': user,
        'user_full_name': user.get_full_name() or user.username,
        'user_email': user.email,
        'year': timezone.now().year,
        'frontend_url': settings.FRONTEND_URL,
        'site_name': 'BCU UYI',
    }
    if extra_context:
        context.update(extra_context)
    return context