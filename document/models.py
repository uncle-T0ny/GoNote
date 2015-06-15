from django.contrib.auth.models import User
from django.db import models


class Document(models.Model):
    note_id = models.IntegerField(null=False)
    user = models.ForeignKey(User)
    docfile = models.FileField(upload_to='documents/%Y/%m/%d')
