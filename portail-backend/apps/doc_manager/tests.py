"""Tests unitaires et d'intégration - Applications doc_manager et stats_dashboard."""
import os
import uuid
from unittest.mock import patch, MagicMock, mock_open
from django.test import TestCase
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from apps.accounts.models import PortalUser
from apps.doc_manager.models import DigitalDocument


# ── Helpers ───────────────────────────────────────────────────────────────────

def make_admin(username="doc_admin", email="doc_admin@test.cm", password="pass1234"):
    return PortalUser.objects.create_superuser(username=username, email=email, password=password)

def make_user(username="doc_user", email="doc_user@test.cm", password="pass1234"):
    return PortalUser.objects.create_user(
        username=username, email=email, password=password,
        role=PortalUser.Role.ETUDIANT, auth_source=PortalUser.AuthSource.LOCAL,
    )

def jwt(user):
    return str(RefreshToken.for_user(user).access_token)

def make_document(title="Doc Test", is_restricted=True, download_count=0):
    f = SimpleUploadedFile("test.pdf", b"%PDF test", content_type="application/pdf")
    return DigitalDocument.objects.create(
        title=title, description="Desc", file=f,
        is_restricted=is_restricted, download_count=download_count,
    )


# ═══════════════════════════════════════════════════════════════
# ─── TESTS DU MODÈLE DigitalDocument ─────────────────────────
# ═══════════════════════════════════════════════════════════════

class DigitalDocumentModelTest(TestCase):
    def setUp(self):
        self.doc = make_document()

    def test_uuid_primary_key(self):
        self.assertIsInstance(self.doc.id, uuid.UUID)

    def test_str_repr(self):
        self.assertEqual(str(self.doc), "Doc Test")

    def test_default_is_restricted(self):
        self.assertTrue(self.doc.is_restricted)

    def test_default_download_count(self):
        self.assertEqual(self.doc.download_count, 0)

    def test_public_document_not_restricted(self):
        doc = make_document(title="Public Doc", is_restricted=False)
        self.assertFalse(doc.is_restricted)

    def test_auto_created_at(self):
        self.assertIsNotNone(self.doc.created_at)

    def test_optional_pmb_notice_id(self):
        self.assertIsNone(self.doc.pmb_notice_id)

    def test_ordering_latest_first(self):
        d1 = make_document(title="D1")
        d2 = make_document(title="D2")
        docs = list(DigitalDocument.objects.all())
        self.assertEqual(docs[0].title, "D2")


# ═══════════════════════════════════════════════════════════════
# ─── TESTS DES VUES doc_manager ──────────────────────────────
# ═══════════════════════════════════════════════════════════════

class DigitalDocumentListViewTest(APITestCase):
    def setUp(self):
        self.url = "/api/documents/"
        make_document(title="Public Doc", is_restricted=False)
        make_document(title="Private Doc", is_restricted=True)

    def test_public_access_allowed(self):
        r = self.client.get(self.url)
        self.assertEqual(r.status_code, status.HTTP_200_OK)

    def test_returns_all_documents(self):
        r = self.client.get(self.url)
        results = r.data.get("results", r.data)
        self.assertGreaterEqual(len(results), 2)


class SecureDownloadViewTest(APITestCase):
    def setUp(self):
        self.user = make_user(username="dl_user")
        self.restricted_doc = make_document(title="Restricted", is_restricted=True)
        self.public_doc = make_document(title="Public", is_restricted=False)

    def test_restricted_doc_requires_auth(self):
        url = f"/api/documents/{self.restricted_doc.pk}/download/"
        r = self.client.get(url)
        self.assertEqual(r.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_nonexistent_document_404(self):
        fake_id = uuid.uuid4()
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {jwt(self.user)}")
        r = self.client.get(f"/api/documents/{fake_id}/download/")
        self.assertEqual(r.status_code, status.HTTP_404_NOT_FOUND)

    @patch("apps.doc_manager.views.os.path.exists", return_value=False)
    def test_file_not_found_on_disk(self, mock_exists):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {jwt(self.user)}")
        url = f"/api/documents/{self.restricted_doc.pk}/download/"
        r = self.client.get(url)
        self.assertEqual(r.status_code, status.HTTP_404_NOT_FOUND)

    @patch("apps.doc_manager.views.os.path.exists", return_value=True)
    @patch("builtins.open", mock_open(read_data=b"%PDF-test"))
    def test_authenticated_can_download_restricted(self, mock_exists):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {jwt(self.user)}")
        url = f"/api/documents/{self.restricted_doc.pk}/download/"
        r = self.client.get(url)
        self.assertEqual(r.status_code, status.HTTP_200_OK)

    @patch("apps.doc_manager.views.os.path.exists", return_value=True)
    @patch("builtins.open", mock_open(read_data=b"%PDF-test"))
    def test_download_increments_count(self, mock_exists):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {jwt(self.user)}")
        initial = self.restricted_doc.download_count
        url = f"/api/documents/{self.restricted_doc.pk}/download/"
        self.client.get(url)
        self.restricted_doc.refresh_from_db()
        self.assertEqual(self.restricted_doc.download_count, initial + 1)

    @patch("apps.doc_manager.views.os.path.exists", return_value=True)
    @patch("builtins.open", mock_open(read_data=b"%PDF-test"))
    def test_unauthenticated_can_download_public(self, mock_exists):
        url = f"/api/documents/{self.public_doc.pk}/download/"
        r = self.client.get(url)
        self.assertEqual(r.status_code, status.HTTP_200_OK)


# ═══════════════════════════════════════════════════════════════
# ─── TESTS D'INTÉGRATION ─────────────────────────────────────
# ═══════════════════════════════════════════════════════════════

class DocManagerIntegrationTest(APITestCase):
    """Flux complet : liste → vérification restriction → téléchargement."""

    def setUp(self):
        self.user = make_user(username="dm_int_user")
        self.public_doc = make_document(title="DM Public", is_restricted=False)
        self.restricted_doc = make_document(title="DM Restricted", is_restricted=True)

    def test_list_all_then_download_public(self):
        # Lister tous les documents (public)
        list_r = self.client.get("/api/documents/")
        self.assertEqual(list_r.status_code, status.HTTP_200_OK)

        # Télécharger le document public sans auth (doit échouer si fichier absent)
        dl_url = f"/api/documents/{self.public_doc.pk}/download/"
        with patch("apps.doc_manager.views.os.path.exists", return_value=False):
            dl_r = self.client.get(dl_url)
        self.assertEqual(dl_r.status_code, status.HTTP_404_NOT_FOUND)

    def test_restricted_document_requires_auth(self):
        dl_url = f"/api/documents/{self.restricted_doc.pk}/download/"
        r = self.client.get(dl_url)
        self.assertEqual(r.status_code, status.HTTP_401_UNAUTHORIZED)

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {jwt(self.user)}")
        with patch("apps.doc_manager.views.os.path.exists", return_value=True):
            with patch("builtins.open", mock_open(read_data=b"%PDF")):
                r2 = self.client.get(dl_url)
        self.assertEqual(r2.status_code, status.HTTP_200_OK)