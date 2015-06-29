var jsonProcessor = new JsonProcessor();

var saveNoteTimeout = 400;

var timer;


$(document).ready(function() {

    $('#editor').redactor();
    $('#deleteBtn').hide();
    $('#submitBtn').show();
    loadNotes();


    $('#editor').keyup(function () {
        if ($('#noteId').val() > 0) {
            if (timer) clearTimeout(timer);
            timer = setTimeout(function() {
                saveNote(true);
            }, saveNoteTimeout);
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

function loadNotes() {
    blockUI();

    $.when(                 // multiple ajax call

        $.get('/folders'),
        $.get('/notes')

    ).then(function(foldersResponse, notesResponse) {

            var folders = foldersResponse[0];
            var notes = notesResponse[0];

            var treeItems = [];

            var rootNode = jsonProcessor.buildRootNode();

            treeItems.push(rootNode);

            for (var folder in folders) {
                treeItems.push(
                    jsonProcessor.buildFolder(folders[folder].pk,
                                                folders[folder].fields.parent_folder_id,
                                                folders[folder].fields.name)
                );
            }


            for (var note in notes) {
                treeItems.push(
                    jsonProcessor.buildNote(notes[note].pk,
                                            notes[note].fields.folder_id,
                                            notes[note].fields.has_files,
                                            notes[note].fields.title)
                );
            }

            unblockUI();

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
        //open node
        if (!data.node.state.opened) {
            data.instance.toggle_node(data.node);
        }

        var hasFiles = data.node.original.hasFiles;
        $('#editorLabel').text('Edit note');
        $('#submitBtn').hide();
        $('#uploadFileBtn').show();
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
    $('#uploadFileBtn').hide();
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
        success: function(newFolderId) {
            $.growl.notice({title:'Notice!', message: "Folder created successful." });
            var newFolder = jsonProcessor.buildFolder(newFolderId,
                                                      parentFolderId,
                                                      folderName);
            createAndSelectNode(newFolder);
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
        success: function (noteId) {
            $("#noteId").val(noteId);

            if (!autoSave) {
                if (noteId == -1) {
                    $.growl.notice({title: 'Notice!', message: "Note created successful."});
                } else {
                    $.growl.notice({title: 'Notice!', message: "Note updated successful."});
                }

                var newNote = jsonProcessor.buildNote(noteId,
                    folderId,
                    false,
                    title);

                createAndSelectNode(newNote);
            }
        },
        error: function (result) {
            if (!autoSave) {
                $.growl.error({message: "Some errors occurred: " + result});
            }
        },
        //timeout: autoSave ?saveNoteTimeout:0
    }).always(function () {
        if (!autoSave) {
            unblockUI();
        }
    });

}

function createAndSelectNode(newNodeJson) {
    var nodeId = $('#jstree_div').jstree("create_node", newNodeJson.parent, newNodeJson, 'last');
    $('#jstree_div').jstree("deselect_all");
    $('#jstree_div').jstree('select_node', nodeId);
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