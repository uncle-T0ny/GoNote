var cache = {};
var allowSaveNote = true;
var saveNoteTimeout = 400;

var t1;
var t2;

$(document).ready(function() {

    $('#editor').redactor();
    $('#deleteBtn').hide();
    $('#submitBtn').show();
    loadNotes();


    $('#editor').keyup(function () {
        if ($('#noteId').val() > 0) {

            setTimeout(function() {
                t2 = new Date().getTime();
                if (allowSaveNote) {
                    if (!t1 || ((t2-t1) > saveNoteTimeout)) {
                        t1 = new Date().getTime();
                        allowSaveNote = false;
                        saveNote(true);
                    }
                }
            }, 400);

        }

    });
});

function blockUI() {
    $.blockUI({'message': $('#progressBar') ,
        'css': { 'backgroundColor': 'transparent', border: '0px',}});
}
function unblockUI() {
    $.unblockUI();
}

function loadNotes(needDestroy) {
    blockUI();
    if (needDestroy)
        $('#jstree_div').jstree().destroy();

    $.when(                 // multiple ajax call

        $.get('/folders'),
        $.get('/notes')

    ).then(function(foldersResponse, notesResponse) {

            var folders = foldersResponse[0];
            var notes = notesResponse[0];

            var treeItems = [];

            var rootNote = {
                "parent" : '#',
                "id" : 'folder_root',
                "text" : 'Root',
                "icon": "glyphicon glyphicon-folder-open",
                "state"       : {
                    opened    : true,
                },
            };

            treeItems.push(rootNote);

            for (var folder in folders) {
                var parentNodeId = folders[folder].fields.parent_folder_id;
                if (parentNodeId == -1) {
                    parentNodeId = rootNote.id;
                } else {
                    parentNodeId = 'folder_' + parentNodeId;
                }
                treeItems.push(
                    {
                        "parent" : parentNodeId,
                        "id" : 'folder_' + folders[folder].pk,
                        "text" : folders[folder].fields.name,
                        "icon": "glyphicon glyphicon-folder-open",
                    }
                );
            }


            for (var note in notes) {
                var parentNodeId = notes[note].fields.folder_id;
                if (parentNodeId == -1) {
                    parentNodeId = rootNote.id;
                } else {
                    parentNodeId = 'folder_' + parentNodeId;
                }
                treeItems.push(
                    {
                        "id" : 'note_' + notes[note].pk,
                        "noteid" : notes[note].pk,
                        "folderId" : notes[note].fields.folder_id,
                        "hasFiles" : notes[note].fields.has_files,
                        "parent" : parentNodeId,
                        "text" : notes[note].fields.title,
                        "icon": "glyphicon glyphicon-bookmark",
                         "class": "jstree-dragable"
                    }
                );

            }

            unblockUI();
            cache['treeItems'] = treeItems;

            $('#jstree_div').jstree({
                'core': {
                    'data': treeItems,
                    'check_callback' : true
                },
                'plugins' : ['crrm', 'ui', 'search' ],
            });

            $('#jstree_div').bind("move_node.jstree", function (event, data){
                console.log('drag & drop')
            });

            var to;
            $('#treeSearchInp').keyup(function () {
                if(to) { clearTimeout(to); }
                to = setTimeout(function () {
                    var v = $('#treeSearchInp').val();
                    $('#jstree_div').jstree(true).search(v);
                }, 250);
            });
    });





    $('#jstree_div').on("select_node.jstree", function (e, data) {
        var hasFiles = data.node.original.hasFiles;
        $('#editorLabel').text('Edit note');
        $('#submitBtn').hide();
        if (data.node.id.indexOf('root') >= 0) {
            $('#deleteBtn').hide();
            return;
        } else if (data.node.id.indexOf('folder') >= 0) {
            if (data.node.children.length > 0) {
                $('#deleteBtn').hide();
            } else {
                $('#deleteBtn').text('Delete folder');
                $('#deleteBtn').show();
                $('#deleteBtn').attr('onclick', 'deleteSelectedNode(true, \''+ data.node.id +'\')');
            }
            return;
        } else {
            $('#deleteBtn').text('Delete note');
            $('#deleteBtn').attr('onclick', 'deleteSelectedNode(false, \''+ data.node.id +'\')');
            $('#deleteBtn').show();
        }

        blockUI();
        $.get('/note/' + data.node.original.noteid, function (note) {
            var noteId = note[0].pk;
            $("#noteId").val(noteId);
            $("#folderId").val(note[0].fields.folder_id);
            $('#title').val(note[0].fields.title);
            $('#editor').html(note[0].fields.html_text);
            if (hasFiles) {
                loadNoteFiles(noteId);
            } else {
                $('#fileLinks').html('');
            }
            unblockUI();
        });

    });

    //$('#jstree_div').on('delete_node.jstree', function (e, data) {
    //    var noteId = data.node.original.noteid;
    //    deleteNote(noteId);
    //});
};

