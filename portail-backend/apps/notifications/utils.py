# apps/notifications/utils.py
import threading
from django.core.mail import send_mail
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


class EmailThread(threading.Thread):
    """Thread pour l'envoi d'emails en arrière-plan."""
    
    def __init__(self, subject, message, recipient_list, html_message=None):
        self.subject = subject
        self.message = message
        self.recipient_list = recipient_list
        self.html_message = html_message
        threading.Thread.__init__(self)

    def run(self):
        try:
            if self.html_message:
                send_mail(
                    self.subject,
                    self.message,
                    settings.DEFAULT_FROM_EMAIL,
                    self.recipient_list,
                    fail_silently=False,
                    html_message=self.html_message
                )
            else:
                send_mail(
                    self.subject,
                    self.message,
                    settings.DEFAULT_FROM_EMAIL,
                    self.recipient_list,
                    fail_silently=False,
                )
            logger.info(f"Email envoyé avec succès à {self.recipient_list}")
        except Exception as e:
            logger.error(f"Erreur d'envoi d'email à {self.recipient_list} : {str(e)}")


def send_async_email(subject, message, recipient_list, html_message=None):
    """
    Envoie un email en arrière-plan.
    
    Args:
        subject (str): Sujet de l'email
        message (str): Message texte
        recipient_list (list): Liste des destinataires
        html_message (str, optional): Message HTML
    """
    if not recipient_list:
        logger.warning("Liste de destinataires vide, email non envoyé")
        return
    
    # Filtrer les emails vides
    valid_recipients = [r for r in recipient_list if r and isinstance(r, str) and '@' in r]
    
    if not valid_recipients:
        logger.warning("Aucun email valide dans la liste des destinataires")
        return
    
    try:
        EmailThread(subject, message, valid_recipients, html_message).start()
        logger.info(f"Email en file d'attente pour {valid_recipients}")
    except Exception as e:
        logger.error(f"Erreur lors de la mise en file d'attente de l'email: {str(e)}")