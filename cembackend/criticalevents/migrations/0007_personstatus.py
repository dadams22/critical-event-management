# Generated by Django 4.2.2 on 2023-07-20 02:55

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('criticalevents', '0006_alert_sender'),
    ]

    operations = [
        migrations.CreateModel(
            name='PersonStatus',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('safe', models.BooleanField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('incident_report', models.ForeignKey(on_delete=django.db.models.deletion.RESTRICT, to='criticalevents.incidentreport')),
                ('person', models.ForeignKey(on_delete=django.db.models.deletion.RESTRICT, to='criticalevents.person')),
            ],
        ),
    ]
