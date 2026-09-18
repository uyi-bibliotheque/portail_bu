"""Tests unitaires et d'intégration - Application notifications."""
from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from apps.accounts.models import PortalUser
from apps.notifications.models import Notification


# ── Helpers ───────────────────────────────────────────────────────────────────

def make_user(username="notif_user", email="notif@test.cm", password="pass1234"):
    return PortalUser.objects.create_user(
        username=username, email=email, password=password,
        role=PortalUser.Role.ETUDIANT, auth_source=PortalUser.AuthSource.LOCAL,
    )

def jwt(user):
    return str(RefreshToken.for_user(user).access_token)

def make_notification(user, title="Test", message="Message test", is_read=False):
    return Notification.objects.create(
        user=user, title=title, message=message, is_read=is_read
    )


# ═══════════════════════════════════════════════════════════════
# ─── TESTS DU MODÈLE Notification ────────────────────────────
# ═══════════════════════════════════════════════════════════════

class NotificationModelTest(TestCase):
    def setUp(self):
        self.user = make_user()
        self.notif = make_notification(self.user)

    def test_str_repr(self):
        s = str(self.notif)
        self.assertIn("Test", s)
        self.assertIn("Non lu", s)

    def test_default_is_read_false(self):
        self.assertFalse(self.notif.is_read)

    def test_mark_as_read(self):
        self.notif.mark_as_read()
        self.assertTrue(self.notif.is_read)
        self.assertIsNotNone(self.notif.read_at)

    def test_mark_as_unread(self):
        self.notif.mark_as_read()
        self.notif.mark_as_unread()
        self.assertFalse(self.notif.is_read)
        self.assertIsNone(self.notif.read_at)

    def test_auto_created_at(self):
        self.assertIsNotNone(self.notif.created_at)

    def test_ordering_latest_first(self):
        n1 = make_notification(self.user, title="Premier")
        n2 = make_notification(self.user, title="Deuxième")
        notifs = list(Notification.objects.filter(user=self.user))
        self.assertEqual(notifs[0].title, "Deuxième")

    def test_email_sent_default_false(self):
        self.assertFalse(self.notif.email_sent)

    def test_notification_with_link(self):
        n = Notification.objects.create(
            user=self.user, title="Avec lien",
            message="Voir ici", link="/mon-compte"
        )
        self.assertEqual(n.link, "/mon-compte")

    def test_str_shows_lu_when_read(self):
        self.notif.mark_as_read()
        self.assertIn("Lu", str(self.notif))


# ═══════════════════════════════════════════════════════════════
# ─── TESTS DES VUES ───────────────────────────────────────────
# ═══════════════════════════════════════════════════════════════

