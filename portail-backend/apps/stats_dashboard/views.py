# apps/stats_dashboard/views.py
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Count, Sum, Q
from django.db.models.functions import TruncMonth
from django.utils import timezone
from datetime import timedelta
import logging

from django.conf import settings
from django.contrib.auth import get_user_model
from apps.doc_manager.models import DigitalDocument
from apps.loans_manager.models import Reservation
from apps.user_favorites.models import UserFavorite
from apps.site_content.models import ContactMessage, Article
from apps.memoires.models import DirectArchiveDocument, Memoire

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


class DashboardArchiveAnalyticsView(APIView):
    """Fournit les agrégats des mémoires et thèses archivés pour le BI."""
    permission_classes = [permissions.IsAdminUser]

    @staticmethod
    def _faculty_code(value):
        if not value:
            return 'AUTRE'

        normalized = str(value).strip().upper().replace('-', '_')
        for faculty_name, abbreviation in settings.FACULTY_ABBREVIATIONS.items():
            if normalized == faculty_name.strip().upper().replace('-', '_'):
                return abbreviation

        return 'AUTRE'

    @classmethod
    def _faculty_from_memoire(cls, archive):
        archive_path = (archive.get('archive_path') or '').replace('\\', '/')
        path_parts = archive_path.split('/')
        if len(path_parts) > 1:
            faculty = cls._faculty_code(path_parts[1])
            if faculty != 'AUTRE':
                return faculty

        document_name = archive.get('document_name') or ''
        if document_name:
            faculty = cls._faculty_code(document_name.split('_', 1)[0])
            if faculty != 'AUTRE':
                return faculty

        return cls._faculty_code(archive.get('filiere'))

    def get(self, request):
        try:
            summary = {
                'total': 0,
                'memoires': 0,
                'theses': 0,
                'archives_directes': 0,
                'archives_portail': 0,
                'annee_inconnue': 0,
            }
            faculty_totals = {}
            year_totals = {}
            faculty_year_totals = {}
            seen_paths = set()

            def add_archive(document_type, faculty_value, year_value, source, path=''):
                normalized_path = path.replace('\\', '/').strip('/').casefold()
                if normalized_path and normalized_path in seen_paths:
                    return
                if normalized_path:
                    seen_paths.add(normalized_path)

                faculty = self._faculty_code(faculty_value)
                try:
                    year = int(year_value) if year_value else None
                except (TypeError, ValueError):
                    year = None

                summary['total'] += 1
                if document_type == 'MEMOIRE':
                    summary['memoires'] += 1
                elif document_type == 'THESE':
                    summary['theses'] += 1
                summary[f'archives_{source}'] += 1
                if year is None:
                    summary['annee_inconnue'] += 1

                faculty_row = faculty_totals.setdefault(
                    faculty, {'faculty': faculty, 'memoires': 0, 'theses': 0, 'total': 0},
                )
                faculty_row['total'] += 1
                if document_type in ('MEMOIRE', 'THESE'):
                    faculty_row['memoires' if document_type == 'MEMOIRE' else 'theses'] += 1

                if year is None:
                    return

                year_row = year_totals.setdefault(
                    year, {'year': year, 'memoires': 0, 'theses': 0, 'total': 0},
                )
                year_row['total'] += 1
                if document_type in ('MEMOIRE', 'THESE'):
                    year_row['memoires' if document_type == 'MEMOIRE' else 'theses'] += 1

                faculty_year_key = (faculty, year)
                faculty_year_row = faculty_year_totals.setdefault(
                    faculty_year_key,
                    {'faculty': faculty, 'year': year, 'memoires': 0, 'theses': 0, 'total': 0},
                )
                faculty_year_row['total'] += 1
                if document_type in ('MEMOIRE', 'THESE'):
                    faculty_year_row['memoires' if document_type == 'MEMOIRE' else 'theses'] += 1

            direct_archives = DirectArchiveDocument.objects.filter(
                is_available=True,
            ).values('source_path', 'type_document', 'faculty', 'year')
            for archive in direct_archives.iterator():
                add_archive(
                    archive['type_document'],
                    archive['faculty'],
                    archive['year'],
                    'directes',
                    archive['source_path'],
                )

            portal_archives = Memoire.objects.filter(is_archived=True).values(
                'type_document', 'archive_path', 'document_name', 'filiere', 'archived_at',
            )
            for archive in portal_archives.iterator():
                archive_path = archive['archive_path'] or ''
                path_parts = archive_path.replace('\\', '/').split('/')
                path_year = path_parts[2] if len(path_parts) > 2 else None
                if path_year and not path_year.isdigit():
                    path_year = None
                year = path_year or (
                    archive['archived_at'].year if archive['archived_at'] else None
                )
                add_archive(
                    archive['type_document'],
                    self._faculty_from_memoire(archive),
                    year,
                    'portail',
                    archive_path,
                )

            faculty_names = settings.FACULTY_FULL_NAMES
            by_faculty = sorted(
                (
                    {
                        **row,
                        'name': faculty_names.get(row['faculty'], row['faculty']),
                    }
                    for row in faculty_totals.values()
                ),
                key=lambda row: (-row['total'], row['faculty']),
            )
            by_year = sorted(year_totals.values(), key=lambda row: row['year'])
            by_faculty_year = sorted(
                faculty_year_totals.values(),
                key=lambda row: (row['year'], row['faculty']),
            )

            return Response({
                'summary': summary,
                'by_faculty': by_faculty,
                'by_year': by_year,
                'by_faculty_year': by_faculty_year,
            }, status=status.HTTP_200_OK)
        except Exception:
            logger.exception("Erreur de calcul des statistiques d'archives")
            return Response(
                {'error': "Erreur lors du calcul du rapport d'archives"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class DashboardChartView(APIView):
    """Fournit les données pour les graphiques du dashboard."""
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        try:
            period = request.query_params.get('period', '6months')
            month_count = {
                '30days': 2,
                '90days': 4,
                '3months': 3,
                '6months': 6,
                '12months': 12,
            }.get(period, 6)
            now = timezone.now()
            current_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            start_date = current_month
            for _ in range(month_count - 1):
                start_date = (start_date - timedelta(days=1)).replace(day=1)

            def monthly_counts(date_field):
                return {
                    item['month'].strftime('%Y-%m'): item['total']
                    for item in Memoire.objects.filter(
                        **{f'{date_field}__gte': start_date},
                    ).annotate(
                        month=TruncMonth(date_field),
                    ).values('month').annotate(total=Count('id'))
                }

            deposits = monthly_counts('submitted_at')
            validations = monthly_counts('physical_verified_at')
            quitus = monthly_counts('quitus_available_at')
            chart_data = []
            current_date = start_date
            while current_date <= current_month:
                month_key = current_date.strftime('%Y-%m')
                chart_data.append({
                    'month': current_date.strftime('%b %Y'),
                    'depots': deposits.get(month_key, 0),
                    'validations': validations.get(month_key, 0),
                    'quitus': quitus.get(month_key, 0),
                })
                current_date = (current_date + timedelta(days=32)).replace(day=1)

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