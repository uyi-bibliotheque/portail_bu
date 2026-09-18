# scripts/create_archive_structure.py
import os
import sys
from pathlib import Path

# Ajouter le chemin du projet
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

import django
django.setup()

from django.conf import settings
from django.utils import timezone
import os

def create_archive_structure():
    """Crée la structure de dossiers pour tous les établissements."""
    print("=" * 60)
    print("📁 CRÉATION DE LA STRUCTURE D'ARCHIVAGE")
    print("=" * 60)
    
    current_year = timezone.now().year
    
    # Liste des 7 facultés et écoles de l'Université de Yaoundé I
    faculties = [
        ('FS', 'Faculté des Sciences'),
        ('FALSH', 'Faculté des Arts, Lettres et Sciences Humaines'),
        ('FSE', "Faculté des Sciences de l'Éducation"),
        ('FMSB', 'Faculté de Médecine et des Sciences Biomédicales'),
        ('ENS', 'École Normale Supérieure de Yaoundé'),
        ('ENSPY', 'École Nationale Supérieure Polytechnique de Yaoundé'),
        ('IUT_BOIS', 'Institut Universitaire de Technologie du Bois'),
    ]
    
    years = range(2020, 2031)
    
    # Créer les dossiers THESES
    print("\n📂 Création des dossiers THESES:")
    for faculty_abbr, faculty_name in faculties:
        faculty_path = os.path.join(settings.THESES_ROOT, faculty_abbr)
        os.makedirs(faculty_path, exist_ok=True)
        print(f"  ✅ {faculty_path}")
        
        for year in years:
            year_path = os.path.join(faculty_path, str(year))
            os.makedirs(year_path, exist_ok=True)
    
    # Créer les dossiers MEMOIRES
    print("\n📂 Création des dossiers MEMOIRES:")
    for faculty_abbr, faculty_name in faculties:
        faculty_path = os.path.join(settings.MEMOIRES_ROOT, faculty_abbr)
        os.makedirs(faculty_path, exist_ok=True)
        print(f"  ✅ {faculty_path}")
        
        for year in years:
            year_path = os.path.join(faculty_path, str(year))
            os.makedirs(year_path, exist_ok=True)
    
    print("\n" + "=" * 60)
    print("✅ Structure d'archivage créée avec succès !")
    print("=" * 60)
    
    # Afficher la structure
    print("\n📁 Structure créée:")
    print(f"  {settings.THESES_ROOT}/")
    for faculty_abbr, _ in faculties:
        print(f"    ├── {faculty_abbr}/")
        print(f"    │   ├── 2020/")
        print(f"    │   ├── 2021/")
        print(f"    │   └── ...")
    
    print(f"\n  {settings.MEMOIRES_ROOT}/")
    for faculty_abbr, _ in faculties:
        print(f"    ├── {faculty_abbr}/")
        print(f"    │   ├── 2020/")
        print(f"    │   ├── 2021/")
        print(f"    │   └── ...")

if __name__ == "__main__":
    create_archive_structure()