# apps/stats_dashboard/urls.py
from django.urls import path
from .views import (
    DashboardStatsView,
    DashboardArchiveAnalyticsView,
    DashboardChartView,
    DashboardTopDocumentsView,
    DashboardActivityView
)

urlpatterns = [
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard_stats'),
    path('dashboard/archive-analytics/', DashboardArchiveAnalyticsView.as_view(), name='dashboard_archive_analytics'),
    path('dashboard/chart/', DashboardChartView.as_view(), name='dashboard_chart'),
    path('dashboard/top-documents/', DashboardTopDocumentsView.as_view(), name='dashboard_top_documents'),
    path('dashboard/activity/', DashboardActivityView.as_view(), name='dashboard_activity'),
]