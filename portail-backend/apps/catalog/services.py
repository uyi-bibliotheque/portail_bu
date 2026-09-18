# catalog/services.py
import logging
from typing import List, Optional, Dict, Any
from django.core.cache import cache
from pmb_gateway.services.notice_service import PMBNoticeService 
from catalog.dto import NoticeDTO

logger = logging.getLogger(__name__)


class CatalogService:
    """Service Métier gérant la recherche et le cache Redis."""

    def __init__(self):
        self.pmb_notice_service = PMBNoticeService()
        self.CACHE_TTL = 3600  # 1 heure

    def search(self, query: str, page: int = 1) -> List[Dict[str, Any]]:
        """Effectue une recherche avec stratégie Cache-Aside."""
        if not query or len(query.strip()) < 2:
            return []

        cache_key = f"catalog_search_{query.strip().lower()}_p{page}"
        
        cached_results = cache.get(cache_key)
        if cached_results is not None:
            logger.info(f"[CACHE HIT] Recherche catalogue : '{query}'")
            return cached_results

        logger.info(f"[CACHE MISS] Interrogation PMB : '{query}'")
        notices_dto = self.pmb_notice_service.search_notices(query, page=page)
        results = [notice.to_dict() for notice in notices_dto]

        if results:
            cache.set(cache_key, results, timeout=self.CACHE_TTL)

        return results

    def search_advanced(self, criteria: Dict[str, Any], page: int = 1) -> List[Dict[str, Any]]:
        """Effectue une recherche avancée avec stratégie Cache-Aside."""
        if not criteria:
            return []

        criteria_str = "_".join([f"{k}-{v}" for k, v in sorted(criteria.items()) if v])
        cache_key = f"catalog_search_adv_{criteria_str}_p{page}"
        
        cached_results = cache.get(cache_key)
        if cached_results is not None:
            logger.info(f"[CACHE HIT] Recherche avancée : {criteria}")
            return cached_results

        logger.info(f"[CACHE MISS] Interrogation PMB avancée : {criteria}")
        notices_dto = self.pmb_notice_service.search_advanced(criteria, page=page)
        results = [notice.to_dict() for notice in notices_dto]

        if results:
            cache.set(cache_key, results, timeout=self.CACHE_TTL)

        return results

    def get_detail(self, notice_id: str) -> Optional[Dict[str, Any]]:
        """Récupère le détail d'une notice avec mise en cache."""
        cache_key = f"notice_detail_{notice_id}"
        
        cached_detail = cache.get(cache_key)
        if cached_detail:
            logger.info(f"[CACHE HIT] Détail notice {notice_id}")
            return cached_detail

        logger.info(f"[CACHE MISS] Détail notice {notice_id}")
        notice_dto = self.pmb_notice_service.get_notice_by_id(notice_id)
        if notice_dto:
            detail = notice_dto.to_dict()
            cache.set(cache_key, detail, timeout=self.CACHE_TTL)
            return detail

        return None

    def get_similar_notices(self, notice_id: str, limit: int = 5) -> List[Dict[str, Any]]:
        """Récupère des notices similaires à celle donnée."""
        try:
            notice = self.get_detail(notice_id)
            if not notice:
                return []
            
            categories = notice.get('categories', [])
            subjects = notice.get('subjects', [])
            
            search_criteria = {}
            if categories:
                search_criteria['subject'] = categories[0]
            elif subjects:
                search_criteria['subject'] = subjects[0]
            else:
                title_parts = notice.get('title', '').split()
                if title_parts:
                    search_criteria['title'] = title_parts[0]
            
            if search_criteria:
                similar = self.search_advanced(search_criteria, page=1)
                similar = [s for s in similar if s['id'] != notice_id]
                return similar[:limit]
            
            return []
        except Exception as e:
            logger.error(f"Erreur get_similar_notices pour {notice_id}: {str(e)}")
            return []

    # ─── NOUVELLES MÉTHODES D'INTÉGRATION ────────────────────────

    def get_user_account_info(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Récupère les informations du compte utilisateur via PMB."""
        try:
            return self.pmb_notice_service.get_user_account_info(session_id)
        except Exception as e:
            logger.error(f"Erreur get_user_account_info: {str(e)}")
            return None

    def add_review(self, session_id: str, notice_id: str, note: int, comment: str) -> Dict[str, Any]:
        """Ajoute un avis sur un document."""
        try:
            return self.pmb_notice_service.add_review(session_id, notice_id, note, comment)
        except Exception as e:
            logger.error(f"Erreur add_review: {str(e)}")
            return {"success": False, "error": str(e)}

    def suggest_purchase(self, session_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Suggère l'achat d'un document."""
        try:
            return self.pmb_notice_service.suggest_purchase(session_id, data)
        except Exception as e:
            logger.error(f"Erreur suggest_purchase: {str(e)}")
            return {"success": False, "error": str(e)}