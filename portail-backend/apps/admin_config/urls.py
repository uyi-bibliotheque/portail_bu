from django.urls import path
from .views import SiteConfigurationListView, SiteConfigurationUpdateView

urlpatterns = [
    path('config/', SiteConfigurationListView.as_view(), name='config_list'),
    path('config/<uuid:pk>/', SiteConfigurationUpdateView.as_view(), name='config_update'),
]