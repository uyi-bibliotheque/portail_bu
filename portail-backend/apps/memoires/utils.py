# apps/memoires/utils.py
import io
import os
import tempfile
from django.core.files.base import ContentFile
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY
from reportlab.lib import colors
from django.utils import timezone
import qrcode
from io import BytesIO


def generate_quitus_pdf(memoire):
    """
    Génère le PDF du quitus avec QR code et retourne un ContentFile.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer, 
        pagesize=A4, 
        rightMargin=72, 
        leftMargin=72, 
        topMargin=72, 
        bottomMargin=18
    )
    
    styles = getSampleStyleSheet()
    
    # Styles personnalisés
    title_style = ParagraphStyle(
        'TitleStyle',
        parent=styles['Heading1'],
        alignment=TA_CENTER,
        fontSize=18,
        spaceAfter=20,
        textColor=colors.HexColor('#0F2A4A')
    )
    
    subtitle_style = ParagraphStyle(
        'SubtitleStyle',
        parent=styles['Heading2'],
        alignment=TA_CENTER,
        fontSize=14,
        spaceAfter=30,
        textColor=colors.HexColor('#C9A86A')
    )
    
    normal_style = ParagraphStyle(
        'NormalStyle',
        parent=styles['Normal'],
        alignment=TA_JUSTIFY,
        fontSize=11,
        spaceAfter=12,
        leading=16
    )
    
    signature_style = ParagraphStyle(
        'SignatureStyle',
        parent=styles['Normal'],
        alignment=TA_CENTER,
        fontSize=12,
        spaceBefore=40
    )
    
    story = []
    
    # En-tête
    story.append(Paragraph("<b>BIBLIOTHÈQUE CENTRALE UNIVERSITAIRE</b>", title_style))
    story.append(Paragraph("<b>UNIVERSITÉ DE YAOUNDÉ I</b>", subtitle_style))
    story.append(Spacer(1, 20))
    story.append(Paragraph("<b>QUITUS DE BIBLIOTHÈQUE</b>", title_style))
    story.append(Spacer(1, 30))
    
    # Numéro de quitus
    quitus_number = f"QU-{memoire.id.hex[:8].upper()}-{timezone.now().year}"
    story.append(Paragraph(f"<b>N° {quitus_number}</b>", signature_style))
    story.append(Spacer(1, 20))
    
    # Contenu
    date_str = timezone.now().strftime("%d/%m/%Y à %H:%M")
    author_name = memoire.author.get_full_name() or memoire.author.username
    author_email = memoire.author.email or "Non renseigné"
    
    content_text = (
        f"Nous soussignés, Direction de la Bibliothèque Centrale Universitaire, "
        f"attestons par la présente que <b>{author_name}</b>, "
        f"inscrit(e) dans la filière <b>{memoire.department}</b>, a satisfait à "
        f"toutes ses obligations vis-à-vis de la bibliothèque pour l'année d'obtention <b>{memoire.graduation_year}</b>."
    )
    story.append(Paragraph(content_text, normal_style))
    story.append(Spacer(1, 10))
    
    deposit_text = (
        f"Il/Elle a régulièrement déposé la version numérique et la version imprimée "
        f"de son mémoire/thèse intitulé(e) :<br/><br/>"
        f"<i>« {memoire.title} »</i><br/><br/>"
        f"Ce document est délivré pour servir et valoir ce que de droit."
    )
    story.append(Paragraph(deposit_text, normal_style))
    
    story.append(Spacer(1, 30))
    
    # Informations supplémentaires
    info_data = [
        ['Date de dépôt', memoire.submitted_at.strftime("%d/%m/%Y") if memoire.submitted_at else "Non renseignée"],
        ['Date de validation', memoire.validated_at.strftime("%d/%m/%Y") if memoire.validated_at else "Non renseignée"],
        ['Date de génération', memoire.quitus_generated_at.strftime("%d/%m/%Y") if memoire.quitus_generated_at else timezone.now().strftime("%d/%m/%Y")],
    ]
    
    info_table = Table(info_data, colWidths=[200, 200])
    info_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#F8F6F1')),
        ('PADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(info_table)
    
    story.append(Spacer(1, 40))
    
    # Signature
    story.append(Paragraph(f"Fait à Yaoundé, le {date_str}", signature_style))
    story.append(Spacer(1, 10))
    
    # Ligne de signature
    story.append(Paragraph("_" * 50, signature_style))
    story.append(Paragraph("<b>Le Conservateur en Chef / Bibliothécaire</b>", signature_style))
    
    # Cachet / Mention
    story.append(Spacer(1, 20))
    if memoire.is_quitus_signed:
        story.append(Paragraph("<i>✅ Document Signé Électroniquement</i>", signature_style))
        story.append(Paragraph(f"<i>Signé le {memoire.quitus_signed_at.strftime('%d/%m/%Y à %H:%M') if memoire.quitus_signed_at else date_str}</i>", signature_style))
    else:
        story.append(Paragraph("<i>🔒 Document en attente de signature</i>", signature_style))
    
    # ─── QR Code ──────────────────────────────────────────────────────
    try:
        # Générer le QR code
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=4,
            border=4,
        )
        qr_data = f"https://portail.bcu-uyi.cm/memoires/{memoire.id}"
        qr.add_data(qr_data)
        qr.make(fit=True)
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Sauvegarder le QR dans un BytesIO
        qr_buffer = BytesIO()
        img.save(qr_buffer, format='PNG')
        qr_buffer.seek(0)
        
        # Ajouter le QR code en bas à droite
        # CORRECTION: Utiliser directement le buffer, pas ImageReader
        qr_size = 80
        qr_img = Image(qr_buffer, width=qr_size, height=qr_size)
        story.append(qr_img)
        
    except Exception as e:
        # Si le QR code ne peut pas être généré, continuer sans
        print(f"Erreur génération QR code: {e}")
        pass
    
    doc.build(story)
    
    pdf_value = buffer.getvalue()
    buffer.close()
    
    filename = f"quitus_{memoire.id}_{timezone.now().strftime('%Y%m%d')}.pdf"
    return filename, ContentFile(pdf_value)