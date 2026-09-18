from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from .models import SiteConfiguration

User = get_user_model()


class AdminConfigModuleTests(APITestCase):
    """Suite de tests pour le module admin_config."""

    def setUp(self):
        self.admin_user = User.objects.create_superuser(username="admin_conf", email="conf@portail.bu", password="Password123!")
        self.normal_user = User.objects.create_user(username="user_conf", email="user@portail.bu", password="Password123!")

        self.config_item = SiteConfiguration.objects.create(
            key="MAINTENANCE_MODE",
            value="False",
            description="Active ou désactive le mode maintenance."
        )

        self.list_url = reverse("config_list")

    def test_list_config_public(self):
        """Vérifie que la lecture de la configuration est accessible à tous."""
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        items = response.data.get("results", response.data) if isinstance(response.data, dict) else response.data
        keys = [item["key"] for item in items]
        self.assertIn("MAINTENANCE_MODE", keys)

    def test_update_config_forbidden_for_normal_user(self):
        """Vérifie qu'un utilisateur standard ne peut pas modifier la configuration (403)."""
        self.client.force_authenticate(user=self.normal_user)
        update_url = reverse("config_update", kwargs={"pk": self.config_item.pk})
        
        response = self.client.patch(update_url, {"value": "True"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_update_config_success_for_admin(self):
        """Vérifie qu'un administrateur peut modifier un paramètre de configuration."""
        self.client.force_authenticate(user=self.admin_user)
        update_url = reverse("config_update", kwargs={"pk": self.config_item.pk})
        
        response = self.client.patch(update_url, {"value": "True"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.config_item.refresh_from_db()
        self.assertEqual(self.config_item.value, "True")