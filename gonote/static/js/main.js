$(document).ready(function() {


    $.get('/notes', function(notes) {
        var notes_arr = [];
        for (note in notes) {
            notes_arr.push(
            {   "noteid" : notes[note].pk, "parent" : "#",
                "text" : notes[note].fields.title,
                "icon": "glyphicon glyphicon-bookmark"}
            )
        }

        $('#jstree_demo_div').jstree({
            'core': {
                'data': notes_arr
            }
        });

    });


    $('#jstree_demo_div').on("select_node.jstree", function (e, data) {
        $.get('/note/' + data.node.original.noteid, function(note) {
            $('#note-text').html(note[0].fields.html_text);
        });
    });
});