from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from .models import Article, ContactMessage


class SiteContentModuleTests(APITestCase):
    """Suite de tests exhaustive pour le module site_content."""

    def setUp(self):
        # Création d'un article de test
        self.article = Article.objects.create(
            title="Ouverture exceptionnelle de la BU",
            content="La bibliothèque sera ouverte ce samedi.",
            is_event=True
        )

        # URLs
        self.articles_url = reverse("article_list")
        self.contact_url = reverse("contact_create")

    def test_list_articles_success(self):
        """Vérifie que la liste des actualités est accessible publiquement."""
        response = self.client.get(self.articles_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        items = response.data.get("results", response.data) if isinstance(response.data, dict) else response.data
        self.assertTrue(len(items) >= 1)
        self.assertEqual(items[0]["title"], "Ouverture exceptionnelle de la BU")

    def test_article_detail_success(self):
        """Vérifie l'affichage du détail d'un article spécifique."""
        detail_url = reverse("article_detail", kwargs={"pk": self.article.pk})
        response = self.client.get(detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["content"], "La bibliothèque sera ouverte ce samedi.")

    def test_create_contact_message_success(self):
        """Vérifie qu'un visiteur peut envoyer un message de contact avec succès."""
        payload = {
            "name": "Alice Martin",
            "email": "alice@example.com",
            "subject": "Question sur les horaires",
            "message": "Bonjour, êtes-vous ouverts les jours fériés ?"
        }
        response = self.client.post(self.contact_url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["subject"], "Question sur les horaires")
        self.assertEqual(ContactMessage.objects.filter(email="alice@example.com").count(), 1)