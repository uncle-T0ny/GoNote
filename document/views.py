from django.http import HttpResponse
from document.models import Document
from django.core import serializers

def get_file(request, file_id):
    if request.method == 'GET':
        return HttpResponse(
            serializers.serialize('json', Document.objects.filter(user = request.user.id, pk = file_id), indent=2, use_natural_keys=False),
            content_type="application/json")

def add_delete_file(request, file_id):
    if request.method == 'POST':
        newdoc = Document(docfile = request.FILES['docfile'])
        newdoc.user = request.user
        newdoc.note_id = request.POST['noteId']
        newdoc.save()
        return HttpResponse("OK")
    pass