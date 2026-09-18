# accounts/management/commands/create_admin.py
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.accounts.models import PortalUser

User = get_user_model()

class Command(BaseCommand):
    help = 'Crée l\'administrateur par défaut du système'

    def add_arguments(self, parser):
        parser.add_argument('--username', type=str, default='admin_bcu', help='Nom d\'utilisateur de l\'admin')
        parser.add_argument('--email', type=str, default='admin@bcu-uyi.cm', help='Email de l\'admin')
        parser.add_argument('--password', type=str, default='AdminBCU2025!', help='Mot de passe de l\'admin')

    def handle(self, *args, **options):
        username = options['username']
        email = options['email']
        password = options['password']

        if not User.objects.filter(username=username).exists():
            admin = User.objects.create_superuser(
                username=username,
                email=email,
                password=password,
                first_name='Administrateur',
                last_name='BCU',
                role=PortalUser.Role.ADMIN,
                auth_source=PortalUser.AuthSource.LOCAL
            )
            self.stdout.write(self.style.SUCCESS(f'✅ Administrateur "{username}" créé avec succès !'))
            self.stdout.write(f'   Email: {email}')
            self.stdout.write(f'   Password: {password}')
            self.stdout.write('   ⚠️ Veuillez changer le mot de passe à la première connexion.')
        else:
            self.stdout.write(self.style.WARNING(f'ℹ️ L\'administrateur "{username}" existe déjà.'))