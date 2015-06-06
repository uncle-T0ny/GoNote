from django.http import HttpResponse
from note.models import Note
from django.core import serializers


def get_all_notes(request):
    return HttpResponse(
        serializers.serialize('json', Note.objects.filter(user = request.user.id), indent=2, use_natural_keys=False),
        content_type="application/json")

def get_note(request, note_id):
    return HttpResponse(
        serializers.serialize('json', Note.objects.filter(user = request.user.id, pk = note_id), indent=2, use_natural_keys=False),
        content_type="application/json")