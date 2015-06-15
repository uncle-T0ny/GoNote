from django.conf.urls import include, url, patterns
from django.contrib import admin
from document.views import add_delete_file, get_file
from folder.views import add_delete_folder, get_all_folders
from gonote.views import index, login_view, login, logout
from note.views import get_all_notes, get_note, add_delete_note

admin.autodiscover()

urlpatterns = patterns('',
    url(r'^$', index),
    (r'^admin/logout/$', logout),
    url(r'^admin/', include(admin.site.urls)),
    (r'^login-page/$', login_view),
    (r'^login/$', login),
    (r'^logout/$', logout),

    (r'^notes/$', get_all_notes),
    (r'^note/(\d+)$', get_note),
    (r'^note/$', add_delete_note),

    (r'^folders/$', get_all_folders),
    (r'^folder/$', add_delete_folder),

    (r'^file/$', add_delete_file),
    (r'^file/(\d+)$', get_file),
)
