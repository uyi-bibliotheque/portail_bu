from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from pmb_gateway.services.circulation_service import PMBCirculationService
import logging

logger = logging.getLogger(__name__)

class UserLoansView(APIView):
    """Récupère la liste des prêts en cours de l'utilisateur connecté (depuis PMB)."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, format=None):
        try:
            service = PMBCirculationService()
            # On utilise le pmb_lecteur_id de l'utilisateur pour requêter PMB
            empr_id = request.user.pmb_lecteur_id
            
            # En théorie, PMB OPAC a besoin du session_id. 
            # Nous pourrions avoir un mock de session ou passer l'empr_id si notre connecteur est adapté.
            loans = service.get_loans(empr_id=empr_id)
            
            return Response(loans, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Erreur UserLoansView: {e}")
            return Response({"error": "Erreur lors de la récupération des prêts PMB"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ReservationListCreateView(APIView):
    """Liste et crée des réservations en direct via PMB."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, format=None):
        try:
            service = PMBCirculationService()
            empr_id = request.user.pmb_lecteur_id
            reservations = service.get_reservations(empr_id=empr_id)
            return Response(reservations, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Erreur GET ReservationListCreateView: {e}")
            return Response({"error": "Erreur lors de la récupération des réservations PMB"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request, format=None):
        try:
            service = PMBCirculationService()
            notice_id = request.data.get('notice_id')
            bulletin_id = request.data.get('bulletin_id', '0')
            location = request.data.get('location', '')
            
            if not notice_id:
                return Response({"error": "notice_id est requis"}, status=status.HTTP_400_BAD_REQUEST)
                
            success = service.create_reservation(notice_id=notice_id, bulletin_id=bulletin_id, location=location)
            
            if success:
                return Response({"message": "Réservation effectuée avec succès"}, status=status.HTTP_201_CREATED)
            else:
                return Response({"error": "La réservation a échoué (Notice non réservable ou indisponible)"}, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            logger.error(f"Erreur POST ReservationListCreateView: {e}")
            return Response({"error": "Erreur lors de la création de la réservation PMB"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class RenewLoanView(APIView):
    """Permet de prolonger un prêt."""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, format=None):
        expl_cb = request.data.get('expl_cb')
        if not expl_cb:
             return Response({"error": "expl_cb est requis"}, status=status.HTTP_400_BAD_REQUEST)
             
        service = PMBCirculationService()
        success = service.renew_loan(expl_cb=expl_cb)
        if success:
            return Response({"message": "Prêt renouvelé avec succès"}, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Échec du renouvellement"}, status=status.HTTP_400_BAD_REQUEST)