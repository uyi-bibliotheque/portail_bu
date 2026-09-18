"""Tests unitaires et d'intégration - Application memoires."""
import io
import uuid
from unittest.mock import patch, MagicMock
from django.test import TestCase
from django.urls import reverse
from django.core.exceptions import ValidationError
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from apps.accounts.models import PortalUser
from apps.memoires.models import Memoire, DocumentSequence
from apps.memoires.serializers import (
    MemoireSerializer, MemoireStatusUpdateSerializer,
    MemoireSearchSerializer, MemoireVerifySerializer,
)


# ── Helpers ───────────────────────────────────────────────────────────────────

def make_student(username="stu01", email="stu01@test.cm", password="pass1234"):
    return PortalUser.objects.create_user(
        username=username, email=email, password=password,
        role=PortalUser.Role.ETUDIANT, auth_source=PortalUser.AuthSource.LOCAL,
    )

def make_staff(username="staff01", email="staff01@test.cm", password="pass1234"):
    return PortalUser.objects.create_superuser(username=username, email=email, password=password)

def jwt(user):
    return str(RefreshToken.for_user(user).access_token)

def make_pdf():
    return SimpleUploadedFile("test.pdf", b"%PDF-1.4 test", content_type="application/pdf")

def make_docx():
    return SimpleUploadedFile("test.docx", b"docx content", content_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document")

def make_memoire(author, status_val='brouillon', type_doc='MEMOIRE'):
    """Crée un Memoire de test directement en base sans déclencher transition."""
    m = Memoire(
        author=author,
        type_document=type_doc,
        title="Titre Test",
        abstract="Résumé test",
        matricule=author.username,
        full_name=author.get_full_name() or author.username,
        filiere="Informatique",
        president_jury="Dr Kamga",
        examinateur_1="Dr Eto",
        status=status_val,
    )
    # Bypass clean() pour les tests de modèle
    Memoire.objects.bulk_create([m])
    return Memoire.objects.get(title="Titre Test", author=author)


# ═══════════════════════════════════════════════════════════════
# ─── TESTS DU MODÈLE Memoire ─────────────────────────────────
# ═══════════════════════════════════════════════════════════════

class MemoireModelTest(TestCase):
    def setUp(self):
        self.student = make_student()
        self.memoire = make_memoire(self.student)

    def test_uuid_primary_key(self):
        self.assertIsInstance(self.memoire.id, uuid.UUID)

    def test_str_repr(self):
        s = str(self.memoire)
        self.assertIn("Titre Test", s)
        self.assertIn(self.student.username, s)

    def test_default_status_brouillon(self):
        self.assertEqual(self.memoire.status, "brouillon")

    def test_can_transition_to_valid(self):
        self.assertTrue(self.memoire.can_transition_to("depot_en_ligne"))

    def test_can_transition_to_invalid(self):
        self.assertFalse(self.memoire.can_transition_to("quitus_disponible"))

    def test_can_transition_to_same_status(self):
        self.assertTrue(self.memoire.can_transition_to("brouillon"))

    def test_transition_updates_status(self):
        self.memoire.transition_to("depot_en_ligne")
        self.assertEqual(self.memoire.status, "depot_en_ligne")
        self.assertIsNotNone(self.memoire.submitted_at)

    def test_transition_invalid_raises_validation_error(self):
        with self.assertRaises(ValidationError):
            self.memoire.transition_to("quitus_disponible")

    def test_is_jury_complete_memoire(self):
        self.assertTrue(self.memoire.is_jury_complete())

    def test_is_jury_incomplete_these(self):
        self.memoire.type_document = "THESE"
        self.assertFalse(self.memoire.is_jury_complete())

    def test_is_upload_complete_without_files(self):
        self.assertFalse(self.memoire.is_upload_complete())

    def test_get_jury_members(self):
        members = self.memoire.get_jury_members()
        self.assertTrue(any(m['name'] == 'Dr Kamga' for m in members))

    def test_get_jury_count_memoire(self):
        self.assertEqual(self.memoire.get_jury_count(), 2)

    def test_get_jury_count_these(self):
        self.memoire.type_document = "THESE"
        self.assertEqual(self.memoire.get_jury_count(), 4)

    def test_get_status_display_with_icon(self):
        display = self.memoire.get_status_display_with_icon()
        self.assertIn("📝", display)

    def test_get_all_file_urls_empty(self):
        urls = self.memoire.get_all_file_urls()
        self.assertIsNone(urls['pdf'])
        self.assertIsNone(urls['word'])

    # ── Transitions et timestamps ──────────────────────────────

    def test_transition_convocation_sets_flag(self):
        self.memoire.transition_to("depot_en_ligne")
        self.memoire.transition_to("convocation_envoyee")
        self.assertTrue(self.memoire.convocation_sent)
        self.assertIsNotNone(self.memoire.convocation_sent_at)

    def test_transition_relance_sets_flag(self):
        self.memoire.transition_to("depot_en_ligne")
        self.memoire.transition_to("convocation_envoyee")
        self.memoire.transition_to("relance_envoyee")
        self.assertTrue(self.memoire.relance_sent)


# ═══════════════════════════════════════════════════════════════
# ─── TESTS DU MODÈLE DocumentSequence ─────────────────────────
# ═══════════════════════════════════════════════════════════════

class DocumentSequenceTest(TestCase):
    def test_get_next_number_increments(self):
        n1 = DocumentSequence.get_next_number(2024, "MEMOIRE", "FS")
        n2 = DocumentSequence.get_next_number(2024, "MEMOIRE", "FS")
        self.assertEqual(n2, n1 + 1)

    def test_get_next_number_different_faculty(self):
        n1 = DocumentSequence.get_next_number(2024, "MEMOIRE", "FALSH")
        n2 = DocumentSequence.get_next_number(2024, "MEMOIRE", "FS")
        # Chaque faculté commence à 1
        self.assertEqual(n1, 1)
        self.assertEqual(n2, 1)

    def test_unique_together_constraint(self):
        DocumentSequence.objects.create(year=2024, document_type="THESE", faculty="ENS", counter=1)
        with self.assertRaises(Exception):
            DocumentSequence.objects.create(year=2024, document_type="THESE", faculty="ENS", counter=2)


# ═══════════════════════════════════════════════════════════════
# ─── TESTS DES SERIALIZERS ────────────────────────────────────
# ═══════════════════════════════════════════════════════════════

class MemoireStatusUpdateSerializerTest(TestCase):
    def test_valid_status(self):
        s = MemoireStatusUpdateSerializer(data={"status": "depot_en_ligne"})
        self.assertTrue(s.is_valid(), s.errors)

    def test_rejete_requires_reason(self):
        s = MemoireStatusUpdateSerializer(data={"status": "rejete"})
        self.assertFalse(s.is_valid())
        self.assertIn("rejection_reason", s.errors)

    def test_rejete_with_reason_valid(self):
        s = MemoireStatusUpdateSerializer(data={"status": "rejete", "rejection_reason": "Documents manquants"})
        self.assertTrue(s.is_valid(), s.errors)

    def test_invalid_status(self):
        s = MemoireStatusUpdateSerializer(data={"status": "inexistant"})
        self.assertFalse(s.is_valid())


class MemoireSearchSerializerTest(TestCase):
    def test_valid(self):
        s = MemoireSearchSerializer(data={"matricule": "MAT001"})
        self.assertTrue(s.is_valid())

    def test_missing_matricule(self):
        s = MemoireSearchSerializer(data={})
        self.assertFalse(s.is_valid())
        self.assertIn("matricule", s.errors)


class MemoireVerifySerializerTest(TestCase):
    def test_valid_conform(self):
        s = MemoireVerifySerializer(data={"documents_conform": True})
        self.assertTrue(s.is_valid())

    def test_valid_non_conform(self):
        s = MemoireVerifySerializer(data={"documents_conform": False})
        self.assertTrue(s.is_valid())

    def test_missing_field(self):
        s = MemoireVerifySerializer(data={})
        self.assertFalse(s.is_valid())


# ═══════════════════════════════════════════════════════════════
# ─── TESTS DES VUES ───────────────────────────────────────────
# ═══════════════════════════════════════════════════════════════

class MemoireListCreateViewTest(APITestCase):
    def setUp(self):
        self.url = reverse("memoire_list_create")
        self.student = make_student(username="depot_stu")
        self.staff = make_staff(username="depot_staff")
        self.memoire = make_memoire(self.student)

    def test_student_sees_own_memoires(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {jwt(self.student)}")
        r = self.client.get(self.url)
        self.assertEqual(r.status_code, status.HTTP_200_OK)

    def test_staff_sees_all_memoires(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {jwt(self.staff)}")
        r = self.client.get(self.url)
        self.assertEqual(r.status_code, status.HTTP_200_OK)

    def test_unauthenticated_blocked(self):
        r = self.client.get(self.url)
        self.assertEqual(r.status_code, status.HTTP_401_UNAUTHORIZED)


class MemoireDetailViewTest(APITestCase):
    def setUp(self):
        self.student = make_student(username="det_stu")
        self.other = make_student(username="other_stu", email="other@test.cm")
        self.staff = make_staff(username="det_staff")
        self.memoire = make_memoire(self.student)
        self.url = reverse("memoire_detail", kwargs={"pk": self.memoire.id})

    def test_owner_can_retrieve(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {jwt(self.student)}")
        r = self.client.get(self.url)
        self.assertEqual(r.status_code, status.HTTP_200_OK)

    def test_other_student_blocked(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {jwt(self.other)}")
        r = self.client.get(self.url)
        self.assertEqual(r.status_code, status.HTTP_404_NOT_FOUND)

    def test_staff_can_retrieve(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {jwt(self.staff)}")
        r = self.client.get(self.url)
        self.assertEqual(r.status_code, status.HTTP_200_OK)


class MemoireStatsViewTest(APITestCase):
    def setUp(self):
        self.url = reverse("memoire_stats")
        self.staff = make_staff(username="stats_staff")
        self.student = make_student(username="stats_stu")

    def test_staff_gets_stats(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {jwt(self.staff)}")
        r = self.client.get(self.url)
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertIn("total", r.data)

    def test_student_blocked(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {jwt(self.student)}")
        r = self.client.get(self.url)
        self.assertEqual(r.status_code, status.HTTP_403_FORBIDDEN)


class MemoireStatusUpdateViewTest(APITestCase):
    def setUp(self):
        self.student = make_student(username="status_stu")
        self.staff = make_staff(username="status_staff")
        self.memoire = make_memoire(self.student, status_val="depot_en_ligne")
        self.url = reverse("memoire_status_update", kwargs={"pk": self.memoire.id})

    def test_staff_can_update_status(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {jwt(self.staff)}")
        r = self.client.patch(
            self.url,
            {"status": "convocation_envoyee"},
            format="json"
        )
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.memoire.refresh_from_db()
        self.assertEqual(self.memoire.status, "convocation_envoyee")

    def test_invalid_transition_rejected(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {jwt(self.staff)}")
        r = self.client.patch(self.url, {"status": "quitus_retire"}, format="json")
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_rejete_requires_reason(self):
        # depot_en_ligne → rejete n'est pas une transition directe, testons avec convocation_envoyee
        self.memoire.status = "en_attente_verification"
        self.memoire.save()
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {jwt(self.staff)}")
        r = self.client.patch(self.url, {"status": "rejete"}, format="json")
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_student_cannot_update_status(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {jwt(self.student)}")
        r = self.client.patch(self.url, {"status": "convocation_envoyee"}, format="json")
        self.assertEqual(r.status_code, status.HTTP_403_FORBIDDEN)


class MemoireSearchViewTest(APITestCase):
    def setUp(self):
        self.url = reverse("memoire_search")
        self.student = make_student(username="search_stu", email="search@test.cm")
        self.staff = make_staff(username="search_staff")
        self.memoire = make_memoire(self.student)

    def test_staff_can_search_by_matricule(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {jwt(self.staff)}")
        r = self.client.get(self.url, {"matricule": "search_stu"})
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertTrue(r.data["success"])

    def test_not_found_matricule(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {jwt(self.staff)}")
        r = self.client.get(self.url, {"matricule": "XXXXXXX"})
        self.assertEqual(r.status_code, status.HTTP_404_NOT_FOUND)

    def test_student_cannot_search(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {jwt(self.student)}")
        r = self.client.get(self.url, {"matricule": "search_stu"})
        self.assertEqual(r.status_code, status.HTTP_403_FORBIDDEN)

    def test_missing_matricule_param(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {jwt(self.staff)}")
        r = self.client.get(self.url)
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)


class MemoireFileUploadViewTest(APITestCase):
    def setUp(self):
        self.student = make_student(username="upload_stu")
        self.other = make_student(username="other_upload", email="ou@test.cm")
        self.memoire = make_memoire(self.student)
        self.url = reverse("memoire_file_upload", kwargs={"pk": self.memoire.id})

    def test_owner_can_upload(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {jwt(self.student)}")
        r = self.client.post(self.url, {"pdf_file": make_pdf()}, format="multipart")
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertTrue(r.data["success"])

    def test_other_user_blocked(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {jwt(self.other)}")
        r = self.client.post(self.url, {"pdf_file": make_pdf()}, format="multipart")
        self.assertEqual(r.status_code, status.HTTP_403_FORBIDDEN)


class PublicArchivesListViewTest(APITestCase):
    def setUp(self):
        self.url = reverse("public_archives_list")

    def test_public_access(self):
        r = self.client.get(self.url)
        self.assertIn(r.status_code, [status.HTTP_200_OK, status.HTTP_404_NOT_FOUND])


# ═══════════════════════════════════════════════════════════════
# ─── TESTS D'INTÉGRATION ─────────────────────────────────────
# ═══════════════════════════════════════════════════════════════

class MemoiresIntegrationTest(APITestCase):
    """Flux complet : dépôt → changements de statut → stats."""

    def setUp(self):
        self.student = make_student(username="int_stu", email="int_stu@test.cm")
        self.staff = make_staff(username="int_staff")

    def test_full_workflow_brouillon_to_convocation(self):
        # Créer un mémoire via DB directement (bulk create bypasse clean)
        m = make_memoire(self.student, status_val="depot_en_ligne")
        status_url = reverse("memoire_status_update", kwargs={"pk": m.id})

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {jwt(self.staff)}")
        r = self.client.patch(status_url, {"status": "convocation_envoyee"}, format="json")
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        m.refresh_from_db()
        self.assertEqual(m.status, "convocation_envoyee")

    def test_stats_reflect_memoires(self):
        make_memoire(self.student, status_val="depot_en_ligne")
        make_memoire(make_student(username="s2", email="s2@t.cm"), status_val="verification_ok")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {jwt(self.staff)}")
        r = self.client.get(reverse("memoire_stats"))
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(r.data["total"], 2)

    def test_search_returns_correct_depot(self):
        make_memoire(self.student)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {jwt(self.staff)}")
        r = self.client.get(reverse("memoire_search"), {"matricule": "int_stu"})
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertEqual(len(r.data["depots"]), 1)