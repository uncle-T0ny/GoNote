from django.http import HttpResponse, HttpResponseRedirect
from document.models import Document
from django.core import serializers
from note.models import Note


def get_file(request, file_id):
    if request.method == 'GET':
        return HttpResponse(
            serializers.serialize('json', Document.objects.filter(user = request.user.id, pk = file_id), indent=2, use_natural_keys=False),
            content_type="application/json")

def add_delete_file(request):
    if request.method == 'DELETE':
        file_id = request.body.decode()
        document = Document.objects.get(user = request.user.id, pk=file_id)
        document.delete()
        documents_amount = len(Document.objects.filter(note_id=document.note_id))
        note = Note.objects.get(pk=document.note_id)
        if documents_amount == 0:
            note.has_files = False
        note.save()
        return HttpResponse(file_id)
    if request.method == 'POST':
        newdoc = Document(docfile = request.FILES['docfile'])
        newdoc.user = request.user
        newdoc.note_id = request.POST['noteId']
        newdoc.save()

        note = Note.objects.get(user = request.user.id, pk=newdoc.note_id)
        note.has_files = True
        note.save()
        return HttpResponseRedirect("/")