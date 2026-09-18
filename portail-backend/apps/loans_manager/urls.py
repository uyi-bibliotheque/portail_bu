from django.urls import path
from .views import UserLoansView, ReservationListCreateView, RenewLoanView

urlpatterns = [
    # GET /api/loans/ -> Prêts en cours du lecteur
    path('loans/', UserLoansView.as_view(), name='loans_user_list'),
    
    # POST /api/loans/renew/ -> Renouveler un prêt
    path('loans/renew/', RenewLoanView.as_view(), name='loans_user_renew'),
    
    # GET / POST /api/reservations/ -> Gestion des réservations
    path('reservations/', ReservationListCreateView.as_view(), name='reservations_list_create'),
]