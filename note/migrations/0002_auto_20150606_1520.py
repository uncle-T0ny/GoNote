# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import datetime
from django.utils.timezone import utc


class Migration(migrations.Migration):

    dependencies = [
        ('note', '0001_initial'),
    ]

    operations = [
        migrations.RenameField(
            model_name='note',
            old_name='creation_date',
            new_name='creation_date_time',
        ),
        migrations.AddField(
            model_name='note',
            name='last_use_date_time',
            field=models.DateTimeField(default=datetime.datetime(2015, 6, 6, 15, 20, 21, 423959, tzinfo=utc)),
            preserve_default=False,
        ),
    ]
