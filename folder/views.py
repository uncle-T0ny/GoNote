import json
from django.http import HttpResponse
from django.core import serializers
from folder.models import Folder


def get_all_folders(request):
    return HttpResponse(serializers.serialize('json',Folder.objects.filter(user = request.user.id),
                            indent=2, use_natural_keys=False), content_type="application/json")

def add_delete_folder(request):
    if request.method == 'DELETE':
        Folder.objects.get(user = request.user.id, pk=request.body.decode()).delete()
        return HttpResponse("OK")
    elif request.method == 'POST':
        decoded_json = request.body.decode('utf8')
        folder = json.loads(decoded_json, object_hook=Folder.json_decoder)
        folder.user = request.user
        if int(folder.pk) == -1:     #create new folder
            folder.pk = None
        folder.save()
        return HttpResponse(folder.pk)