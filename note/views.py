import json
from django.http import HttpResponse
from document.models import Document
from note.models import Note
from django.core import serializers


def get_all_notes(request):
    return HttpResponse(
        serializers.serialize('json', Note.objects.filter(user = request.user.id), indent=2, use_natural_keys=False),
        content_type="application/json")

def get_note(request, note_id):
    if request.method == 'GET':
        note = Note.objects.filter(user = request.user.id, pk = note_id)
        return HttpResponse(
            serializers.serialize('json', note, indent=2, use_natural_keys=False), content_type="application/json")

def add_delete_note(request):
    if request.method == 'DELETE':
        Note.objects.get(user = request.user.id, pk=request.body.decode()).delete()
        return HttpResponse("OK")
    elif request.method == 'POST':
        decoded_json = request.body.decode('utf8')
        note = json.loads(decoded_json, object_hook=Note.json_decoder)
        note.user = request.user
        if note.pk == '-1':     #create new note
            note.pk = None
        note.save()
        return HttpResponse(note.pk)

def get_note_files(request, note_id):
    files = Document.objects.filter(user = request.user.id, note_id = note_id)
    return HttpResponse(
        serializers.serialize('json', files, indent=2, use_natural_keys=False), content_type="application/json")