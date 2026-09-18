"""Tests unitaires et d'intégration - Application loans_manager."""
import uuid
from unittest.mock import patch, MagicMock
from django.test import TestCase
from django.utils import timezone
from datetime import timedelta
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from apps.accounts.models import PortalUser
from apps.loans_manager.models import Reservation, Loan


# ── Helpers ───────────────────────────────────────────────────────────────────

def make_user(username="loan_user", email="loan@test.cm", password="pass1234"):
    return PortalUser.objects.create_user(
        username=username, email=email, password=password,
        role=PortalUser.Role.ETUDIANT, auth_source=PortalUser.AuthSource.LOCAL,
        pmb_lecteur_id="PMB_LEC_001",
    )

def jwt(user):
    return str(RefreshToken.for_user(user).access_token)


# ═══════════════════════════════════════════════════════════════
# ─── TESTS DU MODÈLE Reservation ─────────────────────────────
# ═══════════════════════════════════════════════════════════════

class ReservationModelTest(TestCase):
    def setUp(self):
        self.user = make_user()
        self.reservation = Reservation.objects.create(
            user=self.user, pmb_notice_id="RES_PMB001", status="En attente"
        )

    def test_uuid_primary_key(self):
        self.assertIsInstance(self.reservation.id, uuid.UUID)

    def test_str_repr(self):
        s = str(self.reservation)
        self.assertIn("RES_PMB001", s)
        self.assertIn(self.user.username, s)

    def test_default_status(self):
        r = Reservation.objects.create(user=self.user, pmb_notice_id="RES_DEFAULT")
        self.assertEqual(r.status, "En attente")

    def test_auto_created_at(self):
        self.assertIsNotNone(self.reservation.created_at)

    def test_ordering_latest_first(self):
        r2 = Reservation.objects.create(user=self.user, pmb_notice_id="RES_LATER")
        reservations = list(Reservation.objects.filter(user=self.user))
        self.assertEqual(reservations[0].id, r2.id)


# ═══════════════════════════════════════════════════════════════
# ─── TESTS DU MODÈLE Loan ────────────────────────────────────
# ═══════════════════════════════════════════════════════════════

class LoanModelTest(TestCase):
    def setUp(self):
        self.user = make_user()
        self.loan = Loan.objects.create(
            user=self.user,
            pmb_notice_id="LOAN_PMB001",
            title="Introduction à Python",
            author="Guido",
            loan_date=timezone.now(),
            due_date=timezone.now() + timedelta(days=14),
            status="En cours",
        )

    def test_uuid_primary_key(self):
        self.assertIsInstance(self.loan.id, uuid.UUID)

    def test_str_repr(self):
        s = str(self.loan)
        self.assertIn("LOAN_PMB001", s)

    def test_is_overdue_false_for_current_loan(self):
        self.assertFalse(self.loan.is_overdue)

    def test_is_overdue_true_for_past_due(self):
        self.loan.due_date = timezone.now() - timedelta(days=1)
        self.loan.save()
        self.assertTrue(self.loan.is_overdue)

    def test_is_overdue_false_when_returned(self):
        self.loan.due_date = timezone.now() - timedelta(days=1)
        self.loan.returned_date = timezone.now()
        self.loan.save()
        self.assertFalse(self.loan.is_overdue)

    def test_default_status(self):
        loan = Loan.objects.create(user=self.user, pmb_notice_id="LOAN_DEF")
        self.assertEqual(loan.status, "En cours")

    def test_is_renewable_default_false(self):
        self.assertFalse(self.loan.is_renewable)

    def test_auto_created_at(self):
        self.assertIsNotNone(self.loan.created_at)


# ═══════════════════════════════════════════════════════════════
# ─── TESTS DES VUES ───────────────────────────────────────────
# ═══════════════════════════════════════════════════════════════

MOCK_LOANS = [{"pmb_notice_id": "PMB001", "title": "Test Book", "status": "En cours"}]
MOCK_RESERVATIONS = [{"pmb_notice_id": "PMB002", "status": "En attente"}]


class UserLoansViewTest(APITestCase):
    def setUp(self):
        self.url = "/api/loans/"
        self.user = make_user(username="loans_v_user")

    @patch("apps.loans_manager.views.PMBCirculationService")
    def test_authenticated_gets_loans(self, mock_svc_class):
        mock_svc = MagicMock()
        mock_svc.get_loans.return_value = MOCK_LOANS
        mock_svc_class.return_value = mock_svc

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {jwt(self.user)}")
        r = self.client.get(self.url)
        self.assertEqual(r.status_code, status.HTTP_200_OK)

    def test_unauthenticated_blocked(self):
        r = self.client.get(self.url)
        self.assertEqual(r.status_code, status.HTTP_401_UNAUTHORIZED)

    @patch("apps.loans_manager.views.PMBCirculationService")
    def test_pmb_error_returns_500(self, mock_svc_class):
        mock_svc = MagicMock()
        mock_svc.get_loans.side_effect = Exception("PMB unreachable")
        mock_svc_class.return_value = mock_svc

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {jwt(self.user)}")
        r = self.client.get(self.url)
        self.assertEqual(r.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)


