from django.contrib.auth import authenticate
from django.contrib.auth.decorators import login_required, permission_required
from django.http import HttpResponse, HttpResponseRedirect
from django.template import RequestContext
from django.template.loader import get_template
from note.models import Note
from django.contrib import auth

@login_required(login_url="/login-page/")
def index(request):
    notes = Note.objects.all()
    response = HttpResponse(get_template('layout.html').render(RequestContext(request, {'notes': notes})))
    return response

def login_view(request):
    return HttpResponse(get_template('login.html').render(RequestContext(request, {})))

def login(request):
    state = "Please log in below..."
    username = password = ''
    if request.POST:
        username = request.POST.get('username')
        password = request.POST.get('password')

        user = authenticate(username=username, password=password)
        if user is not None:
            if user.is_active:
                auth.login(request, user)
                state = "You're successfully logged in!"
            else:
                state = "Your account is not active, please contact the site admin."
        else:
            state = "Your username and/or password were incorrect."

    return HttpResponseRedirect("/")


def logout(request):
    auth.logout(request)
    return HttpResponseRedirect("/")