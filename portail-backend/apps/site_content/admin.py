# apps/site_content/admin.py
from django.contrib import admin
from django.utils.html import format_html
from .models import Article, ContactMessage


@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'is_published', 'is_event', 'is_expired', 'created_at', 'image_preview')
    list_filter = ('category', 'is_published', 'is_event')
    search_fields = ('title', 'content')
    date_hierarchy = 'created_at'
    ordering = ('-created_at',)
    fieldsets = (
        ('Informations principales', {
            'fields': ('title', 'content', 'category')
        }),
        ('Image', {
            'fields': ('image', 'image_url'),
            'description': 'Vous pouvez soit uploader une image localement, soit fournir une URL externe (CDN, Cloudinary, etc.)'
        }),
        ('Publication', {
            'fields': ('is_published', 'publish_until')
        }),
        ('Événement', {
            'fields': ('is_event', 'event_date')
        }),
    )

    def image_preview(self, obj):
        """Affiche un aperçu de l'image dans la liste admin."""
        image_url = obj.get_image_display()
        if image_url:
            return format_html('<img src="{}" style="max-height:50px; max-width:100px; border-radius:4px; object-fit:cover;" />', image_url)
        return "—"
    image_preview.short_description = "Aperçu image"


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ('subject', 'name', 'email', 'is_read', 'created_at')
    list_filter = ('is_read', 'created_at')
    search_fields = ('name', 'email', 'subject', 'message')
    readonly_fields = ('id', 'created_at')
    ordering = ('-created_at',)
    fieldsets = (
        ('Informations du message', {
            'fields': ('name', 'email', 'subject', 'message')
        }),
        ('Statut', {
            'fields': ('is_read',)
        }),
        ('Métadonnées', {
            'fields': ('id', 'created_at'),
            'classes': ('collapse',)
        }),
    )