class ReservationListCreateViewTest(APITestCase):
    def setUp(self):
        self.url = "/api/reservations/"
        self.user = make_user(username="res_v_user")

    @patch("apps.loans_manager.views.PMBCirculationService")
    def test_get_reservations(self, mock_svc_class):
        mock_svc = MagicMock()
        mock_svc.get_reservations.return_value = MOCK_RESERVATIONS
        mock_svc_class.return_value = mock_svc

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {jwt(self.user)}")
        r = self.client.get(self.url)
        self.assertEqual(r.status_code, status.HTTP_200_OK)

    @patch("apps.loans_manager.views.PMBCirculationService")
    def test_create_reservation_success(self, mock_svc_class):
        mock_svc = MagicMock()
        mock_svc.create_reservation.return_value = True
        mock_svc_class.return_value = mock_svc

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {jwt(self.user)}")
        r = self.client.post(self.url, {"notice_id": "PMB100"}, format="json")
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)

    @patch("apps.loans_manager.views.PMBCirculationService")
    def test_create_reservation_failure(self, mock_svc_class):
        mock_svc = MagicMock()
        mock_svc.create_reservation.return_value = False
        mock_svc_class.return_value = mock_svc

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {jwt(self.user)}")
        r = self.client.post(self.url, {"notice_id": "PMB100"}, format="json")
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_without_notice_id_rejected(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {jwt(self.user)}")
        with patch("apps.loans_manager.views.PMBCirculationService"):
            r = self.client.post(self.url, {}, format="json")
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_unauthenticated_blocked(self):
        r = self.client.get(self.url)
        self.assertEqual(r.status_code, status.HTTP_401_UNAUTHORIZED)


class RenewLoanViewTest(APITestCase):
    def setUp(self):
        self.url = "/api/loans/renew/"
        self.user = make_user(username="renew_user")

    @patch("apps.loans_manager.views.PMBCirculationService")
    def test_renew_success(self, mock_svc_class):
        mock_svc = MagicMock()
        mock_svc.renew_loan.return_value = True
        mock_svc_class.return_value = mock_svc

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {jwt(self.user)}")
        r = self.client.post(self.url, {"expl_cb": "BC001"}, format="json")
        self.assertEqual(r.status_code, status.HTTP_200_OK)

    @patch("apps.loans_manager.views.PMBCirculationService")
    def test_renew_failure(self, mock_svc_class):
        mock_svc = MagicMock()
        mock_svc.renew_loan.return_value = False
        mock_svc_class.return_value = mock_svc

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {jwt(self.user)}")
        r = self.client.post(self.url, {"expl_cb": "BC001"}, format="json")
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_missing_expl_cb(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {jwt(self.user)}")
        with patch("apps.loans_manager.views.PMBCirculationService"):
            r = self.client.post(self.url, {}, format="json")
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)


# ═══════════════════════════════════════════════════════════════
# ─── TESTS D'INTÉGRATION ─────────────────────────────────────
# ═══════════════════════════════════════════════════════════════

class LoansIntegrationTest(APITestCase):
    """Intégration : prêts, réservations et renouvellement via mock PMB."""

    def setUp(self):
        self.user = make_user(username="int_loan_user")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {jwt(self.user)}")

    @patch("apps.loans_manager.views.PMBCirculationService")
    def test_loans_and_reservations_flow(self, mock_svc_class):
        mock_svc = MagicMock()
        mock_svc.get_loans.return_value = MOCK_LOANS
        mock_svc.get_reservations.return_value = MOCK_RESERVATIONS
        mock_svc.create_reservation.return_value = True
        mock_svc_class.return_value = mock_svc

        # Lister les prêts
        loans_r = self.client.get("/api/loans/")
        self.assertEqual(loans_r.status_code, status.HTTP_200_OK)

        # Lister les réservations
        res_r = self.client.get("/api/reservations/")
        self.assertEqual(res_r.status_code, status.HTTP_200_OK)

        # Créer une réservation
        create_r = self.client.post("/api/reservations/", {"notice_id": "PMB_INT"}, format="json")
        self.assertEqual(create_r.status_code, status.HTTP_201_CREATED)

    def test_loan_overdue_property(self):
        """Vérifie la propriété is_overdue directement sur le modèle."""
        loan = Loan.objects.create(
            user=self.user,
            pmb_notice_id="OVERDUE_TEST",
            due_date=timezone.now() - timedelta(days=5),
        )
        self.assertTrue(loan.is_overdue)