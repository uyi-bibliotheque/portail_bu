import io
import tempfile
from unittest.mock import patch
from pathlib import Path

from django.core.management import call_command
from django.test import override_settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from catalog.dto import NoticeDTO
from catalog.models import PhysicalArchiveRecord


class CatalogModuleTests(APITestCase):
    """Suite de tests exhaustive pour le module catalog."""

    def setUp(self):
        self.mock_notice = NoticeDTO(
            id="142",
            title="Introduction à la Science Informatique",
            authors=["Auteur PMB"],
            publisher="Éditions PMB",
            publication_year=2026,
            isbn="",
            summary="Introduction générale à l'informatique.",
            categories=["Informatique"],
            doc_type="Livre",
            availability_status="Disponible",
            location="Bibliothèque Centrale"
        )

    @patch("pmb_gateway.services.notice_service.PMBNoticeService.get_notice_by_id")
    def test_get_notice_success(self, mock_get_notice):
        """Vérifie qu'une notice existante est correctement retournée en JSON."""
        mock_get_notice.return_value = self.mock_notice
        
        url = reverse("notice_detail", kwargs={"notice_id": "142"})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["notice"]["id"], "142")
        self.assertEqual(response.data["notice"]["title"], "Introduction à la Science Informatique")
        self.assertEqual(response.data["notice"]["availability_status"], "Disponible")

    @patch("pmb_gateway.services.notice_service.PMBNoticeService.get_notice_by_id")
    def test_get_notice_not_found(self, mock_get_notice):
        """Vérifie le comportement si la notice demandée n'existe pas (404)."""
        mock_get_notice.return_value = None
        
        url = reverse("notice_detail", kwargs={"notice_id": "99999"})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    @patch("pmb_gateway.services.notice_service.PMBNoticeService.search_notices")
    def test_search_notices_success(self, mock_search):
        """Vérifie la recherche par mots-clés avec des résultats valides."""
        mock_search.return_value = [self.mock_notice]

        url = reverse("catalog_search")
        response = self.client.get(url, {"q": "Informatique"})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(len(response.data["results"]), 1)
        self.assertEqual(response.data["results"][0]["id"], "142")

    @patch("pmb_gateway.services.notice_service.PMBNoticeService.search_notices")
    def test_search_notices_empty_query(self, mock_search):
        """Vérifie le comportement si aucun paramètre 'q' n'est fourni (cas limite)."""
        mock_search.return_value = []

        url = reverse("catalog_search")
        response = self.client.get(url)

        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_400_BAD_REQUEST])

    @patch("pmb_gateway.services.notice_service.PMBNoticeService.search_notices")
    def test_search_notices_gateway_failure(self, mock_search):
        """Vérifie la gestion d'erreur critique de la passerelle."""
        mock_search.side_effect = Exception("Erreur critique PMB")

        url = reverse("catalog_search")
        response = self.client.get(url, {"q": "test"})
        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)


