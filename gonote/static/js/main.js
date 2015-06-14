var cache = {};

$(document).ready(function() {

    $('#editor').redactor();

    loadNotes();
});

function blockUI() {
    $.blockUI({'message': $('#progressBar') ,
        'css': { 'backgroundColor': 'transparent', border: '0px',}});
}
function unblockUI() {
    $.unblockUI();
}

function loadNotes(needDestroy) {
    if (needDestroy)
        $('#jstree_div').jstree().destroy();
    blockUI();

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
                        "parent" : parentNodeId,
                        "text" : notes[note].fields.title,
                        "icon": "glyphicon glyphicon-bookmark"
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
                'plugins' : ['crrm', "ui", "search" ],
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
        if (data.node.id.indexOf('folder') >= 0) {
            return;
        }
        blockUI();
        $.get('/note/' + data.node.original.noteid, function(note) {
            $("#noteId").val(note[0].pk);
            $("#folderId").val(note[0].fields.folder_id);
            $('#title').val(note[0].fields.title);
            $('#editor').html(note[0].fields.html_text);
            unblockUI();
        });
    });

    //$('#jstree_div').on('delete_node.jstree', function (e, data) {
    //    var noteId = data.node.original.noteid;
    //    deleteNote(noteId);
    //});
};

function deleteNote(noteId) {
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
            console.log(result)
        },
        error : function(result) {
        }
    }).always(function() {
        unblockUI();
    });
}

function deleteFolder(folderId) {
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
    $("#noteId").val(-1);
    $('#title').val('');
    $('#editor').html('');
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

function saveNote() {
    var noteId = $("#noteId").val();
    var title = $('#title').val();
    var html = $('#editor').html();
    var selectedNode = $('#jstree_div').jstree('get_selected')[0];
    var folderId = $("#folderId").val();
    if (selectedNode && selectedNode.indexOf('folder') >= 0) {
        folderId = selectedNode.substring('folder_'.length);
    }

    if (!noteId) noteId = -1;
    var obj = {'noteId' : noteId, 'title': title, 'html_text': html, 'folder': folderId};

    blockUI();
    $.ajax({
        url: '/note/',
        type: 'POST',
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(obj),
        dataType: "text",
        success: function(result) {
            if (noteId == -1) {
                $.growl.notice({title:'Notice!', message: "Note created successful." });
            } else {
                $.growl.notice({title:'Notice!', message: "Note updated successful." });
            }
            $("#noteId").val(result);
            loadNotes(true);
        },
        error : function(result) {
            $.growl.error({ message: "Some errors occurred: " + result });
        }
    }).always(function() {
        unblockUI();
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

function deleteSelectedNode() {
    var selectedNodeId = $('#jstree_div').jstree('get_selected')[0];
    var selectedFolderId = parseInt(getSelectedFolderId(selectedNodeId));
    var selectedNoteId = parseInt(getSelectedNoteId(selectedNodeId));
    //todo delete folder functionality
    if (selectedFolderId != 'root') {
        deleteFolder(selectedFolderId);
    }
    if (selectedNoteId >= 0) {
        deleteNote(selectedNoteId);
    }
}