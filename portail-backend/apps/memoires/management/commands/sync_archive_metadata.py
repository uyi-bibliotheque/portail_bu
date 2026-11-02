import csv
from pathlib import Path, PurePosixPath

from django.core.management.base import BaseCommand, CommandError

from apps.memoires.archive_index import synchronize_direct_archives


class Command(BaseCommand):
    help = 'Extrait les métadonnées PDF (titre/auteur) des archives et met à jour la base.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Calcule les documents découverts sans enregistrer les changements.',
        )
        parser.add_argument(
            '--csv',
            dest='csv_path',
            help='Utilise les métadonnées validées d’un export_archives_csv.py.',
        )

    def handle(self, *args, **options):
        metadata_by_path = None
        csv_path = options.get('csv_path')
        if csv_path:
            metadata_by_path = self._read_metadata_csv(csv_path)

        if options.get('dry_run'):
            from apps.memoires.archive_index import _iter_documents

            count = sum(1 for _ in _iter_documents(metadata_by_path=metadata_by_path))
            self.stdout.write(self.style.SUCCESS(f'{count} document(s) détecté(s).'))
            return

        synchronize_direct_archives(metadata_by_path)
        self.stdout.write(self.style.SUCCESS('Indexation des archives terminée.'))

    def _read_metadata_csv(self, csv_path):
        path = Path(csv_path)
        if not path.is_file():
            raise CommandError(f'Fichier CSV introuvable : {path}')

        with path.open(encoding='utf-8-sig', newline='') as csv_file:
            reader = csv.DictReader(csv_file, delimiter=';')
            required_fields = {'source_path', 'title', 'author_name', 'author_full_name'}
            if not reader.fieldnames or not required_fields.issubset(reader.fieldnames):
                raise CommandError(
                    'Le CSV doit contenir les colonnes source_path, title, author_name et author_full_name.'
                )

            metadata_by_path = {}
            for row in reader:
                source_path = PurePosixPath((row.get('source_path') or '').strip())
                if (
                    source_path.is_absolute()
                    or not source_path.parts
                    or source_path.parts[0] not in {'MEMOIRES', 'THESES'}
                    or '..' in source_path.parts
                ):
                    raise CommandError(f'Chemin d’archive invalide dans le CSV : {source_path}')

                relative_path = source_path.as_posix()
                if relative_path in metadata_by_path:
                    raise CommandError(f'Chemin d’archive dupliqué dans le CSV : {relative_path}')

                title = (row.get('title') or '').replace('\x00', ' ').strip()
                if not title:
                    raise CommandError(f'Titre manquant dans le CSV pour : {relative_path}')
                author_full_name = (row.get('author_full_name') or '').replace('\x00', ' ').strip()
                author_name = (row.get('author_name') or '').replace('\x00', ' ').strip()
                metadata_by_path[relative_path] = {
                    'title': title[:500],
                    'author_name': author_name or author_full_name,
                    'author_full_name': author_full_name or author_name,
                }

        return metadata_by_path
