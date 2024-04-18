# Generated by Django 4.2.2 on 2024-04-18 18:52

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('criticalevents', '0010_shorttoken'),
    ]

    operations = [
        migrations.CreateModel(
            name='Site',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('address', models.CharField(max_length=255)),
                ('bounds', models.JSONField()),
                ('floor_plan', models.ImageField(upload_to='floor_plans/')),
                ('floor_plan_bounds', models.JSONField()),
                ('location', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to='criticalevents.location')),
            ],
        ),
    ]
