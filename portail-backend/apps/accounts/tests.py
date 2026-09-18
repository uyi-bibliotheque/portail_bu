"""Tests unitaires et d'intégration - Application accounts."""
import uuid
from unittest.mock import patch
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from apps.accounts.models import PortalUser
from apps.accounts.serializers import (
    LoginSerializer, StudentRegistrationSerializer, StaffUserCreateSerializer,
)
from apps.accounts.services import AuthenticationService


# ── Helpers ──────────────────────────────────────────────────────────────────

def make_student(username="etudiant01", email="etudiant01@test.cm", password="pass1234"):
    return PortalUser.objects.create_user(
        username=username, email=email, password=password,
        role=PortalUser.Role.ETUDIANT, auth_source=PortalUser.AuthSource.LOCAL,
    )

def make_admin(username="admin01", email="admin01@test.cm", password="admin1234"):
    return PortalUser.objects.create_superuser(username=username, email=email, password=password)

def make_biblio(username="biblio01", email="biblio01@test.cm", password="biblio1234"):
    return PortalUser.objects.create_user(
        username=username, email=email, password=password,
        role=PortalUser.Role.BIBLIO, auth_source=PortalUser.AuthSource.LOCAL, is_staff=True,
    )

def jwt(user):
    return str(RefreshToken.for_user(user).access_token)


# ── Tests Modèle ─────────────────────────────────────────────────────────────

class PortalUserModelTest(TestCase):
    def setUp(self):
        self.student = make_student()
        self.admin = make_admin()
        self.biblio = make_biblio()

    def test_student_role(self):
        self.assertEqual(self.student.role, PortalUser.Role.ETUDIANT)

    def test_admin_flags(self):
        self.assertTrue(self.admin.is_staff)
        self.assertTrue(self.admin.is_superuser)
        self.assertEqual(self.admin.role, PortalUser.Role.ADMIN)

    def test_uuid_primary_key(self):
        self.assertIsInstance(self.student.id, uuid.UUID)

    def test_str_repr(self):
        s = str(self.student)
        self.assertIn(self.student.username, s)

    def test_is_student_property(self):
        self.assertTrue(self.student.is_student)
        self.assertFalse(self.admin.is_student)

    def test_is_staff_member_property(self):
        self.assertTrue(self.admin.is_staff_member)
        self.assertTrue(self.biblio.is_staff_member)
        self.assertFalse(self.student.is_staff_member)

    def test_is_teacher_property(self):
        teacher = PortalUser.objects.create_user(
            username="prof01", email="prof01@test.cm", password="prof1234",
            role=PortalUser.Role.ENSEIGNANT,
        )
        self.assertTrue(teacher.is_teacher)

    def test_get_full_name(self):
        self.student.first_name = "Jean"
        self.student.last_name = "Dupont"
        self.student.save()
        self.assertEqual(self.student.get_full_name(), "Jean Dupont")

    def test_get_full_name_fallback(self):
        user = PortalUser.objects.create_user(username="orphan01", email="orphan01@test.cm", password="pass1234")
        self.assertEqual(user.get_full_name(), "orphan01")

    def test_sync_with_pmb_data(self):
        self.student.sync_with_pmb_data({'email': 'nouveau@pmb.cm', 'nom': 'Kamga', 'prenom': 'Paul'})
        self.student.refresh_from_db()
        self.assertEqual(self.student.email, 'nouveau@pmb.cm')
        self.assertIsNotNone(self.student.last_pmb_sync)

    def test_create_user_without_username_raises(self):
        with self.assertRaises(ValueError):
            PortalUser.objects.create_user(username="", password="x")

    def test_create_superuser_requires_is_staff(self):
        with self.assertRaises(ValueError):
            PortalUser.objects.create_superuser(username="bad1", password="x", is_staff=False)

    def test_create_superuser_requires_is_superuser(self):
        with self.assertRaises(ValueError):
            PortalUser.objects.create_superuser(username="bad2", password="x", is_superuser=False)


# ── Tests Serializers ─────────────────────────────────────────────────────────

class LoginSerializerTest(TestCase):
    def test_valid(self):
        s = LoginSerializer(data={"username": "mat001", "password": "secret"})
        self.assertTrue(s.is_valid())

    def test_missing_username(self):
        s = LoginSerializer(data={"password": "secret"})
        self.assertFalse(s.is_valid())
        self.assertIn("username", s.errors)

    def test_missing_password(self):
        s = LoginSerializer(data={"username": "mat001"})
        self.assertFalse(s.is_valid())
        self.assertIn("password", s.errors)


class StudentRegistrationSerializerTest(TestCase):
    def _payload(self, matricule="MAT2024001", email="test@univ-yde.cm"):
        return {
            "matricule": matricule, "email": email,
            "first_name": "Amine", "last_name": "Bello",
            "password": "secure123", "confirm_password": "secure123",
            "faculte": "FS", "departement": "Informatique", "niveau": "Master 2",
        }

    def test_valid_registration(self):
        s = StudentRegistrationSerializer(data=self._payload())
        self.assertTrue(s.is_valid(), s.errors)

    def test_passwords_mismatch(self):
        p = self._payload(); p["confirm_password"] = "wrong"
        s = StudentRegistrationSerializer(data=p)
        self.assertFalse(s.is_valid())
        self.assertIn("confirm_password", s.errors)

    def test_password_too_short(self):
        p = self._payload(); p["password"] = "123"; p["confirm_password"] = "123"
        s = StudentRegistrationSerializer(data=p)
        self.assertFalse(s.is_valid())

    def test_duplicate_matricule(self):
        make_student(username="MAT2024999")
        s = StudentRegistrationSerializer(data=self._payload(matricule="MAT2024999", email="u@t.cm"))
        self.assertFalse(s.is_valid())
        self.assertIn("matricule", s.errors)

    def test_duplicate_email(self):
        make_student(email="dup@test.cm")
        s = StudentRegistrationSerializer(data=self._payload(matricule="MATNEW001", email="dup@test.cm"))
        self.assertFalse(s.is_valid())
        self.assertIn("email", s.errors)

    def test_create_sets_preferences(self):
        s = StudentRegistrationSerializer(data=self._payload())
        self.assertTrue(s.is_valid())
        user = s.save()
        self.assertEqual(user.preferences.get("faculte"), "FS")

    def test_create_sets_etudiant_role(self):
        s = StudentRegistrationSerializer(data=self._payload())
        self.assertTrue(s.is_valid())
        self.assertEqual(s.save().role, PortalUser.Role.ETUDIANT)


class StaffUserCreateSerializerTest(TestCase):
    def test_valid_biblio(self):
        data = {
            "username": "biblio_new", "email": "bib_new@test.cm",
            "first_name": "M", "last_name": "F",
            "role": PortalUser.Role.BIBLIO,
            "password": "securepass", "confirm_password": "securepass",
        }
        self.assertTrue(StaffUserCreateSerializer(data=data).is_valid())

    def test_invalid_role(self):
        data = {
            "username": "student_bad", "email": "bad@test.cm",
            "role": PortalUser.Role.ETUDIANT,
            "password": "pass", "confirm_password": "pass",
        }
        s = StaffUserCreateSerializer(data=data)
        self.assertFalse(s.is_valid())
        self.assertIn("role", s.errors)

    def test_password_mismatch(self):
        data = {
            "username": "adm_x", "email": "adm_x@test.cm",
            "role": PortalUser.Role.ADMIN,
            "password": "pass123", "confirm_password": "different",
        }
        self.assertFalse(StaffUserCreateSerializer(data=data).is_valid())


# ── Tests Service d'authentification ─────────────────────────────────────────

class AuthenticationServiceTest(TestCase):
    def setUp(self):
        self.service = AuthenticationService.__new__(AuthenticationService)
        self.student = make_student(username="mat_svc", password="svcpass")

    def test_get_user_by_username(self):
        user = self.service.get_user_by_identifier("mat_svc")
        self.assertIsNotNone(user)
        self.assertEqual(user.username, "mat_svc")

    def test_get_user_by_email(self):
        user = self.service.get_user_by_identifier(self.student.email)
        self.assertIsNotNone(user)

    def test_get_user_nonexistent(self):
        self.assertIsNone(self.service.get_user_by_identifier("nobody@nowhere.cm"))

    def test_generate_jwt_response(self):
        result = self.service._generate_jwt_response(self.student)
        self.assertIn("access", result)
        self.assertIn("refresh", result)
        self.assertIn("user", result)


# ── Tests Vues ────────────────────────────────────────────────────────────────

class LoginViewTest(APITestCase):
    def setUp(self):
        self.url = reverse("auth_login")
        self.student = make_student(username="login_student", password="testpass")

    def _login(self, username, password):
        with patch("apps.accounts.services.PMBAuthService.verifier_identifiants_pmb", return_value=None):
            return self.client.post(self.url, {"username": username, "password": password}, format="json")

    def test_valid_local_login(self):
        r = self._login("login_student", "testpass")
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertIn("access", r.data)

    def test_invalid_credentials(self):
        r = self._login("login_student", "wrongpass")
        self.assertEqual(r.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_missing_fields(self):
        r = self.client.post(self.url, {}, format="json")
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_by_email(self):
        r = self._login(self.student.email, "testpass")
        self.assertEqual(r.status_code, status.HTTP_200_OK)


class UserProfileViewTest(APITestCase):
    def setUp(self):
        self.url = reverse("auth_me")
        self.student = make_student(username="profile_student")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {jwt(self.student)}")

    def test_authenticated_profile(self):
        r = self.client.get(self.url)
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertEqual(r.data["username"], "profile_student")

    def test_unauthenticated_profile(self):
        self.client.credentials()
        r = self.client.get(self.url)
        self.assertEqual(r.status_code, status.HTTP_401_UNAUTHORIZED)


class StudentRegistrationViewTest(APITestCase):
    def setUp(self):
        self.url = reverse("auth_register")

    def _payload(self, matricule="REG_MAT001", email="reg@test.cm"):
        return {
            "matricule": matricule, "email": email,
            "first_name": "Ines", "last_name": "Nguemo",
            "password": "pass1234", "confirm_password": "pass1234",
            "faculte": "FALSH", "departement": "Philo", "niveau": "Master 1",
        }

    def test_successful_registration(self):
        r = self.client.post(self.url, self._payload(), format="json")
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)
        self.assertTrue(r.data["success"])

    def test_duplicate_rejected(self):
        self.client.post(self.url, self._payload(), format="json")
        r = self.client.post(self.url, self._payload(), format="json")
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_logged_in_user_cannot_register(self):
        student = make_student(username="alr_student")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {jwt(student)}")
        r = self.client.post(self.url, self._payload(matricule="X01", email="x@x.cm"), format="json")
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)


class CheckAvailabilityViewTest(APITestCase):
    def setUp(self):
        self.url = reverse("auth_check_availability")
        self.existing = make_student(username="MAT_EXIST", email="exist@test.cm")

    def test_available_matricule(self):
        r = self.client.get(self.url, {"type": "matricule", "value": "MAT_FREE"})
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertTrue(r.data["available"])

    def test_taken_matricule(self):
        r = self.client.get(self.url, {"type": "matricule", "value": "MAT_EXIST"})
        self.assertFalse(r.data["available"])

    def test_available_email(self):
        r = self.client.get(self.url, {"type": "email", "value": "free@test.cm"})
        self.assertTrue(r.data["available"])

    def test_taken_email(self):
        r = self.client.get(self.url, {"type": "email", "value": "exist@test.cm"})
        self.assertFalse(r.data["available"])

    def test_missing_params(self):
        r = self.client.get(self.url)
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_invalid_type(self):
        r = self.client.get(self.url, {"type": "phone", "value": "123"})
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)


class AdminUserListCreateViewTest(APITestCase):
    def setUp(self):
        self.url = reverse("admin_users_list_create")
        self.admin = make_admin(username="superadmin")
        self.student = make_student(username="just_student")

    def test_admin_list_users(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {jwt(self.admin)}")
        r = self.client.get(self.url)
        self.assertEqual(r.status_code, status.HTTP_200_OK)

    def test_student_cannot_list(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {jwt(self.student)}")
        r = self.client.get(self.url)
        self.assertEqual(r.status_code, status.HTTP_403_FORBIDDEN)

    def test_unauthenticated_cannot_list(self):
        r = self.client.get(self.url)
        self.assertEqual(r.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_admin_create_user(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {jwt(self.admin)}")
        r = self.client.post(self.url, {
            "username": "new_student", "email": "new@test.cm",
            "password": "pass1234", "role": PortalUser.Role.ETUDIANT,
        }, format="json")
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)


class StaffOnlyViewTest(APITestCase):
    def setUp(self):
        self.url = reverse("staff_check")
        self.admin = make_admin(username="adm_staff")
        self.student = make_student(username="stu_staff")

    def test_admin_can_access(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {jwt(self.admin)}")
        self.assertEqual(self.client.get(self.url).status_code, status.HTTP_200_OK)

    def test_student_cannot_access(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {jwt(self.student)}")
        self.assertEqual(self.client.get(self.url).status_code, status.HTTP_403_FORBIDDEN)


# ── Tests d'intégration ───────────────────────────────────────────────────────

class AccountsIntegrationTest(APITestCase):
    """Flux complet : inscription → connexion → profil → gestion admin."""

    def test_register_login_profile_flow(self):
        # 1. Inscription
        reg_r = self.client.post(reverse("auth_register"), {
            "matricule": "INT_MAT001", "email": "integration@test.cm",
            "first_name": "Integ", "last_name": "Test",
            "password": "integ1234", "confirm_password": "integ1234",
            "faculte": "FS", "departement": "Info", "niveau": "Master 2",
        }, format="json")
        self.assertEqual(reg_r.status_code, status.HTTP_201_CREATED)

        # 2. Connexion
        with patch("apps.accounts.services.PMBAuthService.verifier_identifiants_pmb", return_value=None):
            login_r = self.client.post(reverse("auth_login"), {
                "username": "INT_MAT001", "password": "integ1234"
            }, format="json")
        self.assertEqual(login_r.status_code, status.HTTP_200_OK)

        # 3. Profil
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {login_r.data['access']}")
        profile_r = self.client.get(reverse("auth_me"))
        self.assertEqual(profile_r.status_code, status.HTTP_200_OK)
        self.assertEqual(profile_r.data["username"], "INT_MAT001")

    def test_admin_crud_flow(self):
        """Admin crée, lit puis supprime un utilisateur."""
        admin = make_admin(username="mgmt_admin")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {jwt(admin)}")

        create_r = self.client.post(reverse("admin_users_list_create"), {
            "username": "managed_user", "email": "managed@test.cm",
            "password": "mgd1234", "role": PortalUser.Role.ETUDIANT,
        }, format="json")
        self.assertEqual(create_r.status_code, status.HTTP_201_CREATED)
        user_id = create_r.data["id"]

        get_r = self.client.get(reverse("admin_users_detail", kwargs={"id": user_id}))
        self.assertEqual(get_r.status_code, status.HTTP_200_OK)

        del_r = self.client.delete(reverse("admin_users_detail", kwargs={"id": user_id}))
        self.assertEqual(del_r.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(PortalUser.objects.filter(username="managed_user").exists())




# ═══════════════════════════════════════════════════════════════════
# ─── TESTS MISE À JOUR PROFIL (SELF-SERVICE) ─────────────────────
# ═══════════════════════════════════════════════════════════════════

class ProfileUpdateViewTest(APITestCase):
    """Tests de la mise à jour du profil par l'utilisateur lui-même."""

    def setUp(self):
        self.url = reverse("auth_me")
        self.user = make_student(username="profil_user", email="profil@test.cm", password="pass1234")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {jwt(self.user)}")

    def test_patch_first_name(self):
        r = self.client.patch(self.url, {"first_name": "Nouveau"}, format="json")
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.first_name, "Nouveau")

    def test_patch_last_name(self):
        r = self.client.patch(self.url, {"last_name": "Nom"}, format="json")
        self.assertEqual(r.status_code, status.HTTP_200_OK)

    def test_patch_email(self):
        r = self.client.patch(self.url, {"email": "new@test.cm"}, format="json")
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.email, "new@test.cm")

    def test_patch_email_already_used(self):
        make_student(username="other_user", email="taken@test.cm")
        r = self.client.patch(self.url, {"email": "taken@test.cm"}, format="json")
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", r.data.get("errors", {}))

    def test_patch_preferences(self):
        prefs = {"theme": "dark", "langue": "fr"}
        r = self.client.patch(self.url, {"preferences": prefs}, format="json")
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.preferences, prefs)

    def test_patch_cannot_change_username(self):
        r = self.client.patch(self.url, {"username": "hacked"}, format="json")
        # Le username est en read-only → ignoré
        self.user.refresh_from_db()
        self.assertEqual(self.user.username, "profil_user")

    def test_patch_cannot_change_role(self):
        r = self.client.patch(self.url, {"role": "ADMIN"}, format="json")
        self.user.refresh_from_db()
        self.assertEqual(self.user.role, PortalUser.Role.ETUDIANT)

    def test_patch_unauthenticated(self):
        self.client.credentials()
        r = self.client.patch(self.url, {"first_name": "X"}, format="json")
        self.assertEqual(r.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_put_full_update(self):
        r = self.client.put(self.url, {
            "first_name": "Full", "last_name": "Update",
            "email": "full@test.cm",
            "preferences": {"x": 1}
        }, format="json")
        self.assertEqual(r.status_code, status.HTTP_200_OK)


class PasswordChangeViewTest(APITestCase):
    """Tests du changement de mot de passe."""

    def setUp(self):
        self.url = reverse("auth_change_password")
        self.user = make_student(username="pwd_user", password="OldPass123")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {jwt(self.user)}")

    def test_successful_change(self):
        r = self.client.post(self.url, {
            "old_password": "OldPass123",
            "new_password": "NewPass456",
            "confirm_password": "NewPass456",
        }, format="json")
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("NewPass456"))

    def test_wrong_old_password(self):
        r = self.client.post(self.url, {
            "old_password": "WrongOld",
            "new_password": "NewPass456",
            "confirm_password": "NewPass456",
        }, format="json")
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("old_password", r.data.get("errors", {}))

    def test_mismatched_confirmation(self):
        r = self.client.post(self.url, {
            "old_password": "OldPass123",
            "new_password": "NewPass456",
            "confirm_password": "Different",
        }, format="json")
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_same_password_rejected(self):
        r = self.client.post(self.url, {
            "old_password": "OldPass123",
            "new_password": "OldPass123",
            "confirm_password": "OldPass123",
        }, format="json")
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_unauthenticated(self):
        self.client.credentials()
        r = self.client.post(self.url, {
            "old_password": "OldPass123",
            "new_password": "NewPass456",
            "confirm_password": "NewPass456",
        }, format="json")
        self.assertEqual(r.status_code, status.HTTP_401_UNAUTHORIZED)


class PreferencesUpdateViewTest(APITestCase):
    """Tests de mise à jour des préférences."""

    def setUp(self):
        self.url = reverse("auth_preferences")
        self.user = make_student(username="pref_user")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {jwt(self.user)}")

    def test_update_preferences(self):
        prefs = {"theme": "light", "notifications": True}
        r = self.client.patch(self.url, {"preferences": prefs}, format="json")
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.preferences, prefs)

    def test_invalid_preferences_type(self):
        r = self.client.patch(self.url, {"preferences": "not a dict"}, format="json")
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_missing_preferences(self):
        r = self.client.patch(self.url, {}, format="json")
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_unauthenticated(self):
        self.client.credentials()
        r = self.client.patch(self.url, {"preferences": {}}, format="json")
        self.assertEqual(r.status_code, status.HTTP_401_UNAUTHORIZED)