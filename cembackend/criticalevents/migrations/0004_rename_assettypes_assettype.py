# Generated by Django 4.2.2 on 2024-04-24 16:24

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("criticalevents", "0003_asset_floor_assettypes_assetproperty_and_more"),
    ]

    operations = [
        migrations.RenameModel(
            old_name="AssetTypes",
            new_name="AssetType",
        ),
    ]
