# apps/memoires/signals.py
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from apps.memoires.models import Memoire
from apps.notifications.models import Notification
from apps.notifications.utils import send_async_email
import logging

logger = logging.getLogger(__name__)
User = get_user_model()


def create_notification_safe(user, title, message, link):
    if not user:
        logger.warning("Tentative de création de notification sans utilisateur")
        return None
    
    try:
        notification = Notification(
            user=user,
            title=title,
            message=message,
            link=link
        )
        notification.save()
        return notification
    except Exception as e:
        logger.error(f"Erreur création notification pour {user}: {str(e)}")
        return None


def send_email_safe(subject, message, recipients):
    if not recipients:
        return
    
    try:
        send_async_email(subject, message, recipients)
    except Exception as e:
        logger.error(f"Erreur envoi email à {recipients}: {str(e)}")


@receiver(pre_save, sender=Memoire)
def memoire_pre_save(sender, instance, **kwargs):
    if instance.pk:
        try:
            old = Memoire.objects.get(pk=instance.pk)
            if old.status != instance.status:
                if not instance.can_transition_to(instance.status):
                    raise ValueError(f"Transition impossible de '{old.status}' vers '{instance.status}'")
        except Memoire.DoesNotExist:
            pass


@receiver(post_save, sender=Memoire)
def memoire_status_changed(sender, instance, created, **kwargs):
    link = f"/staff/memoires/{instance.id}" if instance.id else "/staff/memoires/"
    
    try:
        if created:
            title = "📝 Dépôt de mémoire initié"
            message = f"Votre dépôt pour '{instance.title}' a bien été initié. Statut : {instance.get_status_display()}."
            create_notification_safe(instance.author, title, message, link)
            
            if instance.author.email:
                send_email_safe(title, message, [instance.author.email])
            
            staff_users = User.objects.filter(role__in=['ADMIN', 'BIBLIO'])
            staff_title = "📚 Nouveau mémoire déposé"
            staff_message = f"L'étudiant {instance.author.get_full_name() or instance.author.username} a déposé '{instance.title}'. En attente de validation."
            
            for staff in staff_users:
                create_notification_safe(staff, staff_title, staff_message, link)
                if staff.email:
                    send_email_safe(staff_title, staff_message, [staff.email])
            
            logger.info(f"Notifications de création envoyées pour le mémoire {instance.id}")
            return

        try:
            old = Memoire.objects.get(pk=instance.pk)
            status_changed = old.status != instance.status
            physical_sign_changed = old.is_quitus_physically_signed != instance.is_quitus_physically_signed
            
            if not status_changed and not physical_sign_changed:
                return
            
            if physical_sign_changed and instance.is_quitus_physically_signed:
                handle_physical_signature(instance, link)
                return
                
        except Memoire.DoesNotExist:
            return

        status_handlers = {
            'en_attente': handle_en_attente,
            'valide': handle_valide,
            'quitus_genere': handle_quitus_genere,
            'quitus_signe': handle_quitus_signe,
            'rejete': handle_rejete,
        }
        
        handler = status_handlers.get(instance.status)
        if handler:
            handler(instance, link)
        
        logger.info(f"Notifications traitées pour le mémoire {instance.id} - Statut: {instance.status}")
        
    except Exception as e:
        logger.error(f"Erreur dans le signal memoire_status_changed: {str(e)}")


def handle_physical_signature(instance, link):
    """Gère la notification pour la signature physique du quitus."""
    title = "📄 Quitus signé physiquement"
    message = f"Le quitus pour le mémoire '{instance.title}' a été signé physiquement par le bibliothécaire."
    create_notification_safe(instance.author, title, message, link)
    if instance.author.email:
        send_email_safe(title, message, [instance.author.email])
    
    staff_users = User.objects.filter(role__in=['ADMIN', 'BIBLIO'])
    staff_title = "✅ Quitus signé physiquement"
    staff_message = f"Le quitus pour '{instance.title}' (auteur: {instance.author.get_full_name() or instance.author.username}) a été signé physiquement."
    for staff in staff_users:
        create_notification_safe(staff, staff_title, staff_message, link)
    
    logger.info(f"Signature physique notifiée pour le mémoire {instance.id}")


def handle_en_attente(instance, link):
    staff_users = User.objects.filter(role__in=['ADMIN', 'BIBLIO'])
    title = "📚 Nouveau mémoire à valider"
    message = f"L'étudiant {instance.author.get_full_name() or instance.author.username} a complété son dépôt pour '{instance.title}'. En attente de validation."
    
    for staff in staff_users:
        create_notification_safe(staff, title, message, link)
        if staff.email:
            send_email_safe(title, message, [staff.email])


def handle_valide(instance, link):
    title = "✅ Mémoire validé !"
    message = f"Félicitations, votre mémoire '{instance.title}' a été validé par la bibliothèque."
    create_notification_safe(instance.author, title, message, link)
    if instance.author.email:
        send_email_safe(title, message, [instance.author.email])


def handle_quitus_genere(instance, link):
    title = "📄 Quitus généré"
    message = f"Votre quitus de bibliothèque pour '{instance.title}' est maintenant disponible."
    create_notification_safe(instance.author, title, message, link)
    if instance.author.email:
        send_email_safe(title, message, [instance.author.email])


def handle_quitus_signe(instance, link):
    title = "✅ Quitus signé !"
    message = f"Votre quitus pour '{instance.title}' a été signé. Vous pouvez le télécharger."
    create_notification_safe(instance.author, title, message, link)
    if instance.author.email:
        send_email_safe(title, message, [instance.author.email])


def handle_rejete(instance, link):
    title = "❌ Dépôt de mémoire rejeté"
    message = f"Votre dépôt pour '{instance.title}' a été rejeté. Motif : {instance.rejection_reason or 'Non spécifié'}"
    create_notification_safe(instance.author, title, message, link)
    if instance.author.email:
        send_email_safe(title, message, [instance.author.email])