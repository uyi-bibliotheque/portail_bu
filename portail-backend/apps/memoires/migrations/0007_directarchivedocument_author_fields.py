from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('memoires', '0006_directarchivedocument'),
    ]

    operations = [
        migrations.AddField(
            model_name='directarchivedocument',
            name='author_full_name',
            field=models.CharField(blank=True, default='', max_length=255),
        ),
        migrations.AddField(
            model_name='directarchivedocument',
            name='author_name',
            field=models.CharField(blank=True, default='', max_length=255),
        ),
    ]
