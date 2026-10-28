import uuid

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('memoires', '0005_memoire_is_archived_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='DirectArchiveDocument',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('source_path', models.CharField(max_length=1024, unique=True)),
                ('document_name', models.CharField(max_length=255)),
                ('title', models.CharField(max_length=500)),
                ('type_document', models.CharField(choices=[('MEMOIRE', 'Mémoire'), ('THESE', 'Thèse')], max_length=10)),
                ('faculty', models.CharField(default='AUTRE', max_length=64)),
                ('year', models.PositiveIntegerField(blank=True, null=True)),
                ('file_size', models.PositiveBigIntegerField()),
                ('modified_at', models.DateTimeField()),
                ('is_available', models.BooleanField(db_index=True, default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'Archive ajoutée directement',
                'verbose_name_plural': 'Archives ajoutées directement',
                'ordering': ['-modified_at', 'title'],
            },
        ),
    ]
