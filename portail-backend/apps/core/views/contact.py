# apps/core/views/contact.py
"""
Vue pour le formulaire de contact.
Envoie les messages à biblio.Bibliotheque@uy1.uninet.cm
"""
import logging
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.throttling import AnonRateThrottle

# ✅ Import du module reCAPTCHA centralisé
from apps.core.recaptcha import verify_recaptcha

logger = logging.getLogger(__name__)


class ContactThrottle(AnonRateThrottle):
    """Limite les envois de contact à 5/minute par IP."""
    scope = 'contact'


class ContactView(APIView):
    """
    POST /api/contact/
    Reçoit les données du formulaire et envoie un email à biblio.Bibliotheque@uy1.uninet.cm
    """
    permission_classes = [AllowAny]
    throttle_classes = [ContactThrottle]

    def post(self, request):
        data = request.data

        # ═══════════════════════════════════════════════════════════
        # 1) Récupération des champs
        # ═══════════════════════════════════════════════════════════
        name = (data.get('name') or '').strip()
        email = (data.get('email') or '').strip()
        subject = (data.get('subject') or '').strip()
        message = (data.get('message') or '').strip()
        honeypot = (data.get('website') or data.get('honeypot') or '').strip()
        recaptcha_token = (data.get('recaptcha_token') or '').strip()

        # ═══════════════════════════════════════════════════════════
        # 2) Anti-spam honeypot (silencieux)
        # ═══════════════════════════════════════════════════════════
        if honeypot:
            logger.warning(
                f"🍯 Honeypot détecté depuis {request.META.get('REMOTE_ADDR')} "
                f"— soumission ignorée silencieusement"
            )
            # On retourne 200 pour ne pas alerter le bot
            return Response({'ok': True}, status=status.HTTP_200_OK)

        # ═══════════════════════════════════════════════════════════
        # 3) Validation des champs
        # ═══════════════════════════════════════════════════════════
        errors = {}
        if not name:
            errors['name'] = 'Le nom est requis.'
        if not email or '@' not in email:
            errors['email'] = 'Adresse email invalide.'
        if not subject:
            errors['subject'] = 'Le sujet est requis.'
        if len(message) < 20:
            errors['message'] = 'Le message doit contenir au moins 20 caractères.'

        if errors:
            logger.info(f"⚠️ Validation échouée: {errors}")
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)

        # ═══════════════════════════════════════════════════════════
        # 4) Vérification reCAPTCHA v3 (via module centralisé)
        # ═══════════════════════════════════════════════════════════
        recaptcha_ok, score, recaptcha_data = verify_recaptcha(
            token=recaptcha_token,
            action='contact_form',
            min_score=getattr(settings, 'RECAPTCHA_SCORE_THRESHOLD', 0.5),
        )

        if not recaptcha_ok:
            logger.warning(
                f"❌ reCAPTCHA refusé — score: {score}, data: {recaptcha_data}"
            )
            return Response(
                {
                    'code': 'recaptcha_failed',
                    'detail': 'Vérification de sécurité échouée. Veuillez réessayer.',
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        logger.info(f"✅ reCAPTCHA validé — score: {score}")

        # ═══════════════════════════════════════════════════════════
        # 5) Envoi de l'email vers biblio.Bibliotheque@uy1.uninet.cm
        # ═══════════════════════════════════════════════════════════
        try:
            # ✅ Adresse cible principale
            recipients = ['biblio.Bibliotheque@uy1.uninet.cm']

            # ✅ Ajouter une copie cachée (optionnel) :
            # recipients.append('bcuy1-portail@offilive.com')

            # ✅ Alternative : utiliser les settings centralisés
            # recipients = list(settings.CONTACT_RECIPIENTS)
            # primary = settings.CONTACT_PRIMARY_RECIPIENT
            # if primary not in recipients:
            #     recipients = [primary] + recipients

            context = {
                'name': name,
                'email': email,
                'subject': subject,
                'message': message,
                'site_name': 'BCU UYI',
                'ip': request.META.get('REMOTE_ADDR', 'inconnue'),
                'recaptcha_score': score,
            }

            # ─── Template HTML (avec fallback) ─────────────────────
            try:
                html_message = render_to_string('emails/contact_message.html', context)
            except Exception as template_err:
                logger.warning(
                    f"⚠️ Template 'emails/contact_message.html' introuvable: {template_err} "
                    f"— utilisation du fallback"
                )
                html_message = f"""
                <html>
                  <body style="font-family:Arial,sans-serif;color:#1B1464;line-height:1.6;">
                    <div style="max-width:600px;margin:0 auto;padding:24px;background:#f5f3ff;border-radius:12px;">
                      <h2 style="color:#7C3AED;border-bottom:2px solid #7C3AED;padding-bottom:8px;">
                        📬 Nouveau message du formulaire de contact
                      </h2>
                      <p><strong>👤 Nom :</strong> {name}</p>
                      <p><strong>📧 Email :</strong> <a href="mailto:{email}" style="color:#7C3AED;">{email}</a></p>
                      <p><strong>📌 Sujet :</strong> {subject}</p>
                      <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;"/>
                      <p><strong>💬 Message :</strong></p>
                      <div style="background:white;padding:16px;border-radius:8px;border-left:4px solid #7C3AED;">
                        <p style="white-space:pre-line;margin:0;">{message}</p>
                      </div>
                      <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;"/>
                      <p style="font-size:12px;color:#888;">
                        Envoyé depuis le portail BCU-UYI<br/>
                        IP : {context['ip']} — Score reCAPTCHA : {score}
                      </p>
                    </div>
                  </body>
                </html>
                """

            plain_message = strip_tags(html_message)

            # ─── Envoi de l'email ──────────────────────────────────
            email_msg = EmailMultiAlternatives(
                subject=f"[Contact BCU-UYI] {subject}",
                body=plain_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=recipients,              # ✅ biblio.Bibliotheque@uy1.uninet.cm
                reply_to=[email],           # ✅ Répondre directement à l'usager
            )
            email_msg.attach_alternative(html_message, 'text/html')
            email_msg.send(fail_silently=False)

            logger.info(
                f"✅ Message de contact envoyé à {recipients} "
                f"(de {email}, sujet: '{subject}', score: {score})"
            )

            return Response(
                {'ok': True, 'message': 'Message envoyé avec succès.'},
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            logger.exception(f"❌ Erreur envoi message contact: {e}")
            return Response(
                {'detail': "Erreur lors de l'envoi. Veuillez réessayer."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )