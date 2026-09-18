# apps/accounts/permissions.py - AJOUT DU RÔLE AIDE_BIBLIO

from rest_framework import permissions
from apps.accounts.models import PortalUser


class IsStaffMember(permissions.BasePermission):
    """Accès réservé au personnel (BIBLIO, AIDE_BIBLIO & ADMIN)."""
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            request.user.is_staff_member
        )


class IsAdminOrStaff(permissions.BasePermission):
    """Accès réservé aux administrateurs, bibliothécaires et aides-bibliothécaires."""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role in [
            PortalUser.Role.ADMIN, 
            PortalUser.Role.BIBLIO,
            PortalUser.Role.AIDE_BIBLIO
        ]


class IsAdminUser(permissions.BasePermission):
    """Accès réservé aux administrateurs uniquement."""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role == PortalUser.Role.ADMIN or request.user.is_superuser


class IsAdminOrBiblio(permissions.BasePermission):
    """Accès réservé aux administrateurs et bibliothécaires (pas aux aides)."""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role in [PortalUser.Role.ADMIN, PortalUser.Role.BIBLIO]


class IsAideBiblio(permissions.BasePermission):
    """Accès réservé aux aides-bibliothécaires uniquement."""
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            request.user.role == PortalUser.Role.AIDE_BIBLIO
        )


class IsStudentUser(permissions.BasePermission):
    """Accès réservé aux étudiants."""
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            request.user.role == PortalUser.Role.ETUDIANT
        )


class IsTeacherUser(permissions.BasePermission):
    """Accès réservé aux enseignants."""
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            request.user.role == PortalUser.Role.ENSEIGNANT
        )