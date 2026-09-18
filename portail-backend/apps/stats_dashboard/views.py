# apps/stats_dashboard/views.py
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Count, Sum, Q
from django.utils import timezone
from datetime import timedelta
import logging

from django.contrib.auth import get_user_model
from apps.doc_manager.models import DigitalDocument
from apps.loans_manager.models import Reservation
from apps.user_favorites.models import UserFavorite
from apps.site_content.models import ContactMessage, Article
from apps.memoires.models import Memoire

User = get_user_model()
logger = logging.getLogger(__name__)


class DashboardStatsView(APIView):
    """Fournit les statistiques agrégées globales du portail documentaire."""
    permission_classes = [permissions.IsAdminUser]

    def get(self, request, format=None):
        try:
            total_users = User.objects.count()
            active_users = User.objects.filter(is_active=True).count()
            total_documents = DigitalDocument.objects.count()
            
            # CORRECTION: Utiliser created_at au lieu de updated_at
            total_downloads = DigitalDocument.objects.aggregate(Sum('download_count'))['download_count__sum'] or 0
            
            memoires_stats = {
                'total': Memoire.objects.count(),
                'incomplet': Memoire.objects.filter(status='incomplet').count(),
                'en_attente': Memoire.objects.filter(status='en_attente').count(),
                'valide': Memoire.objects.filter(status='valide').count(),
                'quitus_genere': Memoire.objects.filter(status='quitus_genere').count(),
                'quitus_signe': Memoire.objects.filter(status='quitus_signe').count(),
                'rejete': Memoire.objects.filter(status='rejete').count(),
            }
            
            total_reservations = Reservation.objects.count()
            active_reservations = Reservation.objects.filter(status='active').count()
            total_favorites = UserFavorite.objects.count()
            total_articles = Article.objects.count()
            published_articles = Article.objects.filter(is_published=True).count()
            unread_messages = ContactMessage.objects.filter(is_read=False).count()
            
            # CORRECTION: Utiliser created_at au lieu de updated_at
            recent_users = User.objects.filter(
                created_at__gte=timezone.now() - timedelta(days=7)
            ).count()
            
            recent_documents = DigitalDocument.objects.filter(
                created_at__gte=timezone.now() - timedelta(days=30)
            ).count()
            
            recent_downloads = DigitalDocument.objects.filter(
                created_at__gte=timezone.now() - timedelta(days=30)
            ).aggregate(Sum('download_count'))['download_count__sum'] or 0
            
            stats_data = {
                "users_count": total_users,
                "active_users": active_users,
                "recent_users": recent_users,
                "documents_count": total_documents,
                "recent_documents": recent_documents,
                "downloads_count": total_downloads,
                "recent_downloads": recent_downloads,
                "memoires": memoires_stats,
                "pending_deposits": memoires_stats['en_attente'],
                "reservations_count": total_reservations,
                "active_reservations": active_reservations,
                "favorites_count": total_favorites,
                "articles_count": total_articles,
                "published_articles": published_articles,
                "unread_contact_messages": unread_messages,
            }

            return Response(stats_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Erreur récupération statistiques: {str(e)}")
            return Response(
                {"error": "Erreur lors de la récupération des statistiques"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class DashboardChartView(APIView):
    """Fournit les données pour les graphiques du dashboard."""
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        try:
            period = request.query_params.get('period', '6months')
            
            if period == '30days':
                days = 30
            elif period == '90days':
                days = 90
            else:
                days = 180
                
            start_date = timezone.now() - timedelta(days=days)
            
            chart_data = []
            current_date = start_date.replace(day=1)
            
            while current_date <= timezone.now():
                month_end = current_date + timedelta(days=32)
                month_end = month_end.replace(day=1)
                
                month_data = {
                    "month": current_date.strftime("%b %Y"),
                    "recherches": 0,
                    "téléchargements": 0,
                    "prêts": 0,
                    "utilisateurs": 0,
                    "documents": 0
                }
                
                # CORRECTION: Utiliser created_at au lieu de updated_at
                downloads = DigitalDocument.objects.filter(
                    created_at__gte=current_date,
                    created_at__lt=month_end
                ).aggregate(Sum('download_count'))['download_count__sum'] or 0
                month_data["téléchargements"] = downloads
                
                users = User.objects.filter(
                    created_at__gte=current_date,
                    created_at__lt=month_end
                ).count()
                month_data["utilisateurs"] = users
                
                docs = DigitalDocument.objects.filter(
                    created_at__gte=current_date,
                    created_at__lt=month_end
                ).count()
                month_data["documents"] = docs
                
                chart_data.append(month_data)
                current_date = month_end
                
            return Response(chart_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Erreur récupération données graphique: {str(e)}")
            return Response([], status=status.HTTP_200_OK)


class DashboardTopDocumentsView(APIView):
    """Fournit le top des documents les plus consultés."""
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        try:
            limit = int(request.query_params.get('limit', 5))
            
            top_docs = DigitalDocument.objects.filter(
                download_count__gt=0
            ).order_by('-download_count')[:limit]
            
            result = []
            for doc in top_docs:
                result.append({
                    "id": str(doc.id),
                    "title": doc.title,
                    "downloads": doc.download_count,
                    "type": "Document",
                    "faculty": "Bibliothèque Centrale"
                })
                
            return Response(result, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Erreur top documents: {str(e)}")
            return Response([], status=status.HTTP_200_OK)


class DashboardActivityView(APIView):
    """Fournit l'activité récente du portail."""
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        try:
            limit = int(request.query_params.get('limit', 10))
            
            activities = []
            
            recent_users = User.objects.order_by('-created_at')[:5]
            for user in recent_users:
                activities.append({
                    "id": str(user.id),
                    "type": "user_registered",
                    "title": f"Nouvel utilisateur: {user.username}",
                    "user": user.username,
                    "date": user.created_at.isoformat(),
                    "icon": "users"
                })
            
            recent_memoires = Memoire.objects.order_by('-created_at')[:5]
            for memoire in recent_memoires:
                activities.append({
                    "id": str(memoire.id),
                    "type": "memoire_deposit",
                    "title": f"Dépôt: {memoire.title}",
                    "user": memoire.author.username,
                    "date": memoire.created_at.isoformat(),
                    "icon": "file-text",
                    "status": memoire.status
                })
            
            recent_articles = Article.objects.order_by('-created_at')[:3]
            for article in recent_articles:
                activities.append({
                    "id": str(article.id),
                    "type": "article_published",
                    "title": f"Article: {article.title}",
                    "date": article.created_at.isoformat(),
                    "icon": "newspaper"
                })
            
            activities.sort(key=lambda x: x.get('date', ''), reverse=True)
            
            return Response(activities[:limit], status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Erreur activité: {str(e)}")
            return Response([], status=status.HTTP_200_OK)