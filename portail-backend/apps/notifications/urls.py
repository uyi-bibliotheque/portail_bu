# apps/notifications/urls.py
from django.urls import path
from .views import (
    NotificationListView,
    NotificationMarkReadView,
    NotificationMarkAllReadView,
    UnreadCountView
)

app_name = 'notifications'

urlpatterns = [
    # Liste des notifications
    path('', NotificationListView.as_view(), name='notification_list'),
    
    # Marquer une notification comme lue (PATCH ou POST) - ID entier
    path('<int:pk>/read/', NotificationMarkReadView.as_view(), name='notification_mark_read'),
    
    # Marquer toutes les notifications comme lues
    path('read-all/', NotificationMarkAllReadView.as_view(), name='notification_mark_all_read'),
    
    # Compter les notifications non lues
    path('unread-count/', UnreadCountView.as_view(), name='notification_unread_count'),
]