# apps/core/recaptcha.py
import requests
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

# ⚙️ Configuration
FAIL_OPEN_ON_NETWORK_ERROR = True  # ← Autoriser si Google est injoignable


def verify_recaptcha(token, action=None, min_score=None):
    """
    Vérifie un token reCAPTCHA v3 auprès de Google.

    Args:
        token (str): Le token renvoyé par le frontend
        action (str, optional): Nom de l'action ('contact_form', 'login', etc.)
        min_score (float, optional): Score minimum requis (0.0 - 1.0)

    Returns:
        tuple: (success: bool, score: float, data: dict)
    """
    # ─── Cas 1 : reCAPTCHA désactivé dans les settings ─────────
    if not settings.RECAPTCHA_ENABLED:
        logger.warning("⚠️ reCAPTCHA désactivé — vérification ignorée")
        return True, 1.0, {'skipped': True, 'reason': 'disabled'}

    # ─── Cas 2 : Aucun token fourni ────────────────────────────
    if not token:
        logger.warning("⚠️ reCAPTCHA: Aucun token fourni")
        return False, 0.0, {'error': 'missing_token'}

    # ─── Cas 3 : Vérification auprès de Google ─────────────────
    try:
        response = requests.post(
            settings.RECAPTCHA_VERIFY_URL,
            data={
                'secret': settings.RECAPTCHA_PRIVATE_KEY,
                'response': token,
            },
            timeout=5,
        )
        result = response.json()

        success = result.get('success', False)
        score = result.get('score', 0.0)
        returned_action = result.get('action', '')
        error_codes = result.get('error-codes', [])

        # ─── Vérification de l'action ───────────────────────────
        if success and action and returned_action != action:
            logger.warning(
                f"⚠️ reCAPTCHA: Action mismatch "
                f"(attendu: '{action}', reçu: '{returned_action}')"
            )
            success = False

        # ─── Vérification du score ──────────────────────────────
        threshold = min_score if min_score is not None else settings.RECAPTCHA_SCORE_THRESHOLD
        if success and score < threshold:
            logger.warning(
                f"⚠️ reCAPTCHA: Score trop bas ({score} < {threshold}) — probablement un bot"
            )
            success = False

        # ─── Log final ──────────────────────────────────────────
        if success:
            logger.info(f"✅ reCAPTCHA valide (score: {score}, action: '{returned_action}')")
        else:
            logger.warning(f"❌ reCAPTCHA échec — codes: {error_codes}")

        return success, score, result

    # ─── Cas 4 : Erreur réseau → FAIL-OPEN (recommandé) ────────
    except requests.Timeout:
        logger.error("⏱️ reCAPTCHA: Timeout — Google ne répond pas")
        if FAIL_OPEN_ON_NETWORK_ERROR:
            logger.warning("⚠️ reCAPTCHA: Fail-open activé — envoi autorisé")
            return True, 0.5, {'error': 'timeout', 'fail_open': True}
        return False, 0.0, {'error': 'timeout'}

    except requests.RequestException as e:
        logger.error(f"❌ reCAPTCHA: Erreur réseau — {e}")
        if FAIL_OPEN_ON_NETWORK_ERROR:
            logger.warning("⚠️ reCAPTCHA: Fail-open activé — envoi autorisé")
            return True, 0.5, {'error': 'network_error', 'fail_open': True}
        return False, 0.0, {'error': 'network_error', 'detail': str(e)}

    # ─── Cas 5 : Erreur inattendue ─────────────────────────────
    except Exception as e:
        logger.error(f"❌ reCAPTCHA: Erreur inattendue — {e}")
        if FAIL_OPEN_ON_NETWORK_ERROR:
            logger.warning("⚠️ reCAPTCHA: Fail-open activé — envoi autorisé")
            return True, 0.5, {'error': 'unknown', 'fail_open': True}
        return False, 0.0, {'error': 'unknown', 'detail': str(e)}