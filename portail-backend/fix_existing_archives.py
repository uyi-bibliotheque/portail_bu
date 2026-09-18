# scripts/fix_existing_archives.py
import os
import sys
import shutil
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

import django
django.setup()

from django.conf import settings
from django.utils import timezone
from apps.memoires.models import Memoire
from apps.memoires.document_service import DocumentArchiveService
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def fix_existing_archives():
    print("=" * 70)
    print("🔧 CORRECTION DES ARCHIVES EXISTANTES")
    print("=" * 70)
    
    # Récupérer tous les mémoires archivés
    memoires = Memoire.objects.filter(is_archived=True)
    
    print(f"📄 {memoires.count()} mémoires archivés trouvés")
    print()
    
    fixed = 0
    errors = 0
    skipped = 0
    
    for memoire in memoires:
        print(f"📖 {memoire.title[:50]}... ({memoire.id})")
        print(f"   Filière en base: '{memoire.filiere}'")
        
        if memoire.archive_path:
            old_path = os.path.join(settings.BASE_DIR.parent, 'Documents', memoire.archive_path)
            print(f"   Ancien chemin: {old_path}")
            
            if os.path.exists(old_path):
                # Générer le nouveau nom avec la filière du modèle
                doc_name, seq = DocumentArchiveService.generate_document_name(memoire)
                faculty_abbr = DocumentArchiveService.get_faculty_abbreviation(
                    memoire.filiere or ''
                )
                
                # Si pas de filière, essayer depuis les préférences
                if faculty_abbr == 'AUTRE' and hasattr(memoire.author, 'preferences'):
                    faculty_from_prefs = memoire.author.preferences.get('faculte', '')
                    if faculty_from_prefs:
                        faculty_abbr = DocumentArchiveService.get_faculty_abbreviation(faculty_from_prefs)
                
                year = memoire.archived_at.year if memoire.archived_at else timezone.now().year
                
                # Nouveau chemin
                new_dir = os.path.join(
                    settings.BASE_DIR.parent, 'Documents',
                    'MEMOIRES' if memoire.type_document == 'MEMOIRE' else 'THESES',
                    faculty_abbr,
                    str(year)
                )
                
                ext = os.path.splitext(old_path)[1]
                clean_name = doc_name.replace(' ', '_').replace('/', '_')
                new_filename = f"{clean_name}{ext}"
                new_path = os.path.join(new_dir, new_filename)
                
                print(f"   Nouveau nom: {clean_name}")
                print(f"   Nouveau chemin: {new_path}")
                print(f"   Faculté déduite: {faculty_abbr}")
                
                # Créer le dossier
                os.makedirs(new_dir, exist_ok=True)
                
                # Copier le fichier
                try:
                    # Vérifier si le fichier existe déjà
                    if os.path.exists(new_path):
                        print(f"   ⚠️ Le fichier existe déjà")
                        # Supprimer l'ancien
                        if old_path != new_path and os.path.exists(old_path):
                            os.remove(old_path)
                        skipped += 1
                        continue
                    
                    shutil.copy2(old_path, new_path)
                    
                    # Mettre à jour le modèle
                    memoire.archive_path = os.path.join(
                        'MEMOIRES' if memoire.type_document == 'MEMOIRE' else 'THESES',
                        faculty_abbr,
                        str(year),
                        new_filename
                    )
                    memoire.document_name = clean_name
                    memoire.sequence_number = seq
                    memoire.save()
                    
                    print(f"   ✅ Corrigé: {clean_name}")
                    fixed += 1
                    
                    # Supprimer l'ancien fichier
                    if old_path != new_path and os.path.exists(old_path):
                        os.remove(old_path)
                        print(f"   🗑️ Ancien fichier supprimé")
                        
                except Exception as e:
                    print(f"   ❌ Erreur: {str(e)}")
                    errors += 1
            else:
                print(f"   ❌ Fichier non trouvé")
                errors += 1
        else:
            print(f"   ⚠️ Pas de chemin d'archive")
            skipped += 1
        
        print()
    
    print("=" * 70)
    print(f"✅ Corrigés: {fixed}")
    print(f"❌ Erreurs: {errors}")
    print(f"⏭️  Ignorés: {skipped}")
    print("=" * 70)


def fix_memoire_filiere():
    """Corrige les filières des mémoires existants"""
    print("\n" + "=" * 70)
    print("🔧 CORRECTION DES FILIÈRES DES MÉMOIRES")
    print("=" * 70)
    
    memoires = Memoire.objects.filter(filiere__isnull=True) | Memoire.objects.filter(filiere='')
    
    print(f"📄 {memoires.count()} mémoires sans filière")
    
    fixed = 0
    for memoire in memoires:
        # Essayer de récupérer la filière depuis les préférences
        if hasattr(memoire.author, 'preferences') and memoire.author.preferences:
            faculty = memoire.author.preferences.get('faculte', '') or memoire.author.preferences.get('departement', '')
            if faculty:
                memoire.filiere = faculty
                memoire.save()
                print(f"   ✅ {memoire.title[:30]}... -> {faculty}")
                fixed += 1
    
    print(f"\n✅ Filières corrigées: {fixed}")

if __name__ == "__main__":
    # 1. Corriger les filières des mémoires
    fix_memoire_filiere()
    
    # 2. Corriger les archives
    fix_existing_archives()