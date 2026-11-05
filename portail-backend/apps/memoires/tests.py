"""Tests unitaires et d'intégration - Application memoires."""
import io
import tempfile
import uuid
from pathlib import Path
from unittest.mock import patch, MagicMock
from django.test import TestCase
from django.urls import reverse
from django.core.exceptions import ValidationError
from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.management import call_command
from django.test.utils import override_settings
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from apps.accounts.models import PortalUser
from apps.memoires.models import DirectArchiveDocument, Memoire, DocumentSequence
from apps.memoires.archive_index import synchronize_direct_archives
from apps.memoires.pdf_metadata import extract_pdf_metadata
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


class DirectArchiveDocumentsTest(APITestCase):
    def setUp(self):
        self.temporary_directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary_directory.cleanup)
        self.settings_override = override_settings(DOCUMENTS_ROOT=self.temporary_directory.name)
        self.settings_override.enable()
        self.addCleanup(self.settings_override.disable)
        self.documents_root = Path(self.temporary_directory.name)
        (self.documents_root / "MEMOIRES").mkdir()
        (self.documents_root / "THESES").mkdir()
        self.document_path = self.documents_root / "MEMOIRES" / "FALSH" / "2023" / "document_test.PDF"
        self.document_path.parent.mkdir(parents=True)
        self.document_path.write_bytes(b"%PDF-1.4 test document")

    def test_public_list_indexes_documents_from_folders(self):
        with patch(
            'apps.memoires.archive_index.extract_pdf_metadata',
            side_effect=AssertionError('La requête publique ne doit pas lire les PDF.'),
        ):
            response = self.client.get(reverse("public_direct_archives_list"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["added"], 1)
        document = response.data["results"][0]
        self.assertEqual(document["type_document"], "MEMOIRE")
        self.assertEqual(document["archive_info"]["faculty"], "FALSH")
        self.assertEqual(document["archive_info"]["year"], 2023)
        self.assertEqual(document["title"], "document test")
        self.assertTrue(document["file_url"].endswith(f"{document['id']}/"))
        self.assertFalse(DirectArchiveDocument.objects.get().metadata_extracted)

    def test_sync_is_idempotent_and_indexes_new_files(self):
        self.assertEqual(synchronize_direct_archives(), 1)
        self.assertEqual(synchronize_direct_archives(), 0)

        new_document = self.documents_root / "THESES" / "FS" / "2022" / "new_thesis.pdf"
        new_document.parent.mkdir(parents=True)
        new_document.write_bytes(b"%PDF-1.4 new document")

        response = self.client.get(reverse("public_direct_archives_list"))

        self.assertEqual(response.data["count"], 2)
        self.assertEqual(response.data["added"], 1)
        self.assertTrue(
            DirectArchiveDocument.objects.filter(
                source_path="THESES/FS/2022/new_thesis.pdf",
                type_document="THESE",
            ).exists()
        )

    def test_sync_sanitizes_nul_characters_from_pdf_metadata(self):
        synchronize_direct_archives()
        archive = DirectArchiveDocument.objects.get()
        archive.metadata_extracted = False
        archive.save(update_fields=['metadata_extracted'])

        with patch('apps.memoires.pdf_metadata.PdfReader') as pdf_reader:
            pdf_reader.return_value.metadata = {
                '/Title': 'Titre\x00 mémoire',
                '/Author': 'Auteur\x00 test',
            }

            self.assertEqual(synchronize_direct_archives(), 0)

        archive = DirectArchiveDocument.objects.get()
        self.assertEqual(archive.title, 'Titre mémoire')
        self.assertEqual(archive.author_name, 'Auteur test')
        self.assertEqual(archive.author_full_name, 'Auteur test')

    def test_sync_uses_csv_metadata_without_reparsing_pdfs(self):
        csv_path = self.documents_root / 'archives.csv'
        csv_path.write_text(
            'source_path;title;author_name;author_full_name\n'
            'MEMOIRES/FALSH/2023/document_test.PDF;Titre complet extrait;Nom complet;Nom complet\n',
            encoding='utf-8',
        )
        output = io.StringIO()
        with patch(
            'apps.memoires.archive_index.extract_pdf_metadata',
            side_effect=AssertionError('Le CSV devrait fournir les métadonnées.'),
        ):
            call_command('sync_archive_metadata', '--csv', str(csv_path), stdout=output)
            response = self.client.get(reverse('public_direct_archives_list'))

        archive = DirectArchiveDocument.objects.get()
        self.assertEqual(archive.title, 'Titre complet extrait')
        self.assertEqual(archive.author_full_name, 'Nom complet')
        self.assertTrue(archive.metadata_extracted)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['results'][0]['title'], 'Titre complet extrait')
        self.assertEqual(response.data['results'][0]['author_full_name'], 'Nom complet')

    def test_sync_rebuilds_titles_with_unquoted_commas_from_excel_csv(self):
        csv_path = self.documents_root / 'archives.csv'
        csv_path.write_text(
            'id_correspondance,source_path,type_document,faculty,year,title,author_name,'
            'author_full_name,title_source,author_source,file_size\n'
            'DOC_1,MEMOIRES/FALSH/2023/document_test.PDF,MEMOIRE,FALSH,2023,'
            'Titre avant virgule, suite du titre,Nom complet,Nom complet,'
            'pdf_text,pdf_text_presented_by,1234\n',
            encoding='utf-8',
        )

        call_command('sync_archive_metadata', '--csv', str(csv_path), stdout=io.StringIO())

        archive = DirectArchiveDocument.objects.get()
        self.assertEqual(archive.title, 'Titre avant virgule, suite du titre')
        self.assertEqual(archive.author_name, 'Nom complet')
        self.assertEqual(archive.author_full_name, 'Nom complet')

    def test_sync_does_not_reparse_unchanged_archive_metadata(self):
        synchronize_direct_archives()

        with patch(
            'apps.memoires.archive_index.extract_pdf_metadata',
            side_effect=AssertionError('Les métadonnées inchangées doivent être réutilisées.'),
        ):
            self.assertEqual(synchronize_direct_archives(), 0)

    def test_pdf_metadata_extracts_full_author_and_title_from_cover_text(self):
        page = MagicMock()
        page.extract_text.return_value = (
            'Thème : L’INCLUSION SCOLAIRE DES ENFANTS EN SITUATION DE HANDICAP\n'
            'Présenté par :\n'
            'KAMENI YAMDJEU SIDO Armand\n'
            'Licencié en Psychologie\n'
            'Sous la direction de Pr. Exemple'
        )
        with patch('apps.memoires.pdf_metadata.PdfReader') as pdf_reader:
            pdf_reader.return_value.metadata = {}
            pdf_reader.return_value.pages = [page]

            metadata = extract_pdf_metadata(self.document_path)

        self.assertEqual(
            metadata['title'],
            'L’INCLUSION SCOLAIRE DES ENFANTS EN SITUATION DE HANDICAP',
        )
        self.assertEqual(metadata['author_name'], 'KAMENI YAMDJEU SIDO Armand')
        self.assertEqual(metadata['author_full_name'], 'KAMENI YAMDJEU SIDO Armand')
        self.assertEqual(metadata['title_source'], 'pdf_text')
        self.assertEqual(metadata['author_source'], 'pdf_text_presented_by')

    def test_pdf_metadata_keeps_single_word_final_title_line(self):
        page = MagicMock()
        page.extract_text.return_value = (
            'THE QUEST FOR DURABLE SOLUTIONS TO THE\n'
            'PLIGHT OF REFUGEES IN CAMEROON, 1972-2019:\n'
            'THE NEED FOR COMPREHENSIVE POLICIES AND\n'
            'REFORMS'
        )
        with patch('apps.memoires.pdf_metadata.PdfReader') as pdf_reader:
            pdf_reader.return_value.metadata = {}
            pdf_reader.return_value.pages = [page]

            metadata = extract_pdf_metadata(self.document_path)

        self.assertEqual(
            metadata['title'],
            'THE QUEST FOR DURABLE SOLUTIONS TO THE PLIGHT OF REFUGEES IN CAMEROON, 1972-2019: THE NEED FOR COMPREHENSIVE POLICIES AND REFORMS',
        )

    def test_pdf_metadata_extracts_sentence_case_title_after_cover_year(self):
        page = MagicMock()
        page.extract_text.return_value = (
            'Mémoire présenté en vue de l’obtention du diplôme\n'
            'Présenté par\n'
            'Viviane Edmonde ABESSOLO\n'
            '2022-2023\n'
            'THE UNIVERSITY OF YAOUNDE I\n'
            'DEPARTMENT OF SOCIOLOGY\n'
            'Rénovation viaire et contestation sociale à Yaoundé :\n'
            'comprendre les rapports sociaux d’acteurs autour du\n'
            'projet d’aménagement de la route de Mimboman III-\n'
            'Nkolo'
        )
        with patch('apps.memoires.pdf_metadata.PdfReader') as pdf_reader:
            pdf_reader.return_value.metadata = {}
            pdf_reader.return_value.pages = [page]

            metadata = extract_pdf_metadata(self.document_path)

        self.assertEqual(
            metadata['title'],
            'Rénovation viaire et contestation sociale à Yaoundé : comprendre les rapports sociaux d’acteurs autour du projet d’aménagement de la route de Mimboman III-Nkolo',
        )
        self.assertEqual(metadata['author_name'], 'Viviane Edmonde ABESSOLO')

    def test_pdf_metadata_ignores_jury_names_after_a_par_label(self):
        page = MagicMock()
        page.extract_text.return_value = (
            'Mémoire présenté en vue de l’obtention du diplôme\n'
            'Par\n'
            'Président de Jury : Vérissaint MBAIHOYAL AMBANG Zachéé (Pr)\n'
            'Titulaire d’une licence en planification scolaire'
        )
        with patch('apps.memoires.pdf_metadata.PdfReader') as pdf_reader:
            pdf_reader.return_value.metadata = {}
            pdf_reader.return_value.pages = [page]

            metadata = extract_pdf_metadata(self.document_path)

        self.assertEqual(metadata['author_name'], '')

    def test_pdf_metadata_skips_multilingual_cover_headings_before_title(self):
        page = MagicMock()
        page.extract_text.return_value = (
            'Juillet 2022\n'
            'UNIVERSITE DE YAOUNDE I\n'
            'CENTRE DE RECHERCHE ET DE\n'
            'FORMATION DOCTORALE EN\n'
            'SCIENCES HUMAINES, SOCIALES ET\n'
            'EDUCATIVES\n'
            'UNITE DE RECHERCHE ET DE\n'
            'FORMATION EN SCIENCES DE\n'
            'L’EDUCATION ET DE L’INGENIERIE\n'
            'EDUCATIVE\n'
            'POST GRATUATE SCHOOL FOR\n'
            'SOCIAL AND EDUCATIONAL\n'
            'SCIENCES\n'
            'RESEARCH AND DOCTORAL\n'
            'TRAINING UNIT FOR SCIENCE OF\n'
            'EDUCATION AND EDUCATIONAL\n'
            'ENGINEERING\n'
            'ADDICTION AUX SUBSTANCES PSYCHOACTIVES (SPA)\n'
            'ET STRATÉGIES DE PRISE EN CHARGE CHEZ LES\n'
            'JEUNES DE 15-25ANS : Cas de la ville de Goré(Tchad)\n'
            'E F\n'
            'S'
        )
        with patch('apps.memoires.pdf_metadata.PdfReader') as pdf_reader:
            pdf_reader.return_value.metadata = {}
            pdf_reader.return_value.pages = [page]

            metadata = extract_pdf_metadata(self.document_path)

        self.assertEqual(
            metadata['title'],
            'ADDICTION AUX SUBSTANCES PSYCHOACTIVES (SPA) ET STRATÉGIES DE PRISE EN CHARGE CHEZ LES JEUNES DE 15-25ANS : Cas de la ville de Goré(Tchad)',
        )
        self.assertEqual(metadata['author_name'], '')

    def test_pdf_metadata_keeps_historical_year_range_in_complete_title(self):
        page = MagicMock()
        page.extract_text.return_value = (
            'JANUARY 2023\n'
            'UNIVERSITY OF YAOUNDE 1\n'
            'FACULTY OF ARTS, LETTERS AND SOCIAL SCIENCES\n'
            'THE MAMFOR AND WOMEN IN THE DEVELOPMENT OF THE\n'
            'BAFUT FONDOM: 1907-2007\n'
            'UNIVERSITE DE YAOUNDE 1'
        )
        with patch('apps.memoires.pdf_metadata.PdfReader') as pdf_reader:
            pdf_reader.return_value.metadata = {}
            pdf_reader.return_value.pages = [page]

            metadata = extract_pdf_metadata(self.document_path)

        self.assertEqual(
            metadata['title'],
            'THE MAMFOR AND WOMEN IN THE DEVELOPMENT OF THE BAFUT FONDOM: 1907-2007',
        )

    def test_pdf_metadata_preserves_full_author_without_degree_or_affiliation(self):
        examples = (
            (
                'Par\nM. OLOUMOU Prodige Audrey\nMatricule : 16J553\n'
                'Licencié en Philosophie',
                'M. OLOUMOU Prodige Audrey',
            ),
            (
                'By: Eric Tala Tebue Department of Physics, Faculty of Science',
                'Eric Tala Tebue',
            ),
        )
        for text, expected_author in examples:
            with self.subTest(expected_author=expected_author):
                page = MagicMock()
                page.extract_text.return_value = text
                with patch('apps.memoires.pdf_metadata.PdfReader') as pdf_reader:
                    pdf_reader.return_value.metadata = {}
                    pdf_reader.return_value.pages = [page]

                    metadata = extract_pdf_metadata(self.document_path)

                self.assertEqual(metadata['author_full_name'], expected_author)

    def test_pdf_metadata_keeps_short_final_sentence_case_title_line(self):
        page = MagicMock()
        page.extract_text.return_value = (
            'Thesis presented and defended on the 24th of January 2023 for the Master’s Degree\n'
            'Specialisation: Curriculum Development and Evaluation\n'
            'The effects of continuous professional development on\n'
            'teachers’ effectiveness in public primary schools in\n'
            'Yaounde municipality'
        )
        with patch('apps.memoires.pdf_metadata.PdfReader') as pdf_reader:
            pdf_reader.return_value.metadata = {}
            pdf_reader.return_value.pages = [page]

            metadata = extract_pdf_metadata(self.document_path)

        self.assertEqual(
            metadata['title'],
            'The effects of continuous professional development on teachers’ effectiveness in public primary schools in Yaounde municipality',
        )

    def test_public_download_streams_pdf_and_supports_attachment(self):
        synchronize_direct_archives()
        archive = DirectArchiveDocument.objects.get()
        url = reverse("direct_archive_download", kwargs={"pk": archive.pk})

        inline_response = self.client.get(url)
        self.assertEqual(inline_response.status_code, status.HTTP_200_OK)
        self.assertEqual(inline_response["Content-Type"], "application/pdf")
        self.assertEqual(b"".join(inline_response.streaming_content), b"%PDF-1.4 test document")

        download_response = self.client.get(url, {"download": "1"})
        self.assertIn("attachment", download_response["Content-Disposition"])

    def test_download_rejects_database_paths_outside_document_folders(self):
        archive = DirectArchiveDocument.objects.create(
            source_path="MEMOIRES/../../private.pdf",
            document_name="private.pdf",
            title="private",
            type_document=DirectArchiveDocument.TypeDocument.MEMOIRE,
            file_size=1,
            modified_at=timezone.now(),
        )

        response = self.client.get(
            reverse("direct_archive_download", kwargs={"pk": archive.pk})
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_deleted_files_are_removed_from_public_listing(self):
        synchronize_direct_archives()
        self.document_path.unlink()

        response = self.client.get(reverse("public_direct_archives_list"))

        self.assertEqual(response.data["count"], 0)
        self.assertFalse(DirectArchiveDocument.objects.get().is_available)