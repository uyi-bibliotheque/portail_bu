# apps/stats_dashboard/urls.py
from django.urls import path
from .views import (
    DashboardStatsView,
    DashboardChartView,
    DashboardTopDocumentsView,
    DashboardActivityView
)

urlpatterns = [
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard_stats'),
    path('dashboard/chart/', DashboardChartView.as_view(), name='dashboard_chart'),
    path('dashboard/top-documents/', DashboardTopDocumentsView.as_view(), name='dashboard_top_documents'),
    path('dashboard/activity/', DashboardActivityView.as_view(), name='dashboard_activity'),
]