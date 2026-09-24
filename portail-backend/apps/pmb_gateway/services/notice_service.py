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

    # ─────────────────────────────────────────────────────────────
    # RECHERCHE SIMPLE
    # ─────────────────────────────────────────────────────────────

    def search_notices(
        self,
        query: str,
        page: int = 1,
        limit: int = 20
    ) -> List[NoticeDTO]:
        """Effectue une recherche par mots-clés directement via PMB."""
        try:
            clean_query = query.strip()

            if not clean_query:
                return []

            search_id = None

            # Recherche avec plusieurs tentatives
            search_terms = [clean_query]

            if not clean_query.endswith("*"):
                search_terms.append(f"{clean_query}*")

            for term in search_terms:
                try:
                    res_search = self.client.call(
                        "pmbesOPACAnonymous_simpleSearch",
                        {
                            "searchType": "0",
                            "searchTerm": term,
                            "pmbUserId": 0,
                            "OPACUserId": 0
                        }
                    )

                    if isinstance(res_search, dict):
                        nb_results = int(
                            res_search.get("nbResults", 0)
                        )

                        if nb_results > 0:
                            search_id = res_search.get("searchId")
                            break

                except Exception as e:
                    logger.warning(
                        f"Tentative de recherche échouée "
                        f"pour '{term}': {str(e)}"
                    )
                    continue

            if not search_id:
                return []

            return self._fetch_records_by_search_id(
                search_id,
                page,
                limit
            )

        except Exception as e:
            logger.error(
                f"Erreur recherche PMB [{query}]: {str(e)}",
                exc_info=True
            )
            return []

    # ─────────────────────────────────────────────────────────────
    # RECHERCHE AVANCÉE
    # ─────────────────────────────────────────────────────────────

    def search_advanced(
        self,
        criteria: dict,
        page: int = 1,
        limit: int = 20
    ) -> List[NoticeDTO]:
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
                    search_payload.append(
                        {
                            "field": field_mapping[key],
                            "operator": "contains",
                            "value": value
                        }
                    )

            if not search_payload:
                return []

            res_search = self.client.call(
                "pmbesOPACAnonymous_advancedSearch",
                {
                    "search": search_payload,
                    "searchType": 1
                }
            )

            search_id = None

            if isinstance(res_search, dict):
                nb_results = int(
                    res_search.get("nbResults", 0)
                )

                if nb_results > 0:
                    search_id = res_search.get("searchId")

            if not search_id:
                return []

            return self._fetch_records_by_search_id(
                search_id,
                page,
                limit
            )

        except Exception as e:
            logger.error(
                f"Erreur recherche avancée PMB "
                f"[{criteria}]: {str(e)}",
                exc_info=True
            )
            return []

    # ─────────────────────────────────────────────────────────────
    # RÉCUPÉRATION DES RÉSULTATS D'UNE RECHERCHE
    # ─────────────────────────────────────────────────────────────

    def _fetch_records_by_search_id(
        self,
        search_id: str,
        page: int,
        limit: int
    ) -> List[NoticeDTO]:
        """Récupère les notices correspondant à une recherche PMB."""
        try:
            # PMB utilise une indexation à partir de 0
            first_record = (page - 1) * limit

            records = self.client.call(
                "pmbesOPACAnonymous_fetchSearchRecordsFull",
                {
                    "searchId": search_id,
                    "firstRecord": first_record,
                    "recordCount": limit,
                    "recordCharset": "utf-8"
                }
            ) or []

            if not isinstance(records, list):
                logger.warning(
                    f"Réponse inattendue de PMB pour la recherche "
                    f"{search_id}: {type(records)}"
                )
                return []

            results = []

            for item in records:
                if not isinstance(item, dict):
                    continue

                notice_id = str(
                    item.get("noticeId")
                    or item.get("id")
                    or ""
                ).strip()

                if not notice_id:
                    continue

                # fetchSearchRecordsFull retourne les données
                # bibliographiques dans noticeContent.
                notice_content = item.get("noticeContent")

                if isinstance(notice_content, dict):
                    notice_data = self._parse_pmb_notice_content(
                        notice_content
                    )

                    # Les exemplaires sont déjà retournés par PMB.
                    notice_items = item.get(
                        "noticeItems",
                        []
                    )

                    if notice_data:
                        notice_dto = (
                            self._build_notice_dto_from_search_result(
                                notice_data=notice_data,
                                notice_id=notice_id,
                                notice_items=notice_items
                            )
                        )

                        if notice_dto:
                            results.append(notice_dto)
                            continue

                # Fallback :
                # si noticeContent n'est pas exploitable,
                # on récupère la notice complète par son ID.
                notice_dto = self.get_notice_by_id(
                    notice_id
                )

                if (
                    notice_dto
                    and notice_dto not in results
                ):
                    results.append(notice_dto)

            logger.info(
                f"Recherche PMB {search_id}: "
                f"{len(results)} notice(s) récupérée(s)"
            )

            return results

        except Exception as e:
            logger.error(
                f"Erreur fetch records PMB "
                f"[Search {search_id}]: {str(e)}",
                exc_info=True
            )
            return []

    # ─────────────────────────────────────────────────────────────
    # PARSING DU CONTENU MARC PMB
    # ─────────────────────────────────────────────────────────────

    def _parse_pmb_notice_content(
        self,
        notice_content: dict
    ) -> dict:
        """
        Transforme la structure MARC retournée par PMB
        en dictionnaire exploitable par notre application.
        """

        fields = notice_content.get("f", {})

        def first_value(
            tag: str,
            subfield: str = "a",
            default=""
        ):
            values = fields.get(tag, [])

            if not isinstance(values, list) or not values:
                return default

            value = values[0]

            if isinstance(value, dict):
                return value.get(
                    subfield,
                    default
                )

            return default

        # ─────────────────────────────────────────────
        # Champs bibliographiques
        # ─────────────────────────────────────────────

        # Titre : 200$a
        title = first_value(
            "200",
            "a",
            ""
        )

        # ISBN : 010$a
        isbn = first_value(
            "010",
            "a",
            ""
        )

        # Édition : 205$a
        edition = first_value(
            "205",
            "a",
            ""
        )

        # Langue : 101$a
        language_code = first_value(
            "101",
            "a",
            ""
        )

        # Pagination : 215$a
        pages_raw = first_value(
            "215",
            "a",
            ""
        )

        # Année : 210$d
        year = first_value(
            "210",
            "d",
            ""
        )

        # Éditeur : 210$c
        publisher = first_value(
            "210",
            "c",
            ""
        )

        # Lieu de publication : 210$a
        publication_place = first_value(
            "210",
            "a",
            ""
        )

        # ─────────────────────────────────────────────
        # AUTEURS
        # ─────────────────────────────────────────────

        authors = []

        for tag in ("700", "701"):
            for author in fields.get(tag, []):
                if not isinstance(author, dict):
                    continue

                last_name = str(
                    author.get("a", "")
                ).strip()

                first_name = str(
                    author.get("b", "")
                ).strip()

                if last_name and first_name:
                    full_name = (
                        f"{last_name} {first_name}"
                    )
                else:
                    full_name = (
                        last_name
                        or first_name
                    )

                if (
                    full_name
                    and full_name not in authors
                ):
                    authors.append(full_name)

        # ─────────────────────────────────────────────
        # COUVERTURE
        # ─────────────────────────────────────────────

        cover_url = first_value(
            "896",
            "a",
            ""
        )

        # ─────────────────────────────────────────────
        # TYPE DE DOCUMENT
        # ─────────────────────────────────────────────

        header = notice_content.get(
            "header",
            {}
        )

        doc_type = header.get(
            "dt",
            "a"
        )

        # ─────────────────────────────────────────────
        # LANGUE
        # ─────────────────────────────────────────────

        language_map = {
            "fre": "Français",
            "fra": "Français",
            "eng": "Anglais",
            "spa": "Espagnol",
            "ger": "Allemand",
            "deu": "Allemand",
            "ita": "Italien",
        }

        language = language_map.get(
            str(language_code).lower(),
            language_code or "Français"
        )

        # ─────────────────────────────────────────────
        # NOMBRE DE PAGES
        # ─────────────────────────────────────────────

        pages = None

        if pages_raw:
            match = re.search(
                r"(\d+)",
                str(pages_raw)
            )

            if match:
                pages = int(
                    match.group(1)
                )

        # ─────────────────────────────────────────────
        # ANNÉE
        # ─────────────────────────────────────────────

        publication_year = None

        if year:
            match = re.search(
                r"(\d{4})",
                str(year)
            )

            if match:
                publication_year = int(
                    match.group(1)
                )

        return {
            "id": str(
                notice_content.get(
                    "id",
                    ""
                )
            ),
            "title": (
                title
                or "Titre inconnu"
            ),
            "authors": (
                authors
                or ["Auteur inconnu"]
            ),
            "publisher": publisher,
            "publication_year": publication_year,
            "isbn": isbn,
            "edition": edition,
            "language": language,
            "pages": pages,
            "cover_url": cover_url,
            "publication_place": publication_place,
            "doc_type": (
                "Livre"
                if doc_type == "a"
                else doc_type
            ),
        }

    # ─────────────────────────────────────────────────────────────
    # CONSTRUCTION DU DTO DEPUIS UNE RECHERCHE
    # ─────────────────────────────────────────────────────────────

    def _build_notice_dto_from_search_result(
        self,
        notice_data: dict,
        notice_id: str,
        notice_items: list
    ) -> Optional[NoticeDTO]:
        """Construit un NoticeDTO à partir du résultat PMB."""

        try:
            items = []
            available_count = 0
            location = "Non spécifié"
            availability_status = "Indisponible"

            if isinstance(
                notice_items,
                list
            ):
                for item in notice_items:

                    if not isinstance(
                        item,
                        dict
                    ):
                        continue

                    statut = str(
                        item.get(
                            "statut",
                            ""
                        )
                    )

                    statut_libelle = str(
                        item.get(
                            "statut_libelle",
                            ""
                        )
                    ).lower()

                    # PMB peut retourner plusieurs formes
                    # de statut selon la configuration.
                    is_available = (
                        statut == "1"
                        or "disponible"
                        in statut_libelle
                        or "en rayon"
                        in statut_libelle
                    )

                    if is_available:
                        available_count += 1
                        availability_status = (
                            "Disponible"
                        )

                    item_location = (
                        item.get(
                            "location_libelle"
                        )
                        or item.get(
                            "location"
                        )
                        or ""
                    )

                    item_section = (
                        item.get(
                            "section_libelle"
                        )
                        or item.get(
                            "section"
                        )
                        or ""
                    )

                    item_info = {
                        "cb": item.get(
                            "cb",
                            ""
                        ),
                        "location": item_location,
                        "section": item_section,
                        "cote": item.get(
                            "cote",
                            ""
                        ),
                        "status": (
                            statut_libelle
                            or statut
                        ),
                        "is_available": (
                            is_available
                        ),
                        "loan_type": item.get(
                            "pret_type_libelle",
                            item.get(
                                "pret_type",
                                ""
                            )
                        ),
                        "barcode": item.get(
                            "barcode",
                            item.get(
                                "cb",
                                ""
                            )
                        )
                    }

                    items.append(
                        item_info
                    )

                    if (
                        item_location
                        and location
                        == "Non spécifié"
                    ):
                        location = item_location

            return NoticeDTO(
                id=str(notice_id),

                title=notice_data.get(
                    "title",
                    "Titre inconnu"
                ),

                authors=notice_data.get(
                    "authors",
                    ["Auteur inconnu"]
                ),

                publisher=notice_data.get(
                    "publisher",
                    ""
                ),

                publication_year=(
                    notice_data.get(
                        "publication_year"
                    )
                ),

                isbn=notice_data.get(
                    "isbn",
                    ""
                ),

                summary="",

                categories=[],

                doc_type=notice_data.get(
                    "doc_type",
                    "Livre"
                ),

                availability_status=(
                    availability_status
                ),

                location=location,

                items=items,

                edition=notice_data.get(
                    "edition",
                    ""
                ),

                language=notice_data.get(
                    "language",
                    "Français"
                ),

                pages=notice_data.get(
                    "pages"
                ),

                collection="",

                subjects=[],

                contributors=[],

                url_cover=notice_data.get(
                    "cover_url",
                    ""
                ),

                url_full_text="",

                is_available_for_loan=(
                    available_count > 0
                ),

                can_be_reserved=True
            )

        except Exception as e:
            logger.error(
                f"Erreur construction NoticeDTO "
                f"#{notice_id}: {str(e)}",
                exc_info=True
            )
            return None

    # ─────────────────────────────────────────────────────────────
    # RÉCUPÉRATION D'UNE NOTICE PAR ID
    # ─────────────────────────────────────────────────────────────

    def get_notice_by_id(
        self,
        notice_id: str
    ) -> Optional[NoticeDTO]:
        """
        Récupère une notice spécifique et ses exemplaires
        depuis PMB avec tous les détails disponibles.
        """
        try:
            nid = int(notice_id)

            notices_response = self.client.call(
                "pmbesOPACAnonymous_fetchNoticeListFull",
                {
                    "noticelist": [nid],
                    "recordFormat": 1,
                    "recordCharset": "utf-8",
                    "includeLinks": 1,
                    "nbResa": 1
                }
            )

            if (
                not notices_response
                or not isinstance(
                    notices_response,
                    list
                )
                or len(notices_response) == 0
            ):
                logger.warning(
                    f"Notice #{nid} introuvable dans PMB."
                )
                return None

            notice_data = notices_response[0]

            items_response = self.client.call(
                "pmbesOPACAnonymous_fetch_notice_items",
                {
                    "noticeid": nid
                }
            )

            items = []
            availability_status = "Indisponible"
            location = "Non spécifié"
            available_count = 0

            if isinstance(
                items_response,
                list
            ):
                for item in items_response:

                    statut = str(
                        item.get(
                            "statut",
                            ""
                        )
                    )

                    statut_libelle = str(
                        item.get(
                            "statut_libelle",
                            ""
                        )
                    ).lower()

                    is_available = (
                        statut == "1"
                        or "disponible"
                        in statut_libelle
                        or "en rayon"
                        in statut_libelle
                        or "sur place"
                        in statut_libelle
                    )

                    if is_available:
                        available_count += 1
                        availability_status = (
                            "Disponible"
                        )

                    item_info = {
                        "cb": item.get(
                            "cb",
                            ""
                        ),
                        "location": item.get(
                            "location_libelle",
                            item.get(
                                "location",
                                ""
                            )
                        ),
                        "section": item.get(
                            "section_libelle",
                            item.get(
                                "section",
                                ""
                            )
                        ),
                        "cote": item.get(
                            "cote",
                            ""
                        ),
                        "status": (
                            statut_libelle
                            or statut
                        ),
                        "is_available": (
                            is_available
                        ),
                        "loan_type": item.get(
                            "pret_type_libelle",
                            item.get(
                                "pret_type",
                                ""
                            )
                        ),
                        "barcode": item.get(
                            "barcode",
                            item.get(
                                "cb",
                                ""
                            )
                        )
                    }

                    items.append(
                        item_info
                    )

                    if (
                        item_info["location"]
                        and location
                        == "Non spécifié"
                    ):
                        location = (
                            item_info["location"]
                        )

            # ─────────────────────────────────────────
            # AUTEUR
            # ─────────────────────────────────────────

            author_info = {}

            try:
                author_id = notice_data.get(
                    "author_id"
                )

                if author_id:
                    author_response = self.client.call(
                        "pmbesOPACAnonymous_get_author_information_and_notices",
                        {
                            "author_id": author_id
                        }
                    )

                    if (
                        author_response
                        and isinstance(
                            author_response,
                            dict
                        )
                    ):
                        author_info = (
                            author_response
                        )

            except Exception as e:
                logger.debug(
                    "Impossible de récupérer "
                    f"les infos de l'auteur: {str(e)}"
                )

            # ─────────────────────────────────────────
            # ÉDITEUR
            # ─────────────────────────────────────────

            publisher_info = {}

            try:
                publisher_id = notice_data.get(
                    "publisher_id"
                )

                if publisher_id:
                    publisher_response = self.client.call(
                        "pmbesOPACAnonymous_get_publisher_information_and_notices",
                        {
                            "publisher_id": publisher_id
                        }
                    )

                    if (
                        publisher_response
                        and isinstance(
                            publisher_response,
                            dict
                        )
                    ):
                        publisher_info = (
                            publisher_response
                        )

            except Exception as e:
                logger.debug(
                    "Impossible de récupérer "
                    f"les infos de l'éditeur: {str(e)}"
                )

            # ─────────────────────────────────────────
            # COLLECTION
            # ─────────────────────────────────────────

            collection_info = {}

            try:
                collection_id = notice_data.get(
                    "collection_id"
                )

                if collection_id:
                    collection_response = self.client.call(
                        "pmbesOPACAnonymous_get_collection_information_and_notices",
                        {
                            "collection_id": collection_id
                        }
                    )

                    if (
                        collection_response
                        and isinstance(
                            collection_response,
                            dict
                        )
                    ):
                        collection_info = (
                            collection_response
                        )

            except Exception as e:
                logger.debug(
                    "Impossible de récupérer "
                    f"les infos de la collection: {str(e)}"
                )

            # ─────────────────────────────────────────
            # EXTRACTION DES CHAMPS
            # ─────────────────────────────────────────

            title = (
                notice_data.get("title")
                or notice_data.get("tit1")
                or notice_data.get("titre")
                or f"Notice #{nid}"
            )

            authors = self._extract_authors(
                notice_data
            )

            if (
                author_info
                and author_info.get(
                    "author_name"
                )
            ):
                author_name = author_info.get(
                    "author_name"
                )

                if author_name not in authors:
                    authors.append(
                        author_name
                    )

            publisher = (
                notice_data.get(
                    "publisher"
                )
                or notice_data.get(
                    "editeur"
                )
                or ""
            )

            if (
                publisher_info
                and publisher_info.get(
                    "publisher_name"
                )
            ):
                publisher = publisher_info.get(
                    "publisher_name"
                )

            year = (
                notice_data.get("year")
                or notice_data.get("year_pub")
                or notice_data.get("annee")
                or None
            )

            isbn = (
                notice_data.get("code")
                or notice_data.get("isbn")
                or notice_data.get("isbd")
                or ""
            )

            summary = (
                notice_data.get("summary")
                or notice_data.get("n_resume")
                or notice_data.get("resume")
                or ""
            )

            doc_type = (
                notice_data.get("typdoc")
                or notice_data.get("type")
                or "Livre"
            )

            categories = (
                self._extract_categories(
                    notice_data
                )
            )

            subjects = (
                self._extract_subjects(
                    notice_data
                )
            )

            edition = (
                notice_data.get("edition")
                or notice_data.get("ed1")
                or ""
            )

            language = (
                notice_data.get("lang_code")
                or notice_data.get("langue")
                or "Français"
            )

            pages = self._extract_pages(
                notice_data
            )

            collection = (
                notice_data.get("collection")
                or notice_data.get("coll1")
                or ""
            )

            contributors = (
                self._extract_contributors(
                    notice_data
                )
            )

            logger.info(
                f"Notice {nid} récupérée avec succès: "
                f"{title}"
            )

            return NoticeDTO(
                id=str(
                    notice_data.get(
                        "id",
                        nid
                    )
                ),
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
                url_cover=notice_data.get(
                    "url_cover",
                    ""
                ),
                url_full_text=notice_data.get(
                    "url_texte_integral",
                    ""
                ),
                is_available_for_loan=(
                    available_count > 0
                ),
                can_be_reserved=True
            )

        except Exception as e:
            logger.error(
                f"Erreur get_notice_by_id "
                f"#{notice_id}: {str(e)}",
                exc_info=True
            )
            return None

    # ─────────────────────────────────────────────────────────────
    # COMPTE UTILISATEUR
    # ─────────────────────────────────────────────────────────────

    def get_user_account_info(
        self,
        session_id: str
    ) -> Optional[Dict[str, Any]]:
        """
        Récupère les informations du compte utilisateur
        via pmbesOPACEmpr_get_account_info.
        """
        try:
            if not session_id:
                logger.warning(
                    "Session ID manquant pour "
                    "get_user_account_info"
                )
                return None

            result = self.client.call(
                "pmbesOPACEmpr_get_account_info",
                {
                    "session_id": session_id
                }
            )

            if (
                result
                and isinstance(
                    result,
                    dict
                )
            ):
                return {
                    "id": result.get(
                        "empr_id"
                    ),
                    "username": result.get(
                        "empr_login"
                    ),
                    "first_name": result.get(
                        "empr_prenom"
                    ),
                    "last_name": result.get(
                        "empr_nom"
                    ),
                    "email": result.get(
                        "empr_mail"
                    ),
                    "phone": result.get(
                        "empr_tel"
                    ),
                    "address": result.get(
                        "empr_adr1"
                    ),
                    "city": result.get(
                        "empr_ville"
                    ),
                    "subscription_end_date": result.get(
                        "empr_date_fin_abonnement"
                    ),
                    "is_active": (
                        result.get(
                            "empr_actif"
                        ) == "1"
                    ),
                }

            return None

        except Exception as e:
            logger.error(
                f"Erreur get_user_account_info: "
                f"{str(e)}"
            )
            return None

    # ─────────────────────────────────────────────────────────────
    # AVIS
    # ─────────────────────────────────────────────────────────────

    def add_review(
        self,
        session_id: str,
        notice_id: str,
        note: int,
        comment: str
    ) -> Dict[str, Any]:
        """
        Ajoute une note et un commentaire sur un document.

        Args:
            session_id: ID de session PMB
            notice_id: ID de la notice
            note: Note de 1 à 5
            comment: Commentaire textuel
        """
        try:
            if not session_id:
                return {
                    "success": False,
                    "error": "Utilisateur non connecté"
                }

            if not 1 <= note <= 5:
                return {
                    "success": False,
                    "error": (
                        "La note doit être comprise "
                        "entre 1 et 5"
                    )
                }

            result = self.client.call(
                "pmbesOPACEmpr_add_review",
                {
                    "session_id": session_id,
                    "notice_id": int(notice_id),
                    "note": note,
                    "comment": comment,
                    "subject": ""
                }
            )

            if (
                result
                and isinstance(
                    result,
                    dict
                )
            ):
                if (
                    result.get("success") == "1"
                    or result.get("status") == "ok"
                ):
                    return {
                        "success": True,
                        "message": (
                            "Avis ajouté avec succès"
                        )
                    }

                return {
                    "success": False,
                    "error": result.get(
                        "error",
                        "Erreur lors de l'ajout de l'avis"
                    )
                }

            return {
                "success": False,
                "error": "Réponse inattendue de PMB"
            }

        except Exception as e:
            logger.error(
                f"Erreur add_review pour notice "
                f"{notice_id}: {str(e)}"
            )

            return {
                "success": False,
                "error": str(e)
            }

    # ─────────────────────────────────────────────────────────────
    # SUGGESTION D'ACHAT
    # ─────────────────────────────────────────────────────────────

    def suggest_purchase(
        self,
        session_id: str,
        data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Suggère l'achat d'un livre à la bibliothèque.
        """
        try:
            if not session_id:
                return {
                    "success": False,
                    "error": "Utilisateur non connecté"
                }

            suggestion_data = {
                "title": data.get(
                    "title",
                    ""
                ),
                "author": data.get(
                    "author",
                    ""
                ),
                "publisher": data.get(
                    "publisher",
                    ""
                ),
                "isbn": data.get(
                    "isbn",
                    ""
                ),
                "year": data.get(
                    "year",
                    ""
                ),
                "reason": data.get(
                    "reason",
                    ""
                ),
                "comment": data.get(
                    "comment",
                    ""
                ),
            }

            result = self.client.call(
                "pmbesOPACEmpr_add_suggestion2",
                {
                    "session_id": session_id,
                    "suggestion": suggestion_data
                }
            )

            if (
                result
                and isinstance(
                    result,
                    dict
                )
            ):
                if (
                    result.get("success") == "1"
                    or result.get("status") == "ok"
                ):
                    return {
                        "success": True,
                        "message": (
                            "Suggestion d'achat "
                            "envoyée avec succès"
                        )
                    }

                return {
                    "success": False,
                    "error": result.get(
                        "error",
                        "Erreur lors de l'envoi "
                        "de la suggestion"
                    )
                }

            return {
                "success": False,
                "error": "Réponse inattendue de PMB"
            }

        except Exception as e:
            logger.error(
                f"Erreur suggest_purchase: "
                f"{str(e)}"
            )

            return {
                "success": False,
                "error": str(e)
            }

    # ─────────────────────────────────────────────────────────────
    # MÉTHODES D'EXTRACTION EXISTANTES
    # ─────────────────────────────────────────────────────────────

    def _extract_authors(
        self,
        notice_data: dict
    ) -> List[str]:
        """Extrait les auteurs de la notice."""
        authors = []

        if notice_data.get("author"):
            authors.append(
                notice_data["author"]
            )

        if notice_data.get(
            "auteur_principal"
        ):
            if (
                notice_data[
                    "auteur_principal"
                ] not in authors
            ):
                authors.append(
                    notice_data[
                        "auteur_principal"
                    ]
                )

        if notice_data.get(
            "auteurs_secondaires"
        ):
            secondary_authors = notice_data[
                "auteurs_secondaires"
            ]

            if isinstance(
                secondary_authors,
                list
            ):
                for author in secondary_authors:
                    if (
                        author
                        and author not in authors
                    ):
                        authors.append(
                            author
                        )
            else:
                for author in secondary_authors.split("|"):
                    author = author.strip()

                    if (
                        author
                        and author not in authors
                    ):
                        authors.append(
                            author
                        )

        return (
            authors
            if authors
            else ["Auteur inconnu"]
        )

    def _extract_categories(
        self,
        notice_data: dict
    ) -> List[str]:
        """Extrait les catégories de la notice."""
        categories = []

        if notice_data.get(
            "categories"
        ):
            value = notice_data[
                "categories"
            ]

            if isinstance(
                value,
                list
            ):
                categories.extend(
                    value
                )
            else:
                categories = value.split("|")

        if (
            notice_data.get("matieres")
            and not categories
        ):
            value = notice_data[
                "matieres"
            ]

            if isinstance(
                value,
                list
            ):
                categories.extend(
                    value
                )
            else:
                categories = value.split("|")

        return [
            cat.strip()
            for cat in categories
            if cat and cat.strip()
        ]

    def _extract_subjects(
        self,
        notice_data: dict
    ) -> List[str]:
        """Extrait les sujets de la notice."""
        subjects = []

        if notice_data.get(
            "subjects"
        ):
            value = notice_data[
                "subjects"
            ]

            if isinstance(
                value,
                list
            ):
                subjects.extend(
                    value
                )
            else:
                subjects = value.split("|")

        if (
            notice_data.get("matieres")
            and not subjects
        ):
            value = notice_data[
                "matieres"
            ]

            if isinstance(
                value,
                list
            ):
                subjects.extend(
                    value
                )
            else:
                subjects = value.split("|")

        return [
            subj.strip()
            for subj in subjects
            if subj and subj.strip()
        ]

    def _extract_contributors(
        self,
        notice_data: dict
    ) -> List[str]:
        """Extrait les contributeurs de la notice."""
        contributors = []

        if notice_data.get(
            "contributors"
        ):
            value = notice_data[
                "contributors"
            ]

            if isinstance(
                value,
                list
            ):
                contributors.extend(
                    value
                )
            else:
                contributors = value.split("|")

        return [
            contributor.strip()
            for contributor in contributors
            if contributor
            and contributor.strip()
        ]

    def _extract_pages(
        self,
        notice_data: dict
    ) -> Optional[int]:
        """Extrait le nombre de pages."""

        pages_str = (
            notice_data.get("pages")
            or notice_data.get("nb_pages")
            or notice_data.get("nombre_pages")
            or ""
        )

        if pages_str:
            try:
                match = re.search(
                    r"(\d+)",
                    str(pages_str)
                )

                if match:
                    return int(
                        match.group(1)
                    )

            except Exception:
                pass

        return None