class PhysicalArchiveTests(APITestCase):
    def test_search_matches_title_author_keywords_and_location_fields(self):
        PhysicalArchiveRecord.objects.create(
            source_file='test.xlsx',
            source_sheet='Feuil1',
            source_row=5,
            document_type='Mémoire',
            title='Étude sur le développement durable',
            author='KAMENI, Alice',
            publication_info='Université de Yaoundé I: Faculté des sciences, 1997',
            keywords='Gestion forestière; conservation',
            copy_number='D.42001',
            shelfmark='333.7/F2/K1',
        )
        PhysicalArchiveRecord.objects.create(
            source_file='test.xlsx',
            source_sheet='Feuil1',
            source_row=6,
            document_type='Thèse',
            title='Agriculture tropicale',
            author='TAMBA, Paul',
            keywords='Cultures et sols',
            copy_number='D.42002',
            shelfmark='630/A3/T2',
            is_active=False,
        )

        response = self.client.get(
            reverse('physical_archive_search'),
            {'q': 'developpement conservation'},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        result = response.data['results'][0]
        self.assertEqual(result['title'], 'Étude sur le développement durable')
        self.assertEqual(result['author'], 'KAMENI, Alice')
        self.assertEqual(
            result['address'],
            'Université de Yaoundé I: Faculté des sciences, 1997',
        )
        self.assertEqual(result['copy_number'], 'D.42001')
        self.assertEqual(result['shelfmark'], '333.7/F2/K1')

        location_response = self.client.get(
            reverse('physical_archive_search'),
            {'q': 'd.42001'},
        )
        self.assertEqual(location_response.data['count'], 1)

    def test_search_requires_at_least_two_characters(self):
        response = self.client.get(reverse('physical_archive_search'), {'q': 'a'})

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_search_is_paginated(self):
        PhysicalArchiveRecord.objects.bulk_create([
            PhysicalArchiveRecord(
                source_file='test.xlsx',
                source_sheet='Feuil1',
                source_row=row,
                title=f'Étude de biologie {row}',
                search_text=f'etude de biologie {row}',
            )
            for row in range(5, 8)
        ])

        first_page = self.client.get(
            reverse('physical_archive_search'),
            {'q': 'biologie', 'page_size': 1},
        )
        second_page = self.client.get(
            reverse('physical_archive_search'),
            {'q': 'biologie', 'page_size': 1, 'page': 2},
        )

        self.assertEqual(first_page.data['count'], 3)
        self.assertEqual(len(first_page.data['results']), 1)
        self.assertIsNotNone(first_page.data['next'])
        self.assertEqual(len(second_page.data['results']), 1)
        self.assertNotEqual(
            first_page.data['results'][0]['id'],
            second_page.data['results'][0]['id'],
        )

    def test_import_command_updates_rows_and_deactivates_removed_source_rows(self):
        with tempfile.TemporaryDirectory() as documents_root:
            with override_settings(DOCUMENTS_ROOT=documents_root):
                csv_path = Path(documents_root) / 'notices.csv'
                csv_path.write_text(
                    'Choix du support du document;Titre propre;Auteur principal;Mots clés;'
                    'Nbre d exemplaire;Numéro des exemplaires;Cote\n'
                    'Mémoire;Titre initial;Auteur test;Mot-clé un;1;D.100;001/A1\n'
                    'Thèse;Titre supprimé;Autre auteur;Mot-clé deux;1;D.101;002/A2\n',
                    encoding='utf-8',
                )
                output = io.StringIO()
                call_command(
                    'import_physical_archives',
                    '--file',
                    str(csv_path),
                    stdout=output,
                )
                self.assertEqual(
                    PhysicalArchiveRecord.objects.filter(is_active=True).count(),
                    2,
                )

                csv_path.write_text(
                    'Choix du support du document;Titre propre;Auteur principal;Mots clés;'
                    'Nbre d exemplaire;Numéro des exemplaires;Cote\n'
                    'Mémoire;Titre corrigé;Auteur test;Mot-clé un;1;D.100;001/A1\n',
                    encoding='utf-8',
                )
                other_path = Path(documents_root) / 'autre_source.csv'
                other_path.write_text(
                    'Titre;Auteur;Mots clés;Cote\n'
                    'Notice d’une autre source;Autre auteur;Autre sujet;003/B1\n',
                    encoding='utf-8',
                )
                call_command(
                    'import_physical_archives',
                    '--file',
                    str(csv_path),
                    '--file',
                    str(other_path),
                    stdout=io.StringIO(),
                )

                active = PhysicalArchiveRecord.objects.filter(is_active=True)
                self.assertEqual(active.count(), 2)
                self.assertEqual(
                    active.get(source_file='notices.csv').title,
                    'Titre corrigé',
                )
                self.assertTrue(
                    active.filter(source_file='autre_source.csv').exists()
                )
                self.assertEqual(
                    PhysicalArchiveRecord.objects.filter(is_active=False).count(),
                    1,
                )

    def test_reimport_keeps_unchanged_source_rows_active(self):
        with tempfile.TemporaryDirectory() as documents_root:
            with override_settings(DOCUMENTS_ROOT=documents_root):
                csv_path = Path(documents_root) / 'notices.csv'
                csv_path.write_text(
                    'Titre;Auteur;Cote\n'
                    'Notice de test;Auteur test;001/A1\n',
                    encoding='utf-8',
                )
                call_command(
                    'import_physical_archives',
                    '--file',
                    str(csv_path),
                    stdout=io.StringIO(),
                )
                call_command(
                    'import_physical_archives',
                    '--file',
                    str(csv_path),
                    stdout=io.StringIO(),
                )

                self.assertEqual(
                    PhysicalArchiveRecord.objects.filter(
                        source_file='notices.csv',
                        is_active=True,
                    ).count(),
                    1,
                )
