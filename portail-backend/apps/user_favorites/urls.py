from django.urls import path
from .views import UserFavoriteListCreateView, UserFavoriteDetailView

urlpatterns = [
    # GET / POST /api/favorites/ -> Liste et Ajout
    path('favorites/', UserFavoriteListCreateView.as_view(), name='favorite_list_create'),
    
    # DELETE /api/favorites/<uuid:pk>/ -> Suppression d'un favori
    path('favorites/<uuid:pk>/', UserFavoriteDetailView.as_view(), name='favorite_detail'),
]