# catalog/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from catalog.services import CatalogService
import logging

logger = logging.getLogger(__name__)


class SearchCatalogView(APIView):
    """
    Endpoint de recherche dans le catalogue avec résultats détaillés.
    GET /api/catalog/search/?q=informatique&page=1
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        query = request.query_params.get('q', '').strip()
        page = request.query_params.get('page', 1)
        
        # Critères de recherche avancée
        advanced_criteria = {
            "title": request.query_params.get('title', '').strip(),
            "author": request.query_params.get('author', '').strip(),
            "year": request.query_params.get('year', '').strip(),
            "isbn": request.query_params.get('isbn', '').strip(),
            "subject": request.query_params.get('subject', '').strip(),
        }

        try:
            page = int(page)
            if page < 1:
                page = 1
        except ValueError:
            page = 1

        service = CatalogService()
        
        # Vérifie si au moins un critère avancé est utilisé
        has_advanced = any(advanced_criteria.values())

        try:
            if has_advanced:
                results = service.search_advanced(criteria=advanced_criteria, page=page)
                return Response({
                    "success": True,
                    "type": "advanced",
                    "criteria": advanced_criteria,
                    "page": page,
                    "count": len(results),
                    "results": results
                }, status=status.HTTP_200_OK)
            else:
                if not query:
                    return Response({
                        "success": False,
                        "detail": "Veuillez fournir un terme de recherche ('q') ou des critères avancés (title, author...)."
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                results = service.search(query=query, page=page)
                
                if not results:
                    return Response({
                        "success": True,
                        "type": "simple",
                        "query": query,
                        "page": page,
                        "count": 0,
                        "results": [],
                        "message": "Aucun résultat trouvé pour votre recherche."
                    }, status=status.HTTP_200_OK)
                
                return Response({
                    "success": True,
                    "type": "simple",
                    "query": query,
                    "page": page,
                    "count": len(results),
                    "results": results
                }, status=status.HTTP_200_OK)
                
        except Exception as e:
            logger.error(f"Erreur lors de la recherche: {str(e)}", exc_info=True)
            return Response({
                "success": False,
                "detail": "Une erreur est survenue lors de la recherche. Veuillez réessayer."
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class NoticeDetailView(APIView):
    """
    Endpoint de consultation d'une notice avec détails complets.
    GET /api/catalog/notice/<notice_id>/
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request, notice_id):
        service = CatalogService()
        notice = service.get_detail(notice_id)

        if not notice:
            return Response({
                "success": False,
                "detail": f"Notice #{notice_id} introuvable."
            }, status=status.HTTP_404_NOT_FOUND)

        similar = service.get_similar_notices(notice_id)
        
        return Response({
            "success": True,
            "notice": notice,
            "similar": similar
        }, status=status.HTTP_200_OK)
        

