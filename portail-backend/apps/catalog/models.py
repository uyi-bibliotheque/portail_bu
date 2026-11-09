import re
import unicodedata

from django.db import models


def normalize_search_text(value):
    normalized = unicodedata.normalize('NFKD', str(value or '').casefold())
    without_accents = ''.join(
        character for character in normalized
        if not unicodedata.combining(character)
    )
    return re.sub(r'[^a-z0-9]+', ' ', without_accents).strip()


class PhysicalArchiveRecord(models.Model):
    source_file = models.CharField(max_length=512)
    source_sheet = models.CharField(max_length=128)
    source_row = models.PositiveIntegerField()
    document_type = models.CharField(max_length=128, blank=True, default='')
    title = models.CharField(max_length=1000)
    author = models.CharField(max_length=255, blank=True, default='')
    director = models.CharField(max_length=255, blank=True, default='')
    publication_info = models.CharField(max_length=500, blank=True, default='')
    degree_department = models.CharField(max_length=500, blank=True, default='')
    physical_description = models.CharField(max_length=255, blank=True, default='')
    physical_details = models.CharField(max_length=255, blank=True, default='')
    document_format = models.CharField(max_length=64, blank=True, default='')
    accompanying_material = models.CharField(max_length=255, blank=True, default='')
    general_note = models.TextField(blank=True, default='')
    classification = models.CharField(max_length=128, blank=True, default='')
    keywords = models.TextField(blank=True, default='')
    language = models.CharField(max_length=64, blank=True, default='')
    copy_count = models.CharField(max_length=32, blank=True, default='')
    copy_number = models.CharField(max_length=255, blank=True, default='')
    shelfmark = models.CharField(max_length=255, blank=True, default='')
    search_text = models.TextField(blank=True, default='')
    is_active = models.BooleanField(default=True, db_index=True)
    imported_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['title', 'author', 'shelfmark']
        constraints = [
            models.UniqueConstraint(
                fields=['source_file', 'source_sheet', 'source_row'],
                name='catalog_physical_archive_source_row_unique',
            ),
        ]
        indexes = [
            models.Index(fields=['is_active', 'document_type']),
        ]
        verbose_name = 'Archive physique'
        verbose_name_plural = 'Archives physiques'

    def update_search_text(self):
        searchable_values = (
            self.title,
            self.author,
            self.director,
            self.document_type,
            self.publication_info,
            self.degree_department,
            self.classification,
            self.keywords,
            self.language,
            self.copy_number,
            self.shelfmark,
        )
        self.search_text = normalize_search_text(' '.join(searchable_values))

    def save(self, *args, **kwargs):
        self.update_search_text()
        super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.title} — {self.author or "Auteur non renseigné"}'
