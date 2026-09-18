# apps/site_content/urls.py
from django.urls import path
from .views import (
    ArticleListCreateView,
    ArticleDetailView,
    ArticleStatusUpdateView,
    ContactMessageCreateView,
    ContactMessageListView,
    ContactMessageDetailView,
    ContactMessageMarkReadView,
)

urlpatterns = [
    # Articles
    path('content/articles/', ArticleListCreateView.as_view(), name='article_list'),
    path('content/articles/<uuid:pk>/', ArticleDetailView.as_view(), name='article_detail'),
    path('content/articles/<uuid:pk>/status/', ArticleStatusUpdateView.as_view(), name='article_status_update'),
    
    # Messages de contact
    path('content/contact/', ContactMessageCreateView.as_view(), name='contact_create'),
    path('content/messages/', ContactMessageListView.as_view(), name='contact_messages_list'),
    path('content/messages/<uuid:pk>/', ContactMessageDetailView.as_view(), name='contact_message_detail'),
    path('content/messages/<uuid:pk>/read/', ContactMessageMarkReadView.as_view(), name='contact_message_read'),
]