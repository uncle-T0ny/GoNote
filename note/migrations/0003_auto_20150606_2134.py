# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('note', '0002_auto_20150606_1520'),
    ]

    operations = [
        migrations.AlterField(
            model_name='note',
            name='creation_date_time',
            field=models.DateTimeField(auto_now=True),
        ),
        migrations.AlterField(
            model_name='note',
            name='last_use_date_time',
            field=models.DateTimeField(auto_now=True),
        ),
    ]
