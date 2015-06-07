from django.contrib.auth.models import User
from django.db import models

class Note(models.Model):
    title = models.CharField(max_length=60)
    user = models.ForeignKey(User)
    creation_date_time = models.DateTimeField(auto_now=True)
    html_text = models.TextField(null=True)
    last_use_date_time = models.DateTimeField(auto_now=True)
    def json_decoder(obj):
        return Note(title=obj['title'], pk=obj['noteId'],html_text=obj['html_text'])