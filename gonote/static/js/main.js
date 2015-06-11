var cache = {};

$(document).ready(function() {

    $('#editor').redactor();

    loadNotes();
});



function loadNotes(needDestroy) {
    if (needDestroy)
        $('#jstree_div').jstree().destroy();


    $.when(                 // multiple ajax call

        $.get('/folders'),
        $.get('/notes')

    ).then(function(foldersResponse, notesResponse) {

            var folders = foldersResponse[0];
            var notes = notesResponse[0];

            var treeItems = [];

            for (var folder in folders) {
                var parentNodeId = folders[folder].fields.parent_folder_id;
                if (parentNodeId == -1) {
                    parentNodeId = "#";
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
                    parentNodeId = '#';
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

            cache['treeItems'] = treeItems;

            $('#jstree_div').jstree({
                'core': {
                    'data': treeItems,
                    'check_callback' : true
                },
                'plugins' : [ 'contextmenu', 'crrm', "ui", "search" ],
                 contextmenu: {items: customMenu}
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
        $.get('/note/' + data.node.original.noteid, function(note) {
            $("#noteId").val(note[0].pk);
            $("#folderId").val(note[0].fields.folder_id);
            $('#title').val(note[0].fields.title);
            $('#editor').html(note[0].fields.html_text);
        });
    });

    $('#jstree_div').on('delete_node.jstree', function (e, data) {
        var noteId = data.node.original.noteid;
        $.ajax({
            url: '/note/',
            type: 'DELETE',
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify(noteId),
            dataType: "text",
            success: function(result) {
                console.log(result)
            },
            error : function(result) {
            }
        });

    });
}

function customMenu(node) {
    var items = {
        deleteItem: { // The "delete" menu item
            label: "Delete",
            action: function (obj) {
                var refItem = obj.reference;
                $.jstree.reference("#jstree_div").delete_node(refItem);
            }
        }
    };

    if ($(node).hasClass("folder")) {
        // Delete the "delete" menu item
        delete items.deleteItem;
    }

    return items;
}

function openEditor() {
    $("#noteId").val(-1);
    $('#title').val('');
    $('#editor').html('');
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
    });


}