function loadNoteFiles(noteId) {
    $('#fileLinks').block({ message: 'file loading...' });
    $.get('/note/' + noteId + '/files/', function(files) {
        var linksHtml = "";
        for(var idx in files) {
            var filePath = files[idx].fields.docfile;
            var fileId = files[idx].pk;
            var fileUrl = '/media/' + filePath;
            linksHtml += "<div id='fileLink_"+fileId+"'><a target='_blank' class='glyphicon glyphicon-download-alt'" +
            " href='"+ fileUrl +"'>"+filePath.substring(filePath.lastIndexOf('/') + 1)+"</a>" +
                " <a class='glyphicon glyphicon-remove' onclick='deleteFile("+fileId+");'></a></div>";
        }
        $('#fileLinks').html(linksHtml);
        $('#fileLinks').unblock();
    });
}

function deleteFile(fileId) {
    fileId = parseInt(fileId);
    blockUI();
    $.ajax({
        url: '/file/',
        type: 'DELETE',
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(fileId),
        dataType: "text",
        success: function(fileId) {
            $('#fileLink_' + fileId).remove();
            $.growl.notice({title:'Notice!', message: "File deleted successful." });
        },
        error : function(result) {
        }
    }).always(function() {
        unblockUI();
    });
}

function deleteNote(noteId) {
    noteId = parseInt(noteId);
    blockUI();
    $.ajax({
        url: '/note/',
        type: 'DELETE',
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(noteId),
        dataType: "text",
        success: function(result) {
            $.jstree.reference("#jstree_div").delete_node('note_' + noteId);
            $.growl.notice({title:'Notice!', message: "Note deleted successful." });
        },
        error : function(result) {
        }
    }).always(function() {
        unblockUI();
    });
}

function deleteFolder(folderId) {
    folderId = parseInt(folderId);
    blockUI();
    $.ajax({
        url: '/folder/',
        type: 'DELETE',
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(folderId),
        dataType: "text",
        success: function(result) {
            $.jstree.reference("#jstree_div").delete_node('folder_' + folderId);
            $.growl.notice({title:'Notice!', message: "Folder deleted successful." });
            console.log(result)
        },
        error : function(result) {
        }
    }).always(function() {
        unblockUI();
    });
}

function prepareView4NewNote() {
    $('#editorLabel').text('New note');
    $("#noteId").val(-1);
    $('#title').val('');
    $('#editor').html('');
    $('#fileLinks').html('');
    $('#submitBtn').show();
}

function prepareView4NewFolder() {

}

function saveFolder() {
    var folderName = $('#folderName').val();
    var parentFolderId = $('#folderId').val();
    var selectedFolderId = getSelectedFolderId();
    if (selectedFolderId >= 0) {
        parentFolderId = selectedFolderId;
    }
    var folderId = -1;


    var obj = {'folderId': folderId,'name' : folderName, 'parent_folder_id': parentFolderId};

    blockUI();
    $.ajax({
        url: '/folder/',
        type: 'POST',
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(obj),
        dataType: "text",
        success: function(result) {
            $.growl.notice({title:'Notice!', message: "Folder created successful." });
            loadNotes(true);
        },
        error : function(result) {
            $.growl.error({ message: "Some errors occurred: " + result });
        }
    }).always(function() {
        unblockUI();
    });

}

function saveNote(autoSave) {
    var noteId = $("#noteId").val();
    var title = $('#title').val();
    var html = $('#editor').html();
    var folderId = getSelectedFolderId();
    if (parseInt(folderId) < 0) {
        folderId = $("#folderId").val();
    }

    if (!noteId) noteId = -1;
    var obj = {'noteId' : noteId, 'title': title, 'html_text': html, 'folder': folderId};

    if (!autoSave) {
        blockUI();
    }
    return $.ajax({
        url: '/note/',
        type: 'POST',
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(obj),
        dataType: "text",
        success: function(result) {
            $("#noteId").val(result);
            if (!autoSave) {
                if (noteId == -1) {
                    $.growl.notice({title:'Notice!', message: "Note created successful." });
                } else {
                    $.growl.notice({title:'Notice!', message: "Note updated successful." });
                }
                loadNotes(true);
            }
        },
        error : function(result) {
            if (!autoSave) {
                $.growl.error({ message: "Some errors occurred: " + result });
            }
        },
        timeout: saveNoteTimeout
    }).always(function() {
        if (!autoSave) {
            unblockUI();
        }
        allowSaveNote = true;
    });

}

function getSelectedFolderId(selectedNodeId) {
    var nodeId = selectedNodeId? selectedNodeId : $('#jstree_div').jstree('get_selected')[0];

    if (nodeId && (nodeId != 'folder_root' && nodeId.indexOf('folder') >= 0)) {
        return  nodeId.substring('folder_'.length);
    } else {
        return -1;
    }
}

function getSelectedNoteId(selectedNodeId) {
    var nodeId = selectedNodeId? selectedNodeId : $('#jstree_div').jstree('get_selected')[0];
    if (nodeId && nodeId.indexOf('note') >= 0) {
        return  nodeId.substring('note_'.length);
    } else {
        return -1;
    }
}

function deleteSelectedNode(ifFolder, nodeId) {
    if (ifFolder) {
        deleteFolder(nodeId.substring('folder_'.length));
    } else {
        deleteNote(nodeId.substring('note_'.length));

    }
}