import os
import csv
import re
import argparse
from collections import Counter
from pathlib import Path

YEAR_PATTERN = re.compile(r'^(19|20)\d{2}$')


def clean_value(val):
    """Nettoie les chaînes de caractères pour supprimer les caractères nuls (0x00) et espaces superflus."""
    if isinstance(val, str):
        return re.sub(r'\s+', ' ', val.replace('\x00', ' ')).strip()
    return val


def export_archives_to_csv(output_csv_path='archives_correspondances.csv'):
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
    import django

    django.setup()

    from django.conf import settings
    from apps.memoires.models import DirectArchiveDocument
    from apps.memoires.pdf_metadata import extract_pdf_metadata

    documents_root = Path(settings.DOCUMENTS_ROOT).resolve()
    if not documents_root.is_dir():
        raise FileNotFoundError(f"Dossier documentaire introuvable: {documents_root}")

    print(f"📂 Analyse du dossier: {documents_root}")
    source_counts = Counter()
    rows_to_write = []
    counter = 1

    for collection, document_type in (
        ('MEMOIRES', DirectArchiveDocument.TypeDocument.MEMOIRE),
        ('THESES', DirectArchiveDocument.TypeDocument.THESE),
    ):
        collection_root = documents_root / collection
        if not collection_root.is_dir():
            raise FileNotFoundError(f"Dossier d'archives introuvable: {collection_root}")

        for current_dir, directories, filenames in os.walk(collection_root, followlinks=False):
            directories[:] = sorted(
                name for name in directories
                if not (Path(current_dir) / name).is_symlink()
            )
            for filename in sorted(filenames):
                path = Path(current_dir) / filename
                if path.suffix.lower() != '.pdf' or path.is_symlink():
                    continue

                try:
                    resolved_path = path.resolve(strict=True)
                    relative_to_root = resolved_path.relative_to(documents_root)
                    stat = resolved_path.stat()
                except (FileNotFoundError, ValueError):
                    continue

                if not resolved_path.is_file():
                    continue

                parts = relative_to_root.parts
                faculty = parts[1].strip().upper() if len(parts) > 2 else 'AUTRE'
                year = next(
                    (int(part) for part in parts[2:-1] if YEAR_PATTERN.fullmatch(part)),
                    None,
                )
                
                # Extraction des métadonnées PDF
                metadata = extract_pdf_metadata(resolved_path)
                title = metadata.get('title') or resolved_path.stem.replace('_', ' ').strip()
                author_name = metadata.get('author_name', '').strip()
                author_full_name = metadata.get('author_full_name', '').strip() or author_name
                title_source = metadata.get('title_source', '')
                author_source = metadata.get('author_source', '')
                source_counts[f'title:{title_source or "missing"}'] += 1
                source_counts[f'author:{author_source or "missing"}'] += 1

                # Nettoyage des données pour éviter les caractères nuls et les problèmes de troncature
                clean_path = clean_value(relative_to_root.as_posix())
                clean_title = clean_value(title)[:500]
                clean_author_name = clean_value(author_name)[:255]
                clean_author_full_name = clean_value(author_full_name)[:255]
                clean_faculty = clean_value(faculty)[:64]
                clean_doc_type = clean_value(document_type)

                rows_to_write.append({
                    'id_correspondance': f"DOC_{counter:05d}",  # Identifiant unique de correspondance
                    'source_path': clean_path,                  # Chemin relatif (clé de liaison future)
                    'type_document': clean_doc_type,            # MEMOIRE ou THESE
                    'faculty': clean_faculty,                   # ENS, POLYTECH, FMSB, etc.
                    'year': year or '',                         # Année académique
                    'title': clean_title,                       # Titre extrait ou nom du fichier
                    'author_name': clean_author_name,           # Nom court de l'auteur
                    'author_full_name': clean_author_full_name, # Nom complet de l'auteur
                    'title_source': clean_value(title_source),
                    'author_source': clean_value(author_source),
                    'file_size': stat.st_size                   # Taille du fichier en octets
                })
                counter += 1

    # Écriture dans le fichier CSV
    csv_fields = [
        'id_correspondance', 'source_path', 'type_document', 
        'faculty', 'year', 'title', 'author_name', 
        'author_full_name', 'title_source', 'author_source', 'file_size'
    ]

    output_file = Path(output_csv_path)
    with open(output_file, mode='w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=csv_fields, delimiter=';')
        writer.writeheader()
        writer.writerows(rows_to_write)

    print(f"✅ Exportation réussie ! {len(rows_to_write)} documents enregistrés dans : {output_file.resolve()}")
    print('Sources détectées :')
    for source, count in sorted(source_counts.items()):
        print(f'  {source}: {count}')
    return rows_to_write

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Extrait les titres et auteurs des archives PDF.')
    parser.add_argument(
        '--output',
        default='archives_correspondances.csv',
        help='Chemin de sortie du fichier CSV.',
    )
    arguments = parser.parse_args()
    export_archives_to_csv(arguments.output)