class NotificationListViewTest(APITestCase):
    def setUp(self):
        self.user = make_user(username="list_notif_user")
        self.other = make_user(username="other_notif", email="other_notif@test.cm")
        make_notification(self.user, title="N1")
        make_notification(self.user, title="N2")
        make_notification(self.other, title="Other N")
        self.url = "/api/notifications/"  # inclus dans config/urls.py sous api/notifications/

    def test_authenticated_sees_own_notifications(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {jwt(self.user)}")
        r = self.client.get(self.url)
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        # Chaque utilisateur ne voit que ses notifications
        results = r.data.get("results", r.data)
        titles = [n["title"] for n in results]
        self.assertIn("N1", titles)
        self.assertIn("N2", titles)
        self.assertNotIn("Other N", titles)

    def test_unauthenticated_blocked(self):
        r = self.client.get(self.url)
        self.assertEqual(r.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_returns_list(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {jwt(self.user)}")
        r = self.client.get(self.url)
        self.assertEqual(r.status_code, status.HTTP_200_OK)


class NotificationMarkReadViewTest(APITestCase):
    def setUp(self):
        self.user = make_user(username="mark_user")
        self.other = make_user(username="mark_other", email="mark_other@test.cm")
        self.notif = make_notification(self.user)
        self.url = f"/api/notifications/{self.notif.pk}/read/"  # <int:pk>/read/

    def test_owner_can_mark_read(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {jwt(self.user)}")
        r = self.client.patch(self.url, format="json")
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertTrue(r.data["success"])
        self.notif.refresh_from_db()
        self.assertTrue(self.notif.is_read)

    def test_owner_can_mark_read_via_post(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {jwt(self.user)}")
        r = self.client.post(self.url, format="json")
        self.assertEqual(r.status_code, status.HTTP_200_OK)

    def test_other_user_cannot_mark_read(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {jwt(self.other)}")
        r = self.client.patch(self.url, format="json")
        self.assertEqual(r.status_code, status.HTTP_404_NOT_FOUND)

    def test_invalid_pk_returns_400(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {jwt(self.user)}")
        r = self.client.patch("/api/notifications/abc/read/", format="json")
        self.assertEqual(r.status_code, status.HTTP_404_NOT_FOUND)


class NotificationMarkAllReadViewTest(APITestCase):
    def setUp(self):
        self.user = make_user(username="markall_user")
        make_notification(self.user, title="A")
        make_notification(self.user, title="B")
        make_notification(self.user, title="C", is_read=True)
        self.url = "/api/notifications/read-all/"

    def test_marks_all_unread_as_read(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {jwt(self.user)}")
        r = self.client.post(self.url, format="json")
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(r.data["count"], 2)  # A et B non lues (C déjà lu)

    def test_returns_zero_when_all_read(self):
        Notification.objects.filter(user=self.user).update(is_read=True)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {jwt(self.user)}")
        r = self.client.post(self.url, format="json")
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertEqual(r.data["count"], 0)

    def test_unauthenticated_blocked(self):
        r = self.client.post(self.url, format="json")
        self.assertEqual(r.status_code, status.HTTP_401_UNAUTHORIZED)


class UnreadCountViewTest(APITestCase):
    def setUp(self):
        self.user = make_user(username="count_user")
        make_notification(self.user, title="U1")
        make_notification(self.user, title="U2")
        make_notification(self.user, title="R1", is_read=True)
        self.url = "/api/notifications/unread-count/"  # unread-count/

    def test_returns_correct_count(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {jwt(self.user)}")
        r = self.client.get(self.url)
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertEqual(r.data["count"], 2)
        self.assertTrue(r.data["has_unread"])

    def test_no_unread(self):
        Notification.objects.filter(user=self.user).update(is_read=True)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {jwt(self.user)}")
        r = self.client.get(self.url)
        self.assertEqual(r.data["count"], 0)
        self.assertFalse(r.data["has_unread"])

    def test_unauthenticated_blocked(self):
        r = self.client.get(self.url)
        self.assertEqual(r.status_code, status.HTTP_401_UNAUTHORIZED)


# ═══════════════════════════════════════════════════════════════
# ─── TESTS D'INTÉGRATION ─────────────────────────────────────
# ═══════════════════════════════════════════════════════════════

class NotificationsIntegrationTest(APITestCase):
    """Flux complet : création → lecture → comptage → tout marquer lu."""

    def setUp(self):
        self.user = make_user(username="full_notif_user")

    def test_full_notification_flow(self):
        # Créer des notifications en DB
        make_notification(self.user, title="Notif 1")
        make_notification(self.user, title="Notif 2")

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {jwt(self.user)}")

        # Vérifier comptage initial
        count_r = self.client.get("/api/notifications/unread-count/")
        self.assertEqual(count_r.data["count"], 2)

        # Récupérer la liste
        list_r = self.client.get("/api/notifications/")
        self.assertEqual(list_r.status_code, status.HTTP_200_OK)
        results = list_r.data.get("results", list_r.data)
        first_id = results[0]["id"]

        # Marquer la première comme lue
        mark_r = self.client.patch(f"/api/notifications/{first_id}/read/")
        self.assertEqual(mark_r.status_code, status.HTTP_200_OK)

        # Comptage doit baisser à 1
        count_r2 = self.client.get("/api/notifications/unread-count/")
        self.assertEqual(count_r2.data["count"], 1)

        # Tout marquer comme lu
        all_r = self.client.post("/api/notifications/read-all/")
        self.assertEqual(all_r.data["count"], 1)

        # Comptage final = 0
        count_r3 = self.client.get("/api/notifications/unread-count/")
        self.assertEqual(count_r3.data["count"], 0)

    def test_notifications_are_user_isolated(self):
        other = make_user(username="iso_other", email="iso@test.cm")
        make_notification(other, title="Autre user notif")
        make_notification(self.user, title="Ma notif")

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {jwt(self.user)}")
        count_r = self.client.get("/api/notifications/unread-count/")
        self.assertEqual(count_r.data["count"], 1)