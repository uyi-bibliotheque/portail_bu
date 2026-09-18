# pmb_gateway/services/auth_service.py - VERSION CORRIGÉE

import logging
from pmb_gateway.client import PMBClient
from pmb_gateway.exceptions import PMBBaseException

logger = logging.getLogger(__name__)


class PMBAuthService:
    def __init__(self):
        self.client = PMBClient()

    def verifier_identifiants_pmb(self, username, password):
        """
        Vérifie les identifiants d'un lecteur PMB.
        Retourne l'ID de session PMB si l'authentification réussit, None sinon.
        """
        params = {
            "empr_login": username,
            "empr_password": password
        }
        
        try:
            # Appel au webservice PMB pour l'authentification
            result = self.client.call("pmbesOPACEmpr_login", params)
            
            logger.debug(f"Résultat PMB login: {result} (type: {type(result)})")
            
            if result is not None:
                # Cas 1: résultat est un entier (session ID)
                if isinstance(result, int):
                    session_id = str(result)
                    logger.info(f"✅ Authentification PMB réussie pour: {username} (session: {session_id})")
                    return session_id
                
                # Cas 2: résultat est une chaîne
                if isinstance(result, str):
                    # Vérifier si c'est un nombre
                    if result.isdigit():
                        logger.info(f"✅ Authentification PMB réussie pour: {username} (session: {result})")
                        return result
                    # Sinon, c'est peut-être déjà le session_id
                    if len(result) > 5:
                        logger.info(f"✅ Authentification PMB réussie pour: {username} (session: {result[:10]}...)")
                        return result
                
                # Cas 3: résultat est un dict
                if isinstance(result, dict):
                    # Chercher session_id ou id
                    session_id = result.get("session_id") or result.get("sessionId") or result.get("id")
                    if session_id:
                        session_id = str(session_id)
                        logger.info(f"✅ Authentification PMB réussie pour: {username} (session: {session_id[:10]}...)")
                        return session_id
                    
                    # Chercher empr_id ou autre
                    empr_id = result.get("empr_id") or result.get("id_empr")
                    if empr_id:
                        empr_id = str(empr_id)
                        logger.info(f"✅ Authentification PMB réussie pour: {username} (empr_id: {empr_id})")
                        return empr_id
                
                # Cas 4: résultat est une liste
                if isinstance(result, list) and len(result) > 0:
                    first_item = result[0]
                    if isinstance(first_item, dict):
                        session_id = first_item.get("session_id") or first_item.get("id")
                        if session_id:
                            session_id = str(session_id)
                            logger.info(f"✅ Authentification PMB réussie pour: {username} (session: {session_id[:10]}...)")
                            return session_id
                    elif isinstance(first_item, int):
                        session_id = str(first_item)
                        logger.info(f"✅ Authentification PMB réussie pour: {username} (session: {session_id})")
                        return session_id
                    elif isinstance(first_item, str) and first_item.isdigit():
                        logger.info(f"✅ Authentification PMB réussie pour: {username} (session: {first_item})")
                        return first_item
                
                # Cas 5: résultat est booléen True
                if isinstance(result, bool) and result is True:
                    # Si l'authentification est réussie mais qu'on n'a pas de session ID,
                    # on peut essayer de récupérer le profil directement
                    logger.warning(f"⚠️ Authentification PMB réussie pour: {username} mais pas de session ID")
                    # Tenter de récupérer un session_id via une autre méthode
                    # Ou retourner une valeur par défaut
                    return "pmb_session_" + username
            
            logger.warning(f"⚠️ Authentification PMB échouée pour: {username} - Format de réponse inattendu: {type(result)}")
            return None
            
        except PMBBaseException as e:
            logger.error(f"❌ Échec d'authentification PMB pour {username}: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"❌ Erreur inattendue lors de l'authentification PMB pour {username}: {str(e)}")
            import traceback
            traceback.print_exc()
            return None

    def recuperer_profil_lecteur(self, session_id):
        """
        Récupère le profil complet d'un lecteur PMB à partir de sa session.
        """
        if not session_id:
            logger.warning("⚠️ Session ID manquant pour recuperer_profil_lecteur")
            return {}
        
        params = {"session_id": session_id}
        
        try:
            logger.debug(f"Récupération du profil PMB avec session: {session_id}")
            result = self.client.call("pmbesOPACEmpr_get_account_info", params)
            
            logger.debug(f"Résultat profil PMB: {result}")
            
            if result:
                # Si le résultat est une liste, prendre le premier élément
                if isinstance(result, list) and len(result) > 0:
                    result = result[0]
                
                if isinstance(result, dict):
                    # Normaliser les clés pour le frontend
                    normalized = {
                        "id_empr": str(result.get("id", result.get("empr_id", result.get("empr_ID", "")))),
                        "empr_id": str(result.get("id", result.get("empr_id", result.get("empr_ID", "")))),
                        "empr_login": result.get("login", result.get("empr_login", "")),
                        "empr_nom": result.get("nom", result.get("empr_nom", result.get("EMPR_NOM", ""))),
                        "empr_prenom": result.get("prenom", result.get("empr_prenom", result.get("EMPR_PRENOM", ""))),
                        "empr_mail": result.get("email", result.get("empr_mail", result.get("EMPR_MAIL", ""))),
                        "empr_tel": result.get("telephone", result.get("empr_tel", result.get("EMPR_TEL", ""))),
                        "empr_adr1": result.get("adresse", result.get("empr_adr1", result.get("EMPR_ADR1", ""))),
                        "empr_ville": result.get("ville", result.get("empr_ville", result.get("EMPR_VILLE", ""))),
                        "empr_cp": result.get("cp", result.get("empr_cp", result.get("EMPR_CP", ""))),
                        "empr_date_fin_abonnement": result.get("date_fin_abonnement", result.get("empr_date_fin_abonnement", "")),
                        "empr_actif": result.get("actif", result.get("empr_actif", result.get("EMPR_ACTIF", "1"))),
                        "empr_statut": result.get("statut", result.get("empr_statut", result.get("EMPR_STATUT", ""))),
                        "empr_categorie": result.get("categorie", result.get("empr_categorie", result.get("EMPR_CATEGORIE", ""))),
                    }
                    logger.info(f"✅ Profil PMB récupéré pour session: {session_id[:10]}...")
                    return normalized
                else:
                    logger.warning(f"⚠️ Profil PMB format inattendu: {type(result)}")
                    return {}
            
            logger.warning(f"⚠️ Profil PMB non trouvé pour session: {session_id[:10]}...")
            return {}
            
        except PMBBaseException as e:
            logger.error(f"❌ Erreur récupération profil PMB: {str(e)}")
            return {}
        except Exception as e:
            logger.error(f"❌ Erreur inattendue récupération profil PMB: {str(e)}")
            import traceback
            traceback.print_exc()
            return {}