from unittest.mock import patch
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from catalog.dto import NoticeDTO


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