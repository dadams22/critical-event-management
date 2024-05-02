# Generated by Django 4.2.2 on 2024-05-02 17:45

import criticalevents.models
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("criticalevents", "0010_asset_next_maintenance_date"),
    ]

    operations = [
        migrations.AlterField(
            model_name="asset",
            name="next_maintenance_date",
            field=models.DateField(
                default=criticalevents.models.default_next_maintenance_date
            ),
        ),
    ]
