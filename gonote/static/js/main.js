$(document).ready(function() {

    $('#editor').redactor();

    loadNotes();
});

function loadNotes(needDestroy) {
    if (needDestroy)
        $('#jstree_div').jstree().destroy();

    $.get('/notes', function(notes) {
        var notes_arr = [];
        for (note in notes) {
            notes_arr.push(
                {   "noteid" : notes[note].pk,
                    "parent" : "#",
                    "text" : notes[note].fields.title,
                    "icon": "glyphicon glyphicon-bookmark"
                }
            )
        }

        $('#jstree_div').jstree({
            'core': {
                'data': notes_arr,
                'check_callback' : true
            },
            'plugins' : [ 'contextmenu', 'crrm', "ui"],
            contextmenu: {items: customMenu}
        });
    });

    $('#jstree_div').on("select_node.jstree", function (e, data) {
        $.get('/note/' + data.node.original.noteid, function(note) {
            $("#noteId").val(note[0].pk);
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
    if (!noteId) noteId = -1;
    var obj = {'noteId' : noteId, 'title': title, 'html_text': html};

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