# Generated by Django 4.2.2 on 2024-04-25 23:13

import criticalevents.models
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("criticalevents", "0006_asset_photo_alter_floor_floor_plan_and_more"),
    ]

    operations = [
        migrations.CreateModel(
            name="MaintenanceLog",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("notes", models.TextField(max_length=500)),
                (
                    "photo",
                    models.ImageField(
                        blank=True,
                        null=True,
                        upload_to=criticalevents.models.maintenance_log_upload_to,
                    ),
                ),
                (
                    "asset",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="maintenance_logs",
                        to="criticalevents.asset",
                    ),
                ),
                (
                    "organization",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to="criticalevents.organization",
                    ),
                ),
            ],
            options={
                "abstract": False,
            },
        ),
    ]