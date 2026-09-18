# apps/memoires/views.py - VERSION COMPLÈTE ET PROPRE

import os
import mimetypes
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db import models
from django.db.models import Q
from django.contrib.auth import get_user_model
from django.http import FileResponse, Http404
from django.conf import settings
from urllib.parse import quote as url_quoter
from django.views.decorators.cache import cache_control
from django.utils.decorators import method_decorator
from .models import Memoire
from .serializers import (
    MemoireSerializer, 
    MemoireStatusUpdateSerializer,
    MemoireSearchSerializer,
    MemoireVerifySerializer,
    MemoireDepotSerializer
)
from .permissions import IsOwnerOrStaff, IsStaffOnly
from apps.notifications.services import EmailService
from datetime import timedelta
import logging

logger = logging.getLogger(__name__)
User = get_user_model()


# ═══════════════════════════════════════════════════════════════════
# ─── VUES PROTÉGÉES (AUTHENTIFICATION REQUISE) ──────────────────
# ═══════════════════════════════════════════════════════════════════

class MemoireListCreateView(generics.ListCreateAPIView):
    """Liste les dépôts et permet un nouveau dépôt."""
    serializer_class = MemoireSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Memoire.objects.all().order_by('-created_at')
        return Memoire.objects.filter(author=user).order_by('-created_at')

    def create(self, request, *args, **kwargs):
        logger.info("=" * 50)
        logger.info("CRÉATION D'UN DÉPÔT")
        logger.info(f"User: {request.user}")
        logger.info(f"Data: {request.data}")
        logger.info("=" * 50)
        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        try:
            memoire = serializer.save()
            memoire.transition_to('depot_en_ligne')
            self._send_confirmation_email(memoire)
            logger.info(f"Dépôt créé avec succès: {memoire.id}")
        except Exception as e:
            logger.error(f"Erreur création dépôt: {str(e)}")
            raise

    def _send_confirmation_email(self, memoire):
        try:
            type_doc = "Mémoire de Master" if memoire.type_document == Memoire.TypeDocument.MEMOIRE else "Thèse de Doctorat"
            
            context = {
                'user': memoire.author,
                'type_document': type_doc,
                'titre': memoire.title,
                'matricule': memoire.matricule,
                'filiere': memoire.filiere,
                'dossier_id': memoire.id,
                'date_limite': (timezone.now() + timedelta(days=7)).strftime('%d/%m/%Y'),
                'link': f'/mon-compte/depots/{memoire.id}',
                'year': timezone.now().year
            }
            
            EmailService.send_async_email(
                user=memoire.author,
                subject=f"Confirmation de dépôt - {memoire.id.hex[:8]}",
                template_name='emails/depot_confirmation.html',
                context=context,
                notification_title="📝 Dépôt de mémoire initié"
            )
            
            memoire.transition_to('convocation_envoyee')
            
        except Exception as e:
            logger.error(f"Erreur envoi email confirmation: {str(e)}")


class MemoireDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Permet de voir, modifier ou supprimer un dépôt spécifique."""
    queryset = Memoire.objects.all()
    serializer_class = MemoireSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrStaff]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Memoire.objects.all()
        return Memoire.objects.filter(author=user)


class MemoireFileUploadView(APIView):
    """Upload des fichiers PDF et Word"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        memoire = get_object_or_404(Memoire, pk=pk)
        
        if not request.user.is_staff and request.user != memoire.author:
            return Response({
                'error': 'Vous n\'avez pas la permission de modifier ce mémoire'
            }, status=status.HTTP_403_FORBIDDEN)
        
        pdf_file = request.FILES.get('pdf_file')
        word_file = request.FILES.get('word_file')
        
        if pdf_file:
            memoire.pdf_file = pdf_file
        if word_file:
            memoire.word_file = word_file
        
        memoire.save()
        
        return Response({
            'success': True,
            'pdf_uploaded': bool(pdf_file),
            'word_uploaded': bool(word_file),
            'message': 'Fichiers téléchargés avec succès'
        })


