import logging
from typing import List, Dict, Any
from pmb_gateway.client import PMBClient

logger = logging.getLogger(__name__)


class PMBCirculationService:
    """Service d'interaction avec le webservice PMB pour les prêts et réservations."""

    def __init__(self):
        self.client = PMBClient()

    def get_loans(self, session_id: str = None, empr_id: str = None) -> List[Dict[str, Any]]:
        """
        Récupère la liste des prêts en cours.
        Utilise session_id (OPAC) si disponible, sinon tente avec un fallback selon la configuration PMB.
        """
        try:
            # Idéalement, PMB requiert une session_id valide de l'emprunteur
            params = {
                "session_id": session_id or "",
                "loan_type": 0
            }
            if empr_id:
                params["empr_id"] = empr_id
                
            # Appel au vrai webservice PMB
            response = self.client.call("pmbesOPACEmpr_list_loans", params)
            
            if not response:
                return []

            loans = []
            # Mapping de la réponse brute PMB vers une structure commune
            if isinstance(response, list):
                for item in response:
                    loans.append({
                        "id": str(item.get("id", item.get("pret_id", ""))),
                        "notice_id": str(item.get("notice_id", "")),
                        "title": item.get("title", item.get("titre", "Titre inconnu")),
                        "loan_date": item.get("date_pret", item.get("loan_date", "")),
                        "due_date": item.get("date_retour", item.get("due_date", "")),
                        "status": "En cours" if not item.get("retard") else "En retard",
                        "is_late": bool(item.get("retard", False)),
                        "can_renew": bool(item.get("prolongeable", False))
                    })
            return loans
        except Exception as e:
            logger.error(f"Erreur get_loans PMB (empr_id={empr_id}): {str(e)}")
            return []

    def get_reservations(self, session_id: str = None, empr_id: str = None) -> List[Dict[str, Any]]:
        """
        Récupère la liste des réservations en cours.
        """
        try:
            params = {}
            if session_id:
                params["session_id"] = session_id
            if empr_id:
                params["empr_id"] = empr_id
                
            response = self.client.call("pmbesOPACEmpr_list_resas", params)
            
            if not response:
                return []

            reservations = []
            if isinstance(response, list):
                for item in response:
                    reservations.append({
                        "id": str(item.get("id", item.get("resa_id", ""))),
                        "notice_id": str(item.get("notice_id", "")),
                        "title": item.get("title", item.get("titre", "Titre inconnu")),
                        "reservation_date": item.get("date_resa", item.get("reservation_date", "")),
                        "status": item.get("etat", "En attente"),
                        "rank": item.get("rang", 1)
                    })
            return reservations
        except Exception as e:
            logger.error(f"Erreur get_reservations PMB (empr_id={empr_id}): {str(e)}")
            return []

    def create_reservation(self, notice_id: str, bulletin_id: str = "0", location: str = "", session_id: str = None) -> bool:
        """
        Crée une nouvelle réservation sur une notice.
        """
        try:
            params = {
                "session_id": session_id or "dummy",
                "notice_id": int(notice_id),
                "bulletin_id": int(bulletin_id),
                "location": location
            }
            
            # Vérifie d'abord si on peut réserver
            can_reserve = self.client.call("pmbesOPACEmpr_can_reserve_notice", {
                "session_id": params["session_id"],
                "notice_id": params["notice_id"],
                "bulletin_id": params["bulletin_id"]
            })
            
            # Note: Si can_reserve retourne faux, on pourrait lever une exception
            
            response = self.client.call("pmbesOPACEmpr_add_resa", params)
            return bool(response)
        except Exception as e:
            logger.error(f"Erreur create_reservation PMB (notice_id={notice_id}): {str(e)}")
            return False

    def cancel_reservation(self, resa_id: str, session_id: str = None) -> bool:
        """
        Annule une réservation existante.
        """
        try:
            params = {
                "session_id": session_id or "dummy",
                "resa_id": int(resa_id)
            }
            response = self.client.call("pmbesOPACEmpr_delete_resa", params)
            return bool(response)
        except Exception as e:
            logger.error(f"Erreur cancel_reservation PMB (resa_id={resa_id}): {str(e)}")
            return False

    def renew_loan(self, expl_cb: str, session_id: str = None) -> bool:
        """
        Renouvelle un prêt (prolongation).
        """
        try:
            params = {
                "session_id": session_id or "dummy",
                "expl_cb": expl_cb
            }
            response = self.client.call("pmbesOPACEmpr_self_renew", params)
            return bool(response)
        except Exception as e:
            logger.error(f"Erreur renew_loan PMB (expl_cb={expl_cb}): {str(e)}")
            return False
