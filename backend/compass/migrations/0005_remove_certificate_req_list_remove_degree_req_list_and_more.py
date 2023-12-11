# Generated by Django 4.2.7 on 2023-11-26 17:36

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ('compass', '0004_customuser_net_id_customuser_university_id_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='certificate',
            name='req_list',
        ),
        migrations.RemoveField(
            model_name='degree',
            name='req_list',
        ),
        migrations.RemoveField(
            model_name='major',
            name='req_list',
        ),
        migrations.RemoveField(
            model_name='minor',
            name='req_list',
        ),
        migrations.RemoveField(
            model_name='requirement',
            name='req_list',
        ),
        migrations.AddField(
            model_name='certificate',
            name='max_counted',
            field=models.IntegerField(null=True),
        ),
        migrations.AddField(
            model_name='certificate',
            name='min_needed',
            field=models.IntegerField(default=1),
        ),
        migrations.AddField(
            model_name='degree',
            name='max_counted',
            field=models.IntegerField(null=True),
        ),
        migrations.AddField(
            model_name='degree',
            name='min_needed',
            field=models.IntegerField(default=1),
        ),
        migrations.AddField(
            model_name='major',
            name='max_counted',
            field=models.IntegerField(null=True),
        ),
        migrations.AddField(
            model_name='major',
            name='min_needed',
            field=models.IntegerField(default=1),
        ),
        migrations.AddField(
            model_name='minor',
            name='max_counted',
            field=models.IntegerField(null=True),
        ),
        migrations.AddField(
            model_name='minor',
            name='min_needed',
            field=models.IntegerField(default=1),
        ),
        migrations.AddField(
            model_name='requirement',
            name='certificate',
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='req_list',
                to='compass.certificate',
            ),
        ),
        migrations.AddField(
            model_name='requirement',
            name='degree',
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='req_list',
                to='compass.degree',
            ),
        ),
        migrations.AddField(
            model_name='requirement',
            name='major',
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='req_list',
                to='compass.major',
            ),
        ),
        migrations.AddField(
            model_name='requirement',
            name='minor',
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='req_list',
                to='compass.minor',
            ),
        ),
        migrations.AddField(
            model_name='requirement',
            name='parent',
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='req_list',
                to='compass.requirement',
            ),
        ),
        migrations.AlterField(
            model_name='certificate',
            name='urls',
            field=models.JSONField(null=True),
        ),
        migrations.AlterField(
            model_name='degree',
            name='urls',
            field=models.JSONField(null=True),
        ),
        migrations.AlterField(
            model_name='major',
            name='urls',
            field=models.JSONField(null=True),
        ),
        migrations.AlterField(
            model_name='minor',
            name='urls',
            field=models.JSONField(null=True),
        ),
        migrations.AlterField(
            model_name='requirement',
            name='dist_req',
            field=models.JSONField(null=True),
        ),
        migrations.AlterField(
            model_name='requirement',
            name='double_counting_allowed',
            field=models.BooleanField(null=True),
        ),
    ]
