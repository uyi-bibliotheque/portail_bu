# apps/memoires/document_service.py - CORRECTION COMPLÈTE

import os
import shutil
from pathlib import Path
from django.conf import settings
from django.utils import timezone
from django.core.files.base import ContentFile
from .models import Memoire, DocumentSequence
import logging

logger = logging.getLogger(__name__)


class DocumentArchiveService:
    """
    Service de gestion des documents archivés (renommage et déplacement).
    """
    
    @staticmethod
    def get_faculty_abbreviation(faculty_name):
        """
        Retourne l'abréviation de la faculté à partir du nom stocké en base.
        """
        if not faculty_name:
            logger.warning(f"⚠️ Nom de faculté vide, utilisation de 'AUTRE'")
            return 'AUTRE'
        
        # Nettoyer le nom
        faculty_name = faculty_name.strip()
        logger.info(f"   Faculté reçue: '{faculty_name}'")
        
        # Chercher dans le mapping (insensible à la casse)
        for key, abbr in settings.FACULTY_ABBREVIATIONS.items():
            if faculty_name.lower() == key.lower():
                logger.info(f"   ✅ Faculté trouvée: {key} -> {abbr}")
                return abbr
            # Vérifier si le nom contient une partie du mapping
            if key.lower() in faculty_name.lower() or faculty_name.lower() in key.lower():
                logger.info(f"   ✅ Faculté trouvée (partielle): {key} -> {abbr}")
                return abbr
        
        # Si non trouvé, utiliser AUTRE
        logger.warning(f"   ⚠️ Faculté non trouvée dans le mapping, utilisation de 'AUTRE'")
        return 'AUTRE'
    
    @staticmethod
    def get_document_code(document_type):
        """Retourne le code du type de document."""
        return settings.DOCUMENT_TYPE_CODES.get(document_type, 'DOC')
    
    @staticmethod
    def get_archive_root(memoire):
        """Retourne le dossier racine d'archivage selon le type de document."""
        if memoire.type_document == Memoire.TypeDocument.MEMOIRE:
            return settings.MEMOIRES_ROOT
        return settings.THESES_ROOT
    
    @staticmethod
    def get_full_faculty_name(abbreviation):
        """Retourne le nom complet de la faculté à partir de son abréviation."""
        return settings.FACULTY_FULL_NAMES.get(abbreviation, abbreviation)
    
    @staticmethod
    def generate_document_name(memoire):
        """
        Génère le nom du document selon la nomenclature:
        FS_MEM_BC_26_0001
        
        Format: {FACULTE}_{TYPE}_BC_{ANNEE}_{NUMERO}
        """
        # Récupérer l'abréviation de la faculté depuis le champ filiere
        faculty_abbr = DocumentArchiveService.get_faculty_abbreviation(
            memoire.filiere or ''
        )
        
        # Si pas de filière, essayer de récupérer depuis les préférences (fallback)
        if faculty_abbr == 'AUTRE' and hasattr(memoire.author, 'preferences'):
            faculty_from_prefs = memoire.author.preferences.get('faculte', '')
            if faculty_from_prefs:
                logger.info(f"   Faculté depuis préférences: {faculty_from_prefs}")
                faculty_abbr = DocumentArchiveService.get_faculty_abbreviation(faculty_from_prefs)
        
        # Code du type de document
        document_code = DocumentArchiveService.get_document_code(
            memoire.type_document
        )
        
        # Année
        year = timezone.now().year
        year_short = str(year)[-2:]
        
        # Récupérer le prochain numéro de séquence
        sequence_number = DocumentSequence.get_next_number(
            year=year,
            document_type=memoire.type_document,
            faculty=faculty_abbr
        )
        
        # Format du numéro avec padding (4 chiffres)
        number_padded = f"{sequence_number:0{settings.SEQUENCE_PADDING}d}"
        
        # Construire le nom du fichier - SANS ESPACE
        doc_name = f"{faculty_abbr}_{document_code}_BC_{year_short}_{number_padded}"
        
        logger.info(f"   Nom généré: {doc_name}")
        return doc_name, sequence_number
    
    @staticmethod
    def archive_document(memoire):
        """
        Archive le document PDF d'un mémoire/thèse validé.
        Renomme et déplace le fichier dans le dossier approprié.
        """
        logger.info(f"📄 Tentative d'archivage pour le mémoire {memoire.id}")
        logger.info(f"   Statut: {memoire.status}")
        logger.info(f"   Filière en base: '{memoire.filiere}'")
        logger.info(f"   PDF file: {memoire.pdf_file}")
        
        if not memoire.pdf_file:
            logger.error(f"❌ Aucun PDF trouvé pour le mémoire {memoire.id}")
            return {'success': False, 'error': 'Aucun PDF trouvé'}
        
        # On autorise l'archivage pour verification_ok, en_attente_quitus, quitus_disponible
        allowed_statuses = ['verification_ok', 'en_attente_quitus', 'quitus_disponible']
        if memoire.status not in allowed_statuses:
            logger.warning(f"⚠️ Le mémoire {memoire.id} n'est pas dans un statut autorisé (statut: {memoire.status})")
            return {'success': False, 'error': f'Statut invalide: {memoire.status}'}
        
        try:
            # 1. Récupérer le chemin du fichier source
            source_path = memoire.pdf_file.path
            logger.info(f"   Source path: {source_path}")
            
            if not os.path.exists(source_path):
                logger.error(f"❌ Fichier source introuvable: {source_path}")
                return {'success': False, 'error': 'Fichier source introuvable'}
            
            # 2. Générer le nouveau nom
            doc_name, sequence_number = DocumentArchiveService.generate_document_name(memoire)
            logger.info(f"   Nouveau nom: {doc_name}")
            
            # 3. Construire le chemin de destination
            # Récupérer l'abréviation depuis la filière
            faculty_abbr = DocumentArchiveService.get_faculty_abbreviation(
                memoire.filiere or ''
            )
            
            # Si toujours AUTRE, essayer depuis les préférences
            if faculty_abbr == 'AUTRE' and hasattr(memoire.author, 'preferences'):
                faculty_from_prefs = memoire.author.preferences.get('faculte', '')
                if faculty_from_prefs:
                    faculty_abbr = DocumentArchiveService.get_faculty_abbreviation(faculty_from_prefs)
            
            # Si toujours AUTRE, utiliser AUTRE
            if faculty_abbr == 'AUTRE':
                faculty_abbr = 'AUTRE'
            
            year = timezone.now().year
            
            # Dossier racine (THESES ou MEMOIRES)
            root_dir = DocumentArchiveService.get_archive_root(memoire)
            logger.info(f"   Root dir: {root_dir}")
            
            # Structure: ROOT/FACULTE/ANNEE/
            dest_dir = os.path.join(root_dir, faculty_abbr, str(year))
            logger.info(f"   Destination: {dest_dir}")
            
            # Créer le dossier s'il n'existe pas
            os.makedirs(dest_dir, exist_ok=True)
            
            # Extension du fichier source
            ext = os.path.splitext(source_path)[1]
            if not ext:
                ext = '.pdf'
            
            # Nettoyer le nom du fichier (supprimer les espaces, caractères spéciaux)
            clean_doc_name = doc_name.replace(' ', '_').replace('/', '_')
            
            # Nom complet du fichier de destination
            dest_filename = f"{clean_doc_name}{ext}"
            dest_path = os.path.join(dest_dir, dest_filename)
            logger.info(f"   Fichier destination: {dest_path}")
            
            # 4. Copier le fichier
            shutil.copy2(source_path, dest_path)
            logger.info(f"   ✅ Fichier copié avec succès")
            
            # 5. Mettre à jour le modèle avec le chemin archivé
            archive_relative_path = os.path.join(
                'THESES' if memoire.type_document == Memoire.TypeDocument.THESE else 'MEMOIRES',
                faculty_abbr,
                str(year),
                dest_filename
            )
            
            # Sauvegarder les informations dans le modèle
            memoire.archive_path = archive_relative_path
            memoire.document_name = clean_doc_name
            memoire.sequence_number = sequence_number
            memoire.archived_at = timezone.now()
            memoire.is_archived = True
            memoire.save()
            
            logger.info(f"✅ Document archivé avec succès:")
            logger.info(f"   Nom: {clean_doc_name}")
            logger.info(f"   Emplacement: {dest_dir}")
            logger.info(f"   Faculté: {faculty_abbr} - {DocumentArchiveService.get_full_faculty_name(faculty_abbr)}")
            logger.info(f"   Année: {year}")
            logger.info(f"   Numéro: {sequence_number}")
            
            # Retourner les informations
            return {
                'success': True,
                'original_path': source_path,
                'archive_path': dest_path,
                'archive_relative_path': archive_relative_path,
                'document_name': clean_doc_name,
                'document_full_name': f"{clean_doc_name}.pdf",
                'sequence_number': sequence_number,
                'faculty': faculty_abbr,
                'faculty_name': DocumentArchiveService.get_full_faculty_name(faculty_abbr),
                'year': year,
                'document_type': memoire.type_document,
                'document_type_display': memoire.get_type_document_display(),
            }
            
        except Exception as e:
            logger.error(f"❌ Erreur lors de l'archivage du document {memoire.id}: {str(e)}")
            import traceback
            traceback.print_exc()
            return {
                'success': False,
                'error': str(e)
            }

    @staticmethod
    def get_public_url(memoire):
        """
        Retourne l'URL publique du document archivé.
        Utilise une URL relative pour éviter les problèmes de domaine.
        """
        if not memoire.archive_path:
            return None
        
        # URL relative qui fonctionne avec l'API
        return f"/api/documents/archive/{memoire.archive_path}/"
    
    @staticmethod
    def get_archive_info(memoire):
        """
        Retourne les informations d'archivage d'un document.
        """
        if not memoire.archive_path:
            return None
        
        # Extraire la faculté et l'année depuis le chemin
        path_parts = memoire.archive_path.split('/')
        faculty = path_parts[1] if len(path_parts) > 1 else None
        year = path_parts[2] if len(path_parts) > 2 else None
        
        return {
            'document_name': memoire.document_name,
            'document_full_name': f"{memoire.document_name}.pdf" if memoire.document_name else None,
            'sequence_number': memoire.sequence_number,
            'archive_path': memoire.archive_path,
            'archived_at': memoire.archived_at,
            'public_url': DocumentArchiveService.get_public_url(memoire),
            'faculty': faculty,
            'year': year,
        }