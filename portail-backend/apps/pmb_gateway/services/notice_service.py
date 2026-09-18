# pmb_gateway/services/notice_service.py
import logging
import re
from typing import List, Optional, Dict, Any
from pmb_gateway.client import PMBClient
from catalog.dto import NoticeDTO

logger = logging.getLogger(__name__)


class PMBNoticeService:
    """Service d'interaction robuste avec le webservice PMB."""

    def __init__(self):
        self.client = PMBClient()

    def search_notices(self, query: str, page: int = 1, limit: int = 20) -> List[NoticeDTO]:
        """Effectue une recherche par mots-clés directement via PMB."""
        try:
            clean_query = query.strip()
            
            if not clean_query:
                return []
            
            # Recherche avec plusieurs tentatives
            search_id = None
            search_terms = [clean_query]
            
            if not clean_query.endswith("*"):
                search_terms.append(f"{clean_query}*")
            
            for term in search_terms:
                try:
                    res_search = self.client.call("pmbesOPACAnonymous_simpleSearch", {
                        "searchType": "0",
                        "searchTerm": term,
                        "pmbUserId": 0,
                        "OPACUserId": 0
                    })
                    
                    if isinstance(res_search, dict):
                        nb_results = int(res_search.get("nbResults", 0))
                        if nb_results > 0:
                            search_id = res_search.get("searchId")
                            break
                except Exception as e:
                    logger.warning(f"Tentative de recherche échouée pour '{term}': {str(e)}")
                    continue

            if not search_id:
                return []

            return self._fetch_records_by_search_id(search_id, page, limit)

        except Exception as e:
            logger.error(f"Erreur recherche PMB [{query}]: {str(e)}")
            return []

    def search_advanced(self, criteria: dict, page: int = 1, limit: int = 20) -> List[NoticeDTO]:
        """Effectue une recherche multicritères avancée via PMB."""
        try:
            search_payload = []
            
            field_mapping = {
                "title": "tit1",
                "author": "author",
                "year": "year",
                "isbn": "code",
                "subject": "mat"
            }
            
            for key, value in criteria.items():
                if key in field_mapping and value:
                    search_payload.append({
                        "field": field_mapping[key],
                        "operator": "contains",
                        "value": value
                    })

            if not search_payload:
                return []

            res_search = self.client.call("pmbesOPACAnonymous_advancedSearch", {
                "search": search_payload,
                "searchType": 1
            })
            
            search_id = None
            if isinstance(res_search, dict):
                nb_results = int(res_search.get("nbResults", 0))
                if nb_results > 0:
                    search_id = res_search.get("searchId")

            if not search_id:
                return []

            return self._fetch_records_by_search_id(search_id, page, limit)

        except Exception as e:
            logger.error(f"Erreur recherche avancée PMB [{criteria}]: {str(e)}")
            return []

    def _fetch_records_by_search_id(self, search_id: str, page: int, limit: int) -> List[NoticeDTO]:
        """Méthode utilitaire pour paginer et récupérer les résultats."""
        try:
            first_record = ((page - 1) * limit) + 1
            
            # UTILISATION DE pmbesOPACAnonymous_fetchSearchRecordsFull
            records = self.client.call("pmbesOPACAnonymous_fetchSearchRecordsFull", {
                "searchId": search_id,
                "firstRecord": first_record,
                "recordCount": limit,
                "recordCharset": "utf-8"
            }) or []

            results = []
            if isinstance(records, list):
                for item in records:
                    if isinstance(item, dict):
                        notice_id = str(item.get("noticeId") or item.get("id") or "")
                        if notice_id:
                            notice_dto = self.get_notice_by_id(notice_id)
                            if notice_dto and notice_dto not in results:
                                results.append(notice_dto)
            return results
        except Exception as e:
            logger.error(f"Erreur fetch records PMB [Search {search_id}]: {str(e)}")
            return []

    def get_notice_by_id(self, notice_id: str) -> Optional[NoticeDTO]:
        """Récupère une notice spécifique et ses exemplaires depuis PMB avec TOUS les détails."""
        try:
            nid = int(notice_id)
            
            # UTILISATION DE pmbesOPACAnonymous_fetchNoticeListFull
            notices_response = self.client.call("pmbesOPACAnonymous_fetchNoticeListFull", {
                "noticelist": [nid],
                "recordFormat": 1,
                "recordCharset": "utf-8",
                "includeLinks": 1,
                "nbResa": 1
            })
            
            if not notices_response or not isinstance(notices_response, list) or len(notices_response) == 0:
                logger.warning(f"Notice #{nid} introuvable dans PMB.")
                return None
                
            notice_data = notices_response[0]
            
            # UTILISATION DE pmbesOPACAnonymous_fetch_notice_items
            items_response = self.client.call("pmbesOPACAnonymous_fetch_notice_items", {
                "noticeid": nid
            })
            
            items = []
            availability_status = "Indisponible"
            location = "Non spécifié"
            available_count = 0
            
            if isinstance(items_response, list):
                for item in items_response:
                    statut = str(item.get("statut", ""))
                    statut_libelle = str(item.get("statut_libelle", "")).lower()
                    
                    is_available = (
                        statut == "1" or 
                        "disponible" in statut_libelle or
                        "en rayon" in statut_libelle or
                        "sur place" in statut_libelle
                    )
                    
                    if is_available:
                        available_count += 1
                    
                    item_info = {
                        "cb": item.get("cb", ""),
                        "location": item.get("location_libelle", item.get("location", "")),
                        "section": item.get("section_libelle", item.get("section", "")),
                        "cote": item.get("cote", ""),
                        "status": statut_libelle or statut,
                        "is_available": is_available,
                        "loan_type": item.get("pret_type_libelle", item.get("pret_type", "")),
                        "barcode": item.get("barcode", item.get("cb", ""))
                    }
                    items.append(item_info)
                    
                    if is_available:
                        availability_status = "Disponible"
                    if item_info["location"] and location == "Non spécifié":
                        location = item_info["location"]
            
            # 3. Récupération de l'auteur complet
            author_info = {}
            try:
                author_id = notice_data.get("author_id")
                if author_id:
                    author_response = self.client.call("pmbesOPACAnonymous_get_author_information_and_notices", {
                        "author_id": author_id
                    })
                    if author_response and isinstance(author_response, dict):
                        author_info = author_response
            except Exception as e:
                logger.debug(f"Impossible de récupérer les infos de l'auteur: {str(e)}")
            
            # 4. Récupération de l'éditeur
            publisher_info = {}
            try:
                publisher_id = notice_data.get("publisher_id")
                if publisher_id:
                    publisher_response = self.client.call("pmbesOPACAnonymous_get_publisher_information_and_notices", {
                        "publisher_id": publisher_id
                    })
                    if publisher_response and isinstance(publisher_response, dict):
                        publisher_info = publisher_response
            except Exception as e:
                logger.debug(f"Impossible de récupérer les infos de l'éditeur: {str(e)}")
            
            # 5. Récupération de la collection
            collection_info = {}
            try:
                collection_id = notice_data.get("collection_id")
                if collection_id:
                    collection_response = self.client.call("pmbesOPACAnonymous_get_collection_information_and_notices", {
                        "collection_id": collection_id
                    })
                    if collection_response and isinstance(collection_response, dict):
                        collection_info = collection_response
            except Exception as e:
                logger.debug(f"Impossible de récupérer les infos de la collection: {str(e)}")
            
            # 6. Extraction des champs
            title = notice_data.get("title") or notice_data.get("tit1") or notice_data.get("titre") or f"Notice #{nid}"
            
            authors = self._extract_authors(notice_data)
            
            if author_info and author_info.get('author_name'):
                author_name = author_info.get('author_name')
                if author_name not in authors:
                    authors.append(author_name)
            
            publisher = notice_data.get("publisher") or notice_data.get("editeur") or ""
            if publisher_info and publisher_info.get('publisher_name'):
                publisher = publisher_info.get('publisher_name')
            
            year = notice_data.get("year") or notice_data.get("year_pub") or notice_data.get("annee") or None
            
            isbn = notice_data.get("code") or notice_data.get("isbn") or notice_data.get("isbd") or ""
            
            summary = notice_data.get("summary") or notice_data.get("n_resume") or notice_data.get("resume") or ""
            
            doc_type = notice_data.get("typdoc") or notice_data.get("type") or "Livre"
            
            categories = self._extract_categories(notice_data)
            subjects = self._extract_subjects(notice_data)
            
            edition = notice_data.get("edition") or notice_data.get("ed1") or ""
            language = notice_data.get("lang_code") or notice_data.get("langue") or "Français"
            pages = self._extract_pages(notice_data)
            collection = notice_data.get("collection") or notice_data.get("coll1") or ""
            cote = notice_data.get("cote") or notice_data.get("class") or ""
            
            contributors = self._extract_contributors(notice_data)
            
            logger.info(f"Notice {nid} récupérée avec succès: {title}")
            
            return NoticeDTO(
                id=str(notice_data.get("id", nid)),
                title=title,
                authors=authors,
                publisher=publisher,
                publication_year=year,
                isbn=isbn,
                summary=summary,
                categories=categories,
                doc_type=doc_type,
                availability_status=availability_status,
                location=location,
                items=items,
                edition=edition,
                language=language,
                pages=pages,
                collection=collection,
                subjects=subjects,
                contributors=contributors,
                url_cover=notice_data.get("url_cover", ""),
                url_full_text=notice_data.get("url_texte_integral", ""),
                is_available_for_loan=available_count > 0,
                can_be_reserved=True
            )

        except Exception as e:
            logger.error(f"Erreur get_notice_by_id #{notice_id}: {str(e)}", exc_info=True)
            return None

    # ─── NOUVELLES MÉTHODES ───────────────────────────────────────

    def get_user_account_info(self, session_id: str) -> Optional[Dict[str, Any]]:
        """
        Récupère les informations du compte utilisateur via pmbesOPACEmpr_get_account_info.
        Affiche: Nom, prénom, adresse, date de fin d'abonnement.
        """
        try:
            if not session_id:
                logger.warning("Session ID manquant pour get_user_account_info")
                return None
            
            result = self.client.call("pmbesOPACEmpr_get_account_info", {
                "session_id": session_id
            })
            
            if result and isinstance(result, dict):
                return {
                    "id": result.get("empr_id"),
                    "username": result.get("empr_login"),
                    "first_name": result.get("empr_prenom"),
                    "last_name": result.get("empr_nom"),
                    "email": result.get("empr_mail"),
                    "phone": result.get("empr_tel"),
                    "address": result.get("empr_adr1"),
                    "city": result.get("empr_ville"),
                    "subscription_end_date": result.get("empr_date_fin_abonnement"),
                    "is_active": result.get("empr_actif") == "1",
                }
            return None
        except Exception as e:
            logger.error(f"Erreur get_user_account_info: {str(e)}")
            return None

    def add_review(self, session_id: str, notice_id: str, note: int, comment: str) -> Dict[str, Any]:
        """
        Ajoute une note et un commentaire sur un document via pmbesOPACEmpr_add_review.
        
        Args:
            session_id: ID de session PMB de l'utilisateur connecté
            notice_id: ID de la notice concernée
            note: Note de 1 à 5
            comment: Commentaire textuel
            
        Returns:
            Dict avec le résultat de l'opération
        """
        try:
            if not session_id:
                return {"success": False, "error": "Utilisateur non connecté"}
            
            if not 1 <= note <= 5:
                return {"success": False, "error": "La note doit être comprise entre 1 et 5"}
            
            result = self.client.call("pmbesOPACEmpr_add_review", {
                "session_id": session_id,
                "notice_id": int(notice_id),
                "note": note,
                "comment": comment,
                "subject": ""
            })
            
            if result and isinstance(result, dict):
                if result.get("success") == "1" or result.get("status") == "ok":
                    return {"success": True, "message": "Avis ajouté avec succès"}
                else:
                    return {"success": False, "error": result.get("error", "Erreur lors de l'ajout de l'avis")}
            
            return {"success": False, "error": "Réponse inattendue de PMB"}
            
        except Exception as e:
            logger.error(f"Erreur add_review pour notice {notice_id}: {str(e)}")
            return {"success": False, "error": str(e)}

    def suggest_purchase(self, session_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Suggère l'achat d'un livre à la bibliothèque via pmbesOPACEmpr_add_suggestion2.
        
        Args:
            session_id: ID de session PMB de l'utilisateur connecté
            data: Dictionnaire contenant les champs du formulaire de suggestion
            
        Retourne:
            Dict avec le résultat de l'opération
        """
        try:
            if not session_id:
                return {"success": False, "error": "Utilisateur non connecté"}
            
            # Champs recommandés pour la suggestion
            suggestion_data = {
                "title": data.get("title", ""),
                "author": data.get("author", ""),
                "publisher": data.get("publisher", ""),
                "isbn": data.get("isbn", ""),
                "year": data.get("year", ""),
                "reason": data.get("reason", ""),  # Raison de la suggestion
                "comment": data.get("comment", ""),
            }
            
            result = self.client.call("pmbesOPACEmpr_add_suggestion2", {
                "session_id": session_id,
                "suggestion": suggestion_data
            })
            
            if result and isinstance(result, dict):
                if result.get("success") == "1" or result.get("status") == "ok":
                    return {"success": True, "message": "Suggestion d'achat envoyée avec succès"}
                else:
                    return {"success": False, "error": result.get("error", "Erreur lors de l'envoi de la suggestion")}
            
            return {"success": False, "error": "Réponse inattendue de PMB"}
            
        except Exception as e:
            logger.error(f"Erreur suggest_purchase: {str(e)}")
            return {"success": False, "error": str(e)}

    # ─── MÉTHODES D'EXTRACTION (existantes) ──────────────────────

    def _extract_authors(self, notice_data: dict) -> List[str]:
        """Extrait les auteurs de la notice."""
        authors = []
        
        if notice_data.get("author"):
            authors.append(notice_data["author"])
        if notice_data.get("auteur_principal"):
            if notice_data["auteur_principal"] not in authors:
                authors.append(notice_data["auteur_principal"])
        if notice_data.get("auteurs_secondaires"):
            if isinstance(notice_data["auteurs_secondaires"], list):
                for author in notice_data["auteurs_secondaires"]:
                    if author and author not in authors:
                        authors.append(author)
            else:
                for author in notice_data["auteurs_secondaires"].split("|"):
                    if author.strip() and author not in authors:
                        authors.append(author.strip())
        
        return authors if authors else ["Auteur inconnu"]

    def _extract_categories(self, notice_data: dict) -> List[str]:
        """Extrait les catégories de la notice."""
        categories = []
        
        if notice_data.get("categories"):
            if isinstance(notice_data["categories"], list):
                categories.extend(notice_data["categories"])
            else:
                categories = notice_data["categories"].split("|")
        
        if notice_data.get("matieres") and not categories:
            if isinstance(notice_data["matieres"], list):
                categories.extend(notice_data["matieres"])
            else:
                categories = notice_data["matieres"].split("|")
        
        return [cat.strip() for cat in categories if cat.strip()]

    def _extract_subjects(self, notice_data: dict) -> List[str]:
        """Extrait les sujets de la notice."""
        subjects = []
        
        if notice_data.get("subjects"):
            if isinstance(notice_data["subjects"], list):
                subjects.extend(notice_data["subjects"])
            else:
                subjects = notice_data["subjects"].split("|")
        
        if notice_data.get("matieres") and not subjects:
            if isinstance(notice_data["matieres"], list):
                subjects.extend(notice_data["matieres"])
            else:
                subjects = notice_data["matieres"].split("|")
        
        return [subj.strip() for subj in subjects if subj.strip()]

    def _extract_contributors(self, notice_data: dict) -> List[str]:
        """Extrait les contributeurs de la notice."""
        contributors = []
        
        if notice_data.get("contributors"):
            if isinstance(notice_data["contributors"], list):
                contributors.extend(notice_data["contributors"])
            else:
                contributors = notice_data["contributors"].split("|")
        
        return [cont.strip() for cont in contributors if cont.strip()]

    def _extract_pages(self, notice_data: dict) -> Optional[int]:
        """Extrait le nombre de pages."""
        pages_str = notice_data.get("pages") or notice_data.get("nb_pages") or notice_data.get("nombre_pages") or ""
        if pages_str:
            try:
                match = re.search(r'(\d+)', str(pages_str))
                if match:
                    return int(match.group(1))
            except:
                pass
        return None