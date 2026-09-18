# apps/notifications/views.py
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Notification
from .serializers import NotificationSerializer
import logging

logger = logging.getLogger(__name__)


class NotificationListView(generics.ListAPIView):
    """Liste les notifications de l'utilisateur connecté."""
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')


class NotificationMarkReadView(APIView):
    """Marque une notification comme lue."""
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        from django.http import Http404
        try:
            notification = Notification.objects.get(pk=int(pk), user=request.user)
        except Notification.DoesNotExist:
            raise Http404("Notification introuvable.")
        except (ValueError, TypeError):
            logger.error(f"ID de notification invalide: {pk}")
            return Response(
                {'success': False, 'error': 'ID de notification invalide'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            notification.mark_as_read()
            return Response(
                {
                    'success': True,
                    'message': 'Notification marquée comme lue',
                    'notification': NotificationSerializer(notification).data
                },
                status=status.HTTP_200_OK
            )
        except Exception as e:
            logger.error(f"Erreur lors du marquage de la notification {pk}: {str(e)}")
            return Response(
                {'success': False, 'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    def post(self, request, pk):
        """Support des deux méthodes (POST et PATCH)."""
        return self.patch(request, pk)


class NotificationMarkAllReadView(APIView):
    """Marque toutes les notifications comme lues."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            notifications = Notification.objects.filter(
                user=request.user, 
                is_read=False
            )
            count = notifications.count()
            notifications.update(is_read=True)
            
            logger.info(f"Utilisateur {request.user.username} a marqué {count} notifications comme lues")
            
            return Response(
                {
                    'success': True,
                    'message': f'{count} notification(s) marquée(s) comme lue(s)',
                    'count': count
                },
                status=status.HTTP_200_OK
            )
        except Exception as e:
            logger.error(f"Erreur lors du marquage de toutes les notifications: {str(e)}")
            return Response(
                {'success': False, 'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class UnreadCountView(APIView):
    """Retourne le nombre de notifications non lues."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            count = Notification.objects.filter(
                user=request.user, 
                is_read=False
            ).count()
            return Response(
                {
                    'count': count,
                    'has_unread': count > 0
                },
                status=status.HTTP_200_OK
            )
        except Exception as e:
            logger.error(f"Erreur lors du comptage des notifications non lues: {str(e)}")
            return Response(
                {'count': 0, 'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )