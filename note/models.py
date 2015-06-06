from django.contrib.auth.models import User
from django.db import models

class Note(models.Model):
    title = models.CharField(max_length=60)
    user = models.ForeignKey(User)
    creation_date_time = models.DateTimeField()
    html_text = models.TextField(null=True)
    last_use_date_time = models.DateTimeField()