class MemoireSearchView(APIView):
    """Recherche de dépôt par matricule (pour le staff)"""
    permission_classes = [permissions.IsAuthenticated, IsStaffOnly]

    def get(self, request):
        serializer = MemoireSearchSerializer(data=request.query_params)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        matricule = serializer.validated_data['matricule']
        
        user = User.objects.filter(username=matricule).first()
        if not user:
            return Response({
                'success': False,
                'detail': 'Aucun étudiant trouvé avec ce matricule'
            }, status=status.HTTP_404_NOT_FOUND)
        
        depots = Memoire.objects.filter(author=user).order_by('-created_at')
        
        return Response({
            'success': True,
            'user': {
                'username': user.username,
                'full_name': user.get_full_name(),
                'email': user.email,
                'role': user.role
            },
            'depots': MemoireSerializer(depots, many=True).data
        })


class MemoireVerifyView(APIView):
    """Vérification physique des documents (pour le staff)"""
    permission_classes = [permissions.IsAuthenticated, IsStaffOnly]

    def post(self, request, pk):
        memoire = get_object_or_404(Memoire, pk=pk)
        serializer = MemoireVerifySerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        if memoire.status not in ['convocation_envoyee', 'relance_envoyee', 'en_attente_verification']:
            return Response({
                'error': f'Le dépôt n\'est pas en attente de vérification (statut actuel: {memoire.status})'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        memoire.documents_conform = serializer.validated_data['documents_conform']
        memoire.librarian_notes = serializer.validated_data.get('librarian_notes', '')
        memoire.physical_deposit_confirmed = True
        
        if memoire.documents_conform:
            memoire.transition_to('verification_ok')
            
            # ─── ARCHIVER LE DOCUMENT AUTOMATIQUEMENT ──────────────────
            from .document_service import DocumentArchiveService
            
            archive_result = None
            try:
                archive_result = DocumentArchiveService.archive_document(memoire)
                if archive_result and archive_result.get('success'):
                    memoire.is_archived = True
                    logger.info(f"✅ Document archivé: {archive_result['document_name']}")
                    self._notify_archive_success(memoire, archive_result)
                else:
                    error_msg = archive_result.get('error', 'Erreur inconnue') if archive_result else 'Échec de l\'archivage'
                    logger.warning(f"⚠️ Échec de l'archivage: {error_msg}")
                    memoire.is_archived = False
            except Exception as e:
                logger.error(f"❌ Erreur lors de l'archivage: {str(e)}")
                memoire.is_archived = False
            
            self._notify_staff_for_quitus(memoire)
            
        else:
            memoire.transition_to('rejete')
            memoire.rejection_reason = "Documents non conformes lors de la vérification physique"
        
        memoire.save()
        
        return Response({
            'success': True,
            'status': memoire.status,
            'documents_conform': memoire.documents_conform,
            'is_archived': memoire.is_archived,
            'archive_result': archive_result if archive_result else None,
            'message': 'Vérification effectuée avec succès' + (' et document archivé' if memoire.is_archived else '')
        })
    
    def _notify_archive_success(self, memoire, archive_result):
        try:
            from apps.notifications.models import Notification
            from django.contrib.auth import get_user_model
            
            User = get_user_model()
            staff_users = User.objects.filter(role__in=['ADMIN', 'BIBLIO'])
            
            title = f"📄 Document archivé - {archive_result['document_name']}"
            message = f"""
                Le document de {memoire.author.get_full_name()} a été archivé avec succès.
                
                Nom: {archive_result['document_name']}
                Type: {memoire.get_type_document_display()}
                Faculté: {archive_result['faculty']} - {archive_result.get('faculty_name', '')}
                Année: {archive_result['year']}
                Emplacement: {archive_result['archive_relative_path']}
            """
            
            for staff in staff_users:
                Notification.objects.create(
                    user=staff,
                    title=title,
                    message=message.strip(),
                    link=f"/staff/memoires/{memoire.id}"
                )
        except Exception as e:
            logger.error(f"Erreur notification archivage: {str(e)}")
    
    def _notify_staff_for_quitus(self, memoire):
        from apps.notifications.models import Notification
        
        staff_users = User.objects.filter(role__in=['ADMIN', 'BIBLIO'])
        title = "📄 Quitus à signer"
        message = f"Le dépôt de {memoire.author.get_full_name()} ({memoire.title}) est prêt pour la signature du quitus."
        link = f"/staff/memoires/{memoire.id}"
        
        for staff in staff_users:
            Notification.objects.create(
                user=staff,
                title=title,
                message=message,
                link=link
            )


class MemoireScannedDocumentUploadView(APIView):
    """Upload du document scanné signé (pour le staff)"""
    permission_classes = [permissions.IsAuthenticated, IsStaffOnly]

    def post(self, request, pk):
        memoire = get_object_or_404(Memoire, pk=pk)
        
        scanned_file = request.FILES.get('scanned_document')
        if not scanned_file:
            return Response({
                'error': 'Aucun fichier fourni'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        memoire.scanned_document = scanned_file
        memoire.save()
        
        if memoire.status == 'verification_ok':
            memoire.transition_to('en_attente_quitus')
        
        return Response({
            'success': True,
            'message': 'Document scanné téléchargé avec succès',
            'file_url': memoire.scanned_document.url if memoire.scanned_document else None
        })


class MemoireQuitusSignView(APIView):
    """Signature du quitus par le conservateur (pour le staff)"""
    permission_classes = [permissions.IsAuthenticated, IsStaffOnly]

    def post(self, request, pk):
        memoire = get_object_or_404(Memoire, pk=pk)
        
        if memoire.status != 'en_attente_quitus':
            return Response({
                'error': f'Le quitus n\'est pas en attente de signature (statut actuel: {memoire.status})'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        from .utils import generate_quitus_pdf
        try:
            filename, file_content = generate_quitus_pdf(memoire)
            memoire.quitus_file.save(filename, file_content, save=False)
            memoire.transition_to('quitus_disponible')
            memoire.is_quitus_signed = True
            memoire.quitus_signed_at = timezone.now()
            memoire.save()
            
            self._send_quitus_available_email(memoire)
            
            return Response({
                'success': True,
                'message': 'Quitus signé et disponible',
                'status': memoire.status
            })
            
        except Exception as e:
            logger.error(f"Erreur signature quitus: {str(e)}")
            return Response({
                'error': f'Erreur lors de la signature du quitus: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _send_quitus_available_email(self, memoire):
        try:
            type_doc = "Mémoire de Master" if memoire.type_document == Memoire.TypeDocument.MEMOIRE else "Thèse de Doctorat"
            
            context = {
                'user': memoire.author,
                'type_document': type_doc,
                'dossier_id': memoire.id,
                'link': f'/mon-compte/depots/{memoire.id}',
                'year': timezone.now().year
            }
            
            EmailService.send_async_email(
                user=memoire.author,
                subject=f"Votre quitus est disponible - {memoire.id.hex[:8]}",
                template_name='emails/quitus_disponible.html',
                context=context,
                notification_title="📄 Quitus disponible"
            )
            
        except Exception as e:
            logger.error(f"Erreur envoi email quitus disponible: {str(e)}")


class MemoireQuitusRetrieveView(APIView):
    """Récupération du quitus (pour le staff uniquement)"""
    permission_classes = [permissions.IsAuthenticated, IsStaffOnly]

    def get(self, request, pk):
        memoire = get_object_or_404(Memoire, pk=pk)
        
        if not memoire.quitus_file:
            return Response({
                'error': 'Le quitus n\'a pas encore été généré'
            }, status=status.HTTP_404_NOT_FOUND)
        
        response = FileResponse(memoire.quitus_file, as_attachment=True)
        response['Content-Disposition'] = f'attachment; filename="quitus_{memoire.id}.pdf"'
        return response


class MemoireQuitusRetireView(APIView):
    """Confirmation du retrait du quitus (pour le staff)"""
    permission_classes = [permissions.IsAuthenticated, IsStaffOnly]

    def post(self, request, pk):
        memoire = get_object_or_404(Memoire, pk=pk)
        
        if memoire.status != 'quitus_disponible':
            return Response({
                'error': f'Le quitus n\'est pas disponible (statut actuel: {memoire.status})'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        memoire.transition_to('quitus_retire')
        memoire.quitus_retired_at = timezone.now()
        memoire.save()
        
        return Response({
            'success': True,
            'message': 'Quitus retiré avec succès',
            'status': memoire.status
        })


class MemoireStatusUpdateView(APIView):
    """
    Mise à jour du statut d'un mémoire (pour le staff).
    PATCH /api/memoires/<uuid:pk>/status/
    """
    permission_classes = [permissions.IsAuthenticated, IsStaffOnly]

    def patch(self, request, pk):
        memoire = get_object_or_404(Memoire, pk=pk)
        serializer = MemoireStatusUpdateSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        new_status = serializer.validated_data['status']
        rejection_reason = serializer.validated_data.get('rejection_reason')
        librarian_notes = serializer.validated_data.get('librarian_notes')
        documents_conform = serializer.validated_data.get('documents_conform')
        
        if not memoire.can_transition_to(new_status):
            return Response({
                'error': f'Transition impossible de "{memoire.status}" vers "{new_status}"'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if new_status == 'rejete':
            if not rejection_reason:
                return Response({
                    'error': 'Un motif de rejet est requis'
                }, status=status.HTTP_400_BAD_REQUEST)
            memoire.rejection_reason = rejection_reason
        
        elif new_status == 'verification_ok':
            memoire.documents_conform = documents_conform or True
            memoire.physical_deposit_confirmed = True
            if librarian_notes:
                memoire.librarian_notes = librarian_notes
            
            from .document_service import DocumentArchiveService
            
            try:
                archive_result = DocumentArchiveService.archive_document(memoire)
                if archive_result and archive_result.get('success'):
                    memoire.is_archived = True
                    logger.info(f"✅ Document archivé: {archive_result['document_name']}")
                    self._notify_archive_success(memoire, archive_result)
                else:
                    error_msg = archive_result.get('error', 'Erreur inconnue') if archive_result else 'Échec de l\'archivage'
                    logger.warning(f"⚠️ Échec de l'archivage: {error_msg}")
                    memoire.is_archived = False
            except Exception as e:
                logger.error(f"❌ Erreur lors de l'archivage: {str(e)}")
                memoire.is_archived = False
        
        elif new_status == 'en_attente_verification':
            memoire.physical_deposit_confirmed = True
        
        elif new_status == 'quitus_disponible':
            memoire.is_quitus_signed = True
            memoire.quitus_signed_at = timezone.now()
            
            if not memoire.quitus_file:
                from .utils import generate_quitus_pdf
                try:
                    filename, file_content = generate_quitus_pdf(memoire)
                    memoire.quitus_file.save(filename, file_content, save=False)
                except Exception as e:
                    logger.error(f"Erreur génération quitus: {str(e)}")
        
        memoire.transition_to(new_status)
        memoire.save()
        
        self._send_notifications(memoire, new_status)
        
        return Response({
            'success': True,
            'message': f'Statut mis à jour avec succès vers "{memoire.get_status_display()}"',
            'status': memoire.status,
            'status_display': memoire.get_status_display(),
            'rejection_reason': memoire.rejection_reason,
            'documents_conform': memoire.documents_conform,
            'physical_deposit_confirmed': memoire.physical_deposit_confirmed,
            'is_archived': memoire.is_archived,
            'document_name': memoire.document_name if hasattr(memoire, 'document_name') else None,
        }, status=status.HTTP_200_OK)
    
    def _notify_archive_success(self, memoire, archive_result):
        try:
            from apps.notifications.models import Notification
            from django.contrib.auth import get_user_model
            
            User = get_user_model()
            staff_users = User.objects.filter(role__in=['ADMIN', 'BIBLIO'])
            
            title = f"📄 Document archivé - {archive_result['document_name']}"
            message = f"""
                Le document de {memoire.author.get_full_name()} a été archivé avec succès.
                
                Nom: {archive_result['document_name']}
                Type: {memoire.get_type_document_display()}
                Faculté: {archive_result['faculty']} - {archive_result.get('faculty_name', '')}
                Année: {archive_result['year']}
                Emplacement: {archive_result['archive_relative_path']}
            """
            
            for staff in staff_users:
                Notification.objects.create(
                    user=staff,
                    title=title,
                    message=message.strip(),
                    link=f"/staff/memoires/{memoire.id}"
                )
        except Exception as e:
            logger.error(f"Erreur notification archivage: {str(e)}")
    
    def _send_notifications(self, memoire, new_status):
        try:
            from apps.notifications.models import Notification
            
            student_title = {
                'convocation_envoyee': '📧 Convocation envoyée',
                'en_attente_verification': '🔍 En attente de vérification',
                'verification_ok': '✅ Vérification validée',
                'rejete': '❌ Dépôt rejeté',
                'quitus_disponible': '📄 Quitus disponible',
                'quitus_retire': '📋 Quitus retiré',
            }.get(new_status)
            
            student_message = {
                'convocation_envoyee': f'Une convocation vous a été envoyée pour le dépôt physique de votre mémoire "{memoire.title}".',
                'en_attente_verification': f'Votre mémoire "{memoire.title}" est en attente de vérification physique.',
                'verification_ok': f'Félicitations ! Votre mémoire "{memoire.title}" a été vérifié avec succès.',
                'rejete': f'Votre mémoire "{memoire.title}" a été rejeté. Motif: {memoire.rejection_reason}',
                'quitus_disponible': f'Votre quitus pour "{memoire.title}" est maintenant disponible.',
                'quitus_retire': f'Vous avez retiré le quitus pour "{memoire.title}".',
            }.get(new_status)
            
            if student_title and student_message:
                Notification.objects.create(
                    user=memoire.author,
                    title=student_title,
                    message=student_message,
                    link=f'/mon-compte/depots/{memoire.id}'
                )
            
            if new_status in ['depot_en_ligne', 'convocation_envoyee']:
                staff_users = User.objects.filter(role__in=['ADMIN', 'BIBLIO'])
                staff_title = '📚 Nouveau mémoire à traiter'
                staff_message = f'{memoire.author.get_full_name()} a déposé "{memoire.title}". Statut: {memoire.get_status_display()}'
                
                for staff in staff_users:
                    Notification.objects.create(
                        user=staff,
                        title=staff_title,
                        message=staff_message,
                        link=f'/staff/memoires/{memoire.id}'
                    )
                    
        except Exception as e:
            logger.error(f"Erreur envoi notifications: {str(e)}")


def confirm_physical_signature(request, pk):
    memoire = get_object_or_404(Memoire, pk=pk)
    
    if not request.user.is_staff:
        return Response(
            {"error": "Seul le staff peut confirmer la signature physique"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    if memoire.status not in ['quitus_disponible', 'quitus_retire']:
        return Response({
            'error': f'Le quitus n\'est pas disponible (statut actuel: {memoire.status})'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    memoire.is_quitus_physically_signed = True
    memoire.quitus_physically_signed_at = timezone.now()
    memoire.save()
    
    logger.info(f"Signature physique confirmée pour le mémoire {memoire.id} par {request.user.username}")
    
    return Response({
        'success': True,
        'message': 'Signature physique confirmée avec succès',
        'status': memoire.status,
        'is_quitus_physically_signed': memoire.is_quitus_physically_signed,
        'signature_date': memoire.quitus_physically_signed_at
    }, status=status.HTTP_200_OK)


class MemoireFileDownloadView(APIView):
    """
    Téléchargement sécurisé des fichiers d'un mémoire.
    Vérifie que l'utilisateur a le droit d'accéder au fichier.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk, file_type):
        memoire = get_object_or_404(Memoire, pk=pk)
        
        if not request.user.is_staff and request.user != memoire.author:
            return Response({
                'error': 'Vous n\'avez pas la permission d\'accéder à ce fichier'
            }, status=status.HTTP_403_FORBIDDEN)
        
        file_map = {
            'pdf': {
                'field': memoire.pdf_file,
                'display_name': 'PDF'
            },
            'word': {
                'field': memoire.word_file,
                'display_name': 'Word'
            },
            'scanned': {
                'field': memoire.scanned_document,
                'display_name': 'document scanné'
            },
            'quitus': {
                'field': memoire.quitus_file,
                'display_name': 'quitus'
            },
        }
        
        file_info = file_map.get(file_type)
        if not file_info:
            return Response({
                'error': f'Type de fichier "{file_type}" invalide. Types acceptés: pdf, word, scanned, quitus'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        file_field = file_info['field']
        if not file_field:
            return Response({
                'error': f'Aucun {file_info["display_name"]} trouvé pour ce mémoire'
            }, status=status.HTTP_404_NOT_FOUND)
        
        try:
            file_path = file_field.path
        except ValueError:
            return Response({
                'error': 'Le chemin du fichier est invalide'
            }, status=status.HTTP_404_NOT_FOUND)
            
        if not os.path.exists(file_path):
            return Response({
                'error': 'Le fichier n\'existe pas physiquement sur le serveur'
            }, status=status.HTTP_404_NOT_FOUND)
        
        content_type = 'application/pdf'
        if file_type == 'word':
            if file_field.name.endswith('.docx'):
                content_type = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            else:
                content_type = 'application/msword'
        elif file_type == 'scanned':
            if file_field.name.endswith('.pdf'):
                content_type = 'application/pdf'
            elif file_field.name.endswith('.jpg') or file_field.name.endswith('.jpeg'):
                content_type = 'image/jpeg'
            elif file_field.name.endswith('.png'):
                content_type = 'image/png'
        
        try:
            file_handle = open(file_path, 'rb')
            filename = file_field.name.split('/')[-1]
            if not filename:
                filename = f"{memoire.id}_{file_type}.pdf"
            
            response = FileResponse(
                file_handle,
                content_type=content_type,
                as_attachment=False
            )
            response['Content-Disposition'] = f'inline; filename="{filename}"'
            response['Content-Length'] = os.path.getsize(file_path)
            response['Cache-Control'] = 'no-cache'
            return response
            
        except Exception as e:
            logger.error(f"Erreur lecture fichier: {str(e)}")
            return Response({
                'error': f'Erreur lors de la lecture du fichier: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class TestArchiveView(APIView):
    """
    Vue de test pour l'archivage d'un document.
    POST /api/memoires/<uuid:pk>/test-archive/
    """
    permission_classes = [permissions.IsAuthenticated, IsStaffOnly]

    def post(self, request, pk):
        from .document_service import DocumentArchiveService
        
        memoire = get_object_or_404(Memoire, pk=pk)
        
        if not memoire.pdf_file:
            return Response({
                'success': False,
                'error': 'Aucun PDF trouvé pour ce mémoire'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        result = DocumentArchiveService.archive_document(memoire)
        
        if result and result.get('success'):
            return Response({
                'success': True,
                'message': f"Document archivé avec succès: {result['document_name']}",
                'data': result
            })
        else:
            return Response({
                'success': False,
                'error': result.get('error', 'Erreur lors de l\'archivage') if result else 'Erreur inconnue'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class MemoireStatsView(APIView):
    """Endpoint pour les statistiques des mémoires (dashboard staff)."""
    permission_classes = [permissions.IsAuthenticated, IsStaffOnly]

    def get(self, request):
        try:
            total = Memoire.objects.count()
            
            stats = {
                'total': total,
                'brouillon': Memoire.objects.filter(status='brouillon').count(),
                'depot_en_ligne': Memoire.objects.filter(status='depot_en_ligne').count(),
                'convocation_envoyee': Memoire.objects.filter(status='convocation_envoyee').count(),
                'relance_envoyee': Memoire.objects.filter(status='relance_envoyee').count(),
                'en_attente_verification': Memoire.objects.filter(status='en_attente_verification').count(),
                'verification_ok': Memoire.objects.filter(status='verification_ok').count(),
                'rejete': Memoire.objects.filter(status='rejete').count(),
                'en_attente_quitus': Memoire.objects.filter(status='en_attente_quitus').count(),
                'quitus_disponible': Memoire.objects.filter(status='quitus_disponible').count(),
                'quitus_retire': Memoire.objects.filter(status='quitus_retire').count(),
                'abandonne': Memoire.objects.filter(status='abandonne').count(),
                'incomplet': Memoire.objects.filter(status='brouillon').count(),
                'en_attente': Memoire.objects.filter(status__in=['depot_en_ligne', 'convocation_envoyee', 'relance_envoyee']).count(),
                'valide': Memoire.objects.filter(status='verification_ok').count(),
                'quitus_genere': Memoire.objects.filter(status='quitus_disponible').count(),
                'quitus_signe': Memoire.objects.filter(status='quitus_retire').count(),
                'pending_staff': Memoire.objects.filter(status__in=['depot_en_ligne', 'convocation_envoyee', 'relance_envoyee', 'en_attente_verification']).count(),
            }
            return Response(stats, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Erreur récupération statistiques mémoires: {str(e)}")
            return Response(
                {'error': 'Erreur lors de la récupération des statistiques'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class DepotCreateView(APIView):
    """
    Création d'un nouveau dépôt (étudiant).
    POST /api/memoires/depot/
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        
        if not hasattr(user, 'role') or user.role != 'ETUDIANT':
            return Response({
                'success': False,
                'detail': 'Seuls les étudiants peuvent déposer un mémoire/thèse.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        data = request.data.copy()
        data['matricule'] = user.username
        data['full_name'] = user.get_full_name()
        
        if hasattr(user, 'preferences') and user.preferences:
            data['filiere'] = user.preferences.get('departement', '') or user.preferences.get('filiere', '')
        
        serializer = MemoireDepotSerializer(data=data, context={'request': request})
        
        if not serializer.is_valid():
            return Response({
                'success': False,
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            memoire = serializer.save()
            memoire.transition_to('depot_en_ligne')
            
            self._send_confirmation_email(memoire)
            
            return Response({
                'success': True,
                'message': 'Dépôt effectué avec succès ! Un email de confirmation vous a été envoyé.',
                'dossier_id': memoire.id,
                'dossier': MemoireSerializer(memoire).data
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Erreur création dépôt: {str(e)}")
            return Response({
                'success': False,
                'detail': 'Erreur lors du dépôt. Veuillez réessayer.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _send_confirmation_email(self, memoire):
        try:
            type_doc = "Mémoire de Master" if memoire.type_document == Memoire.TypeDocument.MEMOIRE else "Thèse de Doctorat"
            
            context = {
                'user': memoire.author,
                'type_document': type_doc,
                'titre': memoire.title,
                'matricule': memoire.matricule,
                'filiere': memoire.filiere,
                'dossier_id': memoire.id,
                'date_limite': (timezone.now() + timedelta(days=7)).strftime('%d/%m/%Y'),
                'link': f'/mon-compte/depots/{memoire.id}',
                'year': timezone.now().year
            }
            
            EmailService.send_async_email(
                user=memoire.author,
                subject=f"Confirmation de dépôt - {memoire.id.hex[:8]}",
                template_name='emails/depot_confirmation.html',
                context=context,
                notification_title="📝 Dépôt de mémoire initié"
            )
            
        except Exception as e:
            logger.error(f"Erreur envoi email confirmation: {str(e)}")


# ═══════════════════════════════════════════════════════════════════
# ─── VUES PUBLIQUES POUR LES ARCHIVES ────────────────────────────
# ═══════════════════════════════════════════════════════════════════

class PublicArchivesListView(generics.ListAPIView):
    """
    Vue publique pour lister les documents archivés.
    Accessible sans authentification.
    """
    permission_classes = [permissions.AllowAny]
    serializer_class = MemoireSerializer

    def get_queryset(self):
        return Memoire.objects.filter(
            is_archived=True
        ).order_by('-archived_at')


class PublicArchiveDetailView(generics.RetrieveAPIView):
    """
    Vue publique pour voir un document archivé spécifique.
    Accessible sans authentification.
    """
    permission_classes = [permissions.AllowAny]
    serializer_class = MemoireSerializer
    queryset = Memoire.objects.filter(is_archived=True)
    lookup_field = 'id'


# ═══════════════════════════════════════════════════════════════════
# ─── VUE POUR SERVIR LES DOCUMENTS ARCHIVÉS (PUBLIC) ─────────────
# ═══════════════════════════════════════════════════════════════════

@method_decorator(cache_control(public=True, max_age=86400), name='dispatch')
class ArchivedDocumentView(APIView):
    """
    Permet de consulter les documents archivés (public).
    GET /api/documents/archive/<path:file_path>/
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request, file_path):
        """
        Sert un document archivé depuis le dossier Documents/.
        """
        logger.info(f"📄 Demande de document archivé: {file_path}")
        
        # Nettoyer le chemin
        file_path = file_path.lstrip('/')
        
        # Vérifier les tentatives d'exploitation
        if '..' in file_path or file_path.startswith('/'):
            logger.warning(f"⚠️ Tentative d'exploitation: {file_path}")
            return Response({
                'error': 'Chemin invalide'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Construire le chemin complet
        full_path = os.path.join(settings.DOCUMENTS_ROOT, file_path)
        logger.info(f"   Chemin complet: {full_path}")
        
        # Sécurité : vérifier que le chemin est dans DOCUMENTS_ROOT
        try:
            real_path = os.path.realpath(full_path)
            docs_root = os.path.realpath(settings.DOCUMENTS_ROOT)
            
            if not real_path.startswith(docs_root):
                logger.warning(f"⚠️ Tentative d'accès hors DOCUMENTS_ROOT: {real_path}")
                return Response({
                    'error': 'Accès non autorisé'
                }, status=status.HTTP_403_FORBIDDEN)
            
            if not os.path.exists(real_path):
                logger.warning(f"⚠️ Fichier non trouvé: {real_path}")
                return Response({
                    'error': 'Document non trouvé'
                }, status=status.HTTP_404_NOT_FOUND)
            
            if not os.path.isfile(real_path):
                logger.warning(f"⚠️ Ce n'est pas un fichier: {real_path}")
                return Response({
                    'error': 'Ce n\'est pas un fichier valide'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Déterminer le type MIME
            mime_type, _ = mimetypes.guess_type(real_path)
            if not mime_type:
                mime_type = 'application/pdf'  # Par défaut pour les PDFs
            
            # Ouvrir et servir le fichier
            file_handle = open(real_path, 'rb')
            
            # Créer la réponse
            response = FileResponse(
                file_handle,
                content_type=mime_type,
                as_attachment=False
            )
            
            # En-têtes pour permettre l'affichage et le téléchargement
            filename = os.path.basename(real_path)
            quoted_filename = url_quoter(filename)
            
            response['Content-Disposition'] = f'inline; filename="{quoted_filename}"'
            response['Content-Length'] = os.path.getsize(real_path)
            response['Access-Control-Allow-Origin'] = '*'
            response['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
            response['Access-Control-Allow-Headers'] = '*'
            
            logger.info(f"✅ Document servi: {filename}")
            return response
            
        except Exception as e:
            logger.error(f"❌ Erreur lors du service du document: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response({
                'error': 'Erreur lors du chargement du document'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)