# Generated by Django 4.2.6 on 2023-11-02 04:12

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('compass', '0002_alter_requirement_double_counting_allowed'),
    ]

    operations = [
        migrations.AlterField(
            model_name='requirement',
            name='dist_req',
            field=models.JSONField(null=True),
        ),
    ]