class SuggestView(APIView):
    """
    Endpoint pour les suggestions de recherche (autocomplete).
    GET /api/catalog/suggest/?q=info
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        query = request.query_params.get('q', '').strip()
        
        if not query or len(query) < 2:
            return Response({
                "success": True,
                "suggestions": []
            }, status=status.HTTP_200_OK)
        
        service = CatalogService()
        
        try:
            results = service.search(query=query, page=1)
            
            suggestions = []
            seen = set()
            
            for result in results[:10]:
                title = result.get('title', '')
                if title and title not in seen:
                    seen.add(title)
                    suggestions.append({
                        "title": title,
                        "id": result.get('id', ''),
                        "authors": result.get('authors', []),
                        "doc_type": result.get('doc_type', '')
                    })
            
            return Response({
                "success": True,
                "suggestions": suggestions
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Erreur lors de la suggestion: {str(e)}")
            return Response({
                "success": False,
                "detail": "Erreur lors de la génération des suggestions."
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserAccountView(APIView):
    """
    Endpoint pour récupérer les informations du compte utilisateur.
    GET /api/catalog/account/
    Nécessite authentification.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        service = CatalogService()
        
        session_id = getattr(request.user, 'pmb_session_id', None)
        
        if not session_id:
            return Response({
                "success": False,
                "detail": "Session PMB non disponible. Veuillez vous reconnecter."
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            account_info = service.get_user_account_info(session_id)
            if account_info:
                return Response({
                    "success": True,
                    "account": account_info
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    "success": False,
                    "detail": "Impossible de récupérer les informations du compte."
                }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Erreur get_account_info: {str(e)}")
            return Response({
                "success": False,
                "detail": "Erreur lors de la récupération du compte."
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AddReviewView(APIView):
    """
    Endpoint pour ajouter un avis sur un document.
    POST /api/catalog/notice/<notice_id>/review/
    Nécessite authentification.
    Body: {"note": 5, "comment": "Excellent livre !"}
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, notice_id):
        # Récupérer les données - supporter plusieurs formats
        note = request.data.get('note') or request.data.get('rating')
        comment = request.data.get('comment') or request.data.get('content') or ''
        
        # Log pour debug
        logger.info(f"AddReviewView - notice_id: {notice_id}")
        logger.info(f"AddReviewView - data: {request.data}")
        logger.info(f"AddReviewView - user: {request.user}")
        
        # Valider la note
        if note is None:
            return Response({
                "success": False,
                "detail": "La note est requise (1-5)."
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            note = int(note)
            if not 1 <= note <= 5:
                return Response({
                    "success": False,
                    "detail": "La note doit être comprise entre 1 et 5."
                }, status=status.HTTP_400_BAD_REQUEST)
        except ValueError:
            return Response({
                "success": False,
                "detail": "La note doit être un nombre."
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Récupérer le session_id
        session_id = getattr(request.user, 'pmb_session_id', None)
        
        # Si pas de session PMB, simuler un succès pour les utilisateurs locaux
        if not session_id:
            logger.warning(f"Session PMB non disponible pour {request.user.username}")
            return Response({
                "success": True,
                "message": "Avis enregistré (simulation - session PMB non disponible)",
                "notice_id": notice_id,
                "rating": note,
                "comment": comment,
                "simulated": True
            }, status=status.HTTP_201_CREATED)
        
        service = CatalogService()
        result = service.add_review(session_id, notice_id, note, comment)
        
        if result.get('success'):
            return Response(result, status=status.HTTP_201_CREATED)
        else:
            return Response(result, status=status.HTTP_400_BAD_REQUEST)


class SuggestPurchaseView(APIView):
    """
    Endpoint pour suggérer l'achat d'un document.
    POST /api/catalog/suggest/
    Nécessite authentification.
    Body: {"title": "...", "author": "...", "publisher": "...", "isbn": "...", "year": "...", "reason": "..."}
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        title = request.data.get('title', '').strip()
        if not title:
            return Response({
                "success": False,
                "detail": "Le titre du document est requis."
            }, status=status.HTTP_400_BAD_REQUEST)
        
        session_id = getattr(request.user, 'pmb_session_id', None)
        
        if not session_id:
            return Response({
                "success": True,
                "message": "Suggestion enregistrée localement (session PMB non disponible)",
                "simulated": True
            }, status=status.HTTP_201_CREATED)
        
        suggestion_data = {
            "title": title,
            "author": request.data.get('author', '').strip(),
            "publisher": request.data.get('publisher', '').strip(),
            "isbn": request.data.get('isbn', '').strip(),
            "year": request.data.get('year', '').strip(),
            "reason": request.data.get('reason', '').strip(),
            "comment": request.data.get('comment', '').strip(),
        }
        
        service = CatalogService()
        result = service.suggest_purchase(session_id, suggestion_data)
        
        if result.get('success'):
            return Response(result, status=status.HTTP_201_CREATED)
        else:
            return Response(result, status=status.HTTP_400_BAD_REQUEST)