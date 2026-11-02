from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('memoires', '0007_directarchivedocument_author_fields'),
    ]

    operations = [
        migrations.AddField(
            model_name='directarchivedocument',
            name='metadata_extracted',
            field=models.BooleanField(default=False),
        ),
    ]
