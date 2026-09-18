# pmb_gateway/client.py - VERSION CORRIGÉE

import os
import requests
import json
import logging
from pmb_gateway.exceptions import PMBBaseException, PMBConnectionError, PMBResponseError

logger = logging.getLogger(__name__)


class PMBClient:
    """Client JSON-RPC générique pour communiquer avec le webservice PMB."""

    def __init__(self):
        # Récupère PMB_WS_URL défini dans le .env
        self.endpoint = os.getenv('PMB_WS_URL')
        
        # Fallback si PMB_WS_URL n'est pas défini
        if not self.endpoint or self.endpoint == 'None':
            # Essayer de récupérer depuis PMB_CONNECTOR_URL
            self.endpoint = os.getenv('PMB_CONNECTOR_URL')
            
        if not self.endpoint or self.endpoint == 'None':
            logger.warning("⚠️ Aucune URL PMB configurée dans le .env")
            # URL par défaut pour le développement
            self.endpoint = 'http://localhost/pmb/ws/connector_out.php?source_id=1'
        
        logger.info(f"🔗 PMB Client configuré avec: {self.endpoint}")

    def call(self, method: str, params: dict = None) -> dict:
        """
        Appelle une méthode du webservice PMB.
        """
        if not self.endpoint or self.endpoint == 'None':
            logger.error(f"❌ URL PMB non configurée pour l'appel à {method}")
            raise PMBConnectionError("L'URL du WebService PMB n'est pas configurée dans le fichier .env.")

        payload = {
            "jsonrpc": "2.0",
            "method": method,
            "params": params or {},
            "id": 1
        }
        
        headers = {'Content-Type': 'application/json'}
        
        logger.debug(f"📤 Appel PMB: {method} avec params: {params}")

        try:
            response = requests.post(
                self.endpoint, 
                data=json.dumps(payload), 
                headers=headers, 
                timeout=15
            )
            
            logger.debug(f"📥 Réponse PMB: {response.status_code}")
            
            # Vérifier le statut HTTP
            if response.status_code == 404:
                logger.error(f"❌ Erreur 404: L'URL PMB n'existe pas: {self.endpoint}")
                raise PMBConnectionError(f"L'URL PMB n'existe pas: {self.endpoint}")
            
            if response.status_code == 500:
                logger.error(f"❌ Erreur 500: Le serveur PMB a retourné une erreur")
                raise PMBResponseError("Erreur interne du serveur PMB")
            
            response.raise_for_status()
            
            # Analyser la réponse JSON
            data = response.json()
            
            # Vérifier les erreurs JSON-RPC
            if 'error' in data and data['error']:
                if isinstance(data['error'], dict):
                    error_msg = data['error'].get('message', 'Erreur JSON-RPC inconnue')
                else:
                    error_msg = str(data['error'])
                logger.error(f"❌ Erreur JSON-RPC PMB: {error_msg}")
                raise PMBResponseError(f"Erreur PMB: {error_msg}")
            
            result = data.get('result')
            logger.debug(f"✅ Appel PMB réussi: {method}")
            return result

        except requests.exceptions.Timeout:
            logger.error(f"❌ Timeout PMB pour {method}: Le serveur ne répond pas")
            raise PMBConnectionError("Le serveur PMB ne répond pas (timeout)")
            
        except requests.exceptions.ConnectionError:
            logger.error(f"❌ Erreur de connexion PMB pour {method}: Serveur inaccessible")
            raise PMBConnectionError("Le serveur PMB est inaccessible")
            
        except requests.exceptions.RequestException as e:
            logger.error(f"❌ Erreur réseau PMB pour {method}: {str(e)}")
            raise PMBConnectionError(f"Erreur réseau PMB: {str(e)}")
            
        except json.JSONDecodeError as e:
            logger.error(f"❌ Erreur JSON PMB pour {method}: {str(e)}")
            logger.debug(f"Réponse brute: {response.text[:500]}")
            raise PMBResponseError(f"Réponse PMB invalide: {str(e)}")
            
        except Exception as e:
            logger.error(f"❌ Erreur inattendue PMB pour {method}: {str(e)}")
            raise PMBBaseException(f"Erreur inattendue: {str(e)}")