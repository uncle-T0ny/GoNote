from django.contrib.auth.models import User
from django.db import models

class Folder(models.Model):
    name = models.CharField(max_length=60)
    parent_folder_id = models.IntegerField(default=-1, null=True)
    user = models.ForeignKey(User)
    def json_decoder(obj):
        return Folder(name=obj['name'], pk=obj['folderId'],parent_folder_id=obj['parent_folder_id'])