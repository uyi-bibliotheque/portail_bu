"""Tests unitaires et d'intégration - Application user_favorites."""
import uuid
from django.test import TestCase
from django.db import IntegrityError
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from apps.accounts.models import PortalUser
from apps.user_favorites.models import UserFavorite


# ── Helpers ───────────────────────────────────────────────────────────────────

def make_user(username="fav_user", email="fav@test.cm", password="pass1234"):
    return PortalUser.objects.create_user(
        username=username, email=email, password=password,
        role=PortalUser.Role.ETUDIANT, auth_source=PortalUser.AuthSource.LOCAL,
    )

def jwt(user):
    return str(RefreshToken.for_user(user).access_token)

def make_favorite(user, notice_id="PMB001", note=""):
    return UserFavorite.objects.create(user=user, pmb_notice_id=notice_id, note=note)


# ═══════════════════════════════════════════════════════════════
# ─── TESTS DU MODÈLE UserFavorite ────────────────────────────
# ═══════════════════════════════════════════════════════════════

class UserFavoriteModelTest(TestCase):
    def setUp(self):
        self.user = make_user()
        self.fav = make_favorite(self.user)

    def test_uuid_primary_key(self):
        self.assertIsInstance(self.fav.id, uuid.UUID)

    def test_str_repr(self):
        s = str(self.fav)
        self.assertIn("PMB001", s)
        self.assertIn(self.user.username, s)

    def test_unique_together_constraint(self):
        with self.assertRaises(IntegrityError):
            UserFavorite.objects.create(user=self.user, pmb_notice_id="PMB001")

    def test_different_users_can_have_same_notice(self):
        other = make_user(username="fav_other", email="fav_other@test.cm")
        fav2 = make_favorite(other, notice_id="PMB001")
        self.assertIsNotNone(fav2.id)

    def test_note_optional(self):
        fav = make_favorite(self.user, notice_id="PMB_NONOTE")
        self.assertEqual(fav.note, "")

    def test_note_stored(self):
        fav = make_favorite(self.user, notice_id="PMB_NOTED", note="Très intéressant")
        self.assertEqual(fav.note, "Très intéressant")

    def test_auto_created_at(self):
        self.assertIsNotNone(self.fav.created_at)

    def test_ordering_latest_first(self):
        make_favorite(self.user, notice_id="PMB002")
        favs = list(UserFavorite.objects.filter(user=self.user))
        self.assertEqual(favs[0].pmb_notice_id, "PMB002")


# ═══════════════════════════════════════════════════════════════
# ─── TESTS DES VUES ───────────────────────────────────────────
# ═══════════════════════════════════════════════════════════════

class UserFavoriteListCreateViewTest(APITestCase):
    def setUp(self):
        self.url = "/api/favorites/"
        self.user = make_user(username="lc_user")
        self.other = make_user(username="lc_other", email="lc_other@test.cm")
        make_favorite(self.user, notice_id="PMB_A")
        make_favorite(self.other, notice_id="PMB_B")

    def test_authenticated_sees_own_favorites(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {jwt(self.user)}")
        r = self.client.get(self.url)
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        results = r.data.get("results", r.data)
        notice_ids = [f["pmb_notice_id"] for f in results]
        self.assertIn("PMB_A", notice_ids)
        self.assertNotIn("PMB_B", notice_ids)

    def test_unauthenticated_blocked(self):
        r = self.client.get(self.url)
        self.assertEqual(r.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_favorite(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {jwt(self.user)}")
        r = self.client.post(self.url, {"pmb_notice_id": "PMB_NEW", "note": "Bon livre"}, format="json")
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)
        self.assertEqual(r.data["pmb_notice_id"], "PMB_NEW")

    def test_create_assigns_current_user(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {jwt(self.user)}")
        self.client.post(self.url, {"pmb_notice_id": "PMB_ASSIGN"}, format="json")
        fav = UserFavorite.objects.get(user=self.user, pmb_notice_id="PMB_ASSIGN")
        self.assertEqual(fav.user, self.user)

    def test_duplicate_favorite_rejected(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {jwt(self.user)}")
        self.client.post(self.url, {"pmb_notice_id": "PMB_DUP"}, format="json")
        r = self.client.post(self.url, {"pmb_notice_id": "PMB_DUP"}, format="json")
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)


class UserFavoriteDetailViewTest(APITestCase):
    def setUp(self):
        self.user = make_user(username="del_user")
        self.other = make_user(username="del_other", email="del_other@test.cm")
        self.fav = make_favorite(self.user, notice_id="PMB_DEL")
        self.url = f"/api/favorites/{self.fav.id}/"

    def test_owner_can_delete(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {jwt(self.user)}")
        r = self.client.delete(self.url)
        self.assertEqual(r.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(UserFavorite.objects.filter(id=self.fav.id).exists())

    def test_other_user_cannot_delete(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {jwt(self.other)}")
        r = self.client.delete(self.url)
        self.assertEqual(r.status_code, status.HTTP_404_NOT_FOUND)

    def test_unauthenticated_cannot_delete(self):
        r = self.client.delete(self.url)
        self.assertEqual(r.status_code, status.HTTP_401_UNAUTHORIZED)


# ═══════════════════════════════════════════════════════════════
# ─── TESTS D'INTÉGRATION ─────────────────────────────────────
# ═══════════════════════════════════════════════════════════════

class UserFavoritesIntegrationTest(APITestCase):
    """Flux complet : ajouter → lister → supprimer."""

    def setUp(self):
        self.user = make_user(username="int_fav_user")
        self.url = "/api/favorites/"

    def test_add_list_delete_flow(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {jwt(self.user)}")

        # Ajouter deux favoris
        r1 = self.client.post(self.url, {"pmb_notice_id": "PMB_INT_1", "note": "Note 1"}, format="json")
        self.assertEqual(r1.status_code, status.HTTP_201_CREATED)
        fav_id = r1.data["id"]

        r2 = self.client.post(self.url, {"pmb_notice_id": "PMB_INT_2"}, format="json")
        self.assertEqual(r2.status_code, status.HTTP_201_CREATED)

        # Lister : 2 favoris
        list_r = self.client.get(self.url)
        results = list_r.data.get("results", list_r.data)
        self.assertEqual(len(results), 2)

        # Supprimer le premier
        del_r = self.client.delete(f"/api/favorites/{fav_id}/")
        self.assertEqual(del_r.status_code, status.HTTP_204_NO_CONTENT)

        # Lister : 1 favori restant
        list_r2 = self.client.get(self.url)
        results2 = list_r2.data.get("results", list_r2.data)
        self.assertEqual(len(results2), 1)
        self.assertEqual(results2[0]["pmb_notice_id"], "PMB_INT_2")

    def test_user_isolation(self):
        other = make_user(username="iso_fav", email="iso_fav@test.cm")
        make_favorite(other, notice_id="OTHER_FAV")
        make_favorite(self.user, notice_id="MY_FAV")

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {jwt(self.user)}")
        list_r = self.client.get(self.url)
        results = list_r.data.get("results", list_r.data)
        notice_ids = [f["pmb_notice_id"] for f in results]
        self.assertIn("MY_FAV", notice_ids)
        self.assertNotIn("OTHER_FAV", notice_ids)