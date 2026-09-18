"""Tests stats_dashboard - séparés dans leur propre fichier."""
import uuid
from unittest.mock import patch, mock_open
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.files.uploadedfile import SimpleUploadedFile

from apps.accounts.models import PortalUser
from apps.doc_manager.models import DigitalDocument


def make_admin(username="stats_admin", email="stats_admin@t.cm", password="p"):
    return PortalUser.objects.create_superuser(username=username, email=email, password=password)

def make_user(username="stats_user", email="stats_user@t.cm", password="p"):
    return PortalUser.objects.create_user(
        username=username, email=email, password=password,
        role=PortalUser.Role.ETUDIANT, auth_source=PortalUser.AuthSource.LOCAL,
    )

def jwt(user):
    return str(RefreshToken.for_user(user).access_token)

def make_doc(title="D", downloads=0):
    f = SimpleUploadedFile("t.pdf", b"%PDF", content_type="application/pdf")
    return DigitalDocument.objects.create(title=title, file=f, download_count=downloads)


class DashboardStatsViewTest(APITestCase):
    def setUp(self):
        self.url = "/api/dashboard/stats/"
        self.admin = make_admin()
        self.user = make_user()

    def test_admin_gets_stats(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {jwt(self.admin)}")
        r = self.client.get(self.url)
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertIn("users_count", r.data)
        self.assertIn("documents_count", r.data)
        self.assertIn("memoires", r.data)

    def test_non_admin_blocked(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {jwt(self.user)}")
        r = self.client.get(self.url)
        self.assertEqual(r.status_code, status.HTTP_403_FORBIDDEN)

    def test_unauthenticated_blocked(self):
        r = self.client.get(self.url)
        self.assertEqual(r.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_documents_count_accurate(self):
        make_doc("D1"); make_doc("D2")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {jwt(self.admin)}")
        r = self.client.get(self.url)
        self.assertGreaterEqual(r.data["documents_count"], 2)


class DashboardChartViewTest(APITestCase):
    def setUp(self):
        self.url = "/api/dashboard/chart/"
        self.admin = make_admin(username="chart_adm", email="chart_adm@t.cm")

    def test_default_period(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {jwt(self.admin)}")
        r = self.client.get(self.url)
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertIsInstance(r.data, list)

    def test_30days_period(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {jwt(self.admin)}")
        r = self.client.get(self.url, {"period": "30days"})
        self.assertEqual(r.status_code, status.HTTP_200_OK)

    def test_90days_period(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {jwt(self.admin)}")
        r = self.client.get(self.url, {"period": "90days"})
        self.assertEqual(r.status_code, status.HTTP_200_OK)

    def test_chart_item_has_month_key(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {jwt(self.admin)}")
        r = self.client.get(self.url)
        if r.data:
            self.assertIn("month", r.data[0])


class DashboardTopDocumentsViewTest(APITestCase):
    def setUp(self):
        self.url = "/api/dashboard/top-documents/"
        self.admin = make_admin(username="top_adm", email="top_adm@t.cm")
        make_doc("Top1", downloads=100)
        make_doc("Top2", downloads=50)
        make_doc("Top3", downloads=200)

    def test_returns_list(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {jwt(self.admin)}")
        r = self.client.get(self.url)
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertIsInstance(r.data, list)

    def test_ordered_by_downloads_desc(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {jwt(self.admin)}")
        r = self.client.get(self.url)
        if len(r.data) >= 2:
            self.assertGreaterEqual(r.data[0]["downloads"], r.data[1]["downloads"])

    def test_limit_param_respected(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {jwt(self.admin)}")
        r = self.client.get(self.url, {"limit": 2})
        self.assertLessEqual(len(r.data), 2)

    def test_result_structure(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {jwt(self.admin)}")
        r = self.client.get(self.url)
        if r.data:
            item = r.data[0]
            self.assertIn("id", item)
            self.assertIn("title", item)
            self.assertIn("downloads", item)


class DashboardActivityViewTest(APITestCase):
    def setUp(self):
        self.url = "/api/dashboard/activity/"
        self.admin = make_admin(username="act_adm", email="act_adm@t.cm")

    def test_returns_list(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {jwt(self.admin)}")
        r = self.client.get(self.url)
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertIsInstance(r.data, list)

    def test_limit_param(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {jwt(self.admin)}")
        r = self.client.get(self.url, {"limit": 3})
        self.assertLessEqual(len(r.data), 3)

    def test_activity_item_structure(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {jwt(self.admin)}")
        r = self.client.get(self.url)
        if r.data:
            item = r.data[0]
            self.assertIn("type", item)
            self.assertIn("title", item)
            self.assertIn("date", item)

    def test_non_admin_blocked(self):
        user = make_user(username="act_plain", email="act_plain@t.cm")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {jwt(user)}")
        r = self.client.get(self.url)
        self.assertEqual(r.status_code, status.HTTP_403_FORBIDDEN)


class StatsDashboardIntegrationTest(APITestCase):
    def setUp(self):
        self.admin = make_admin(username="int_sd_admin", email="int_sd@t.cm")
        make_doc("Int1", downloads=10)
        make_doc("Int2", downloads=20)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {jwt(self.admin)}")

    def test_full_dashboard_endpoints(self):
        # Stats globales
        r1 = self.client.get("/api/dashboard/stats/")
        self.assertEqual(r1.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(r1.data["documents_count"], 2)

        # Top documents
        r2 = self.client.get("/api/dashboard/top-documents/")
        self.assertEqual(r2.status_code, status.HTTP_200_OK)

        # Graphiques
        r3 = self.client.get("/api/dashboard/chart/", {"period": "30days"})
        self.assertEqual(r3.status_code, status.HTTP_200_OK)

        # Activité récente
        r4 = self.client.get("/api/dashboard/activity/")
        self.assertEqual(r4.status_code, status.HTTP_200_OK)