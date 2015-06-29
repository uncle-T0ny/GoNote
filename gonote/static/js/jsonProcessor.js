function JsonProcessor() {
    this.rootNodeTitle = 'Root';
    this.rootNodeId = 'folder_root';
}

JsonProcessor.prototype.buildRootNode = function () {
    return {
        "parent": '#',
        "id": this.rootNodeId,
        "text": this.rootNodeTitle,
        "icon": "glyphicon glyphicon-folder-open",
        "state": {
            opened: true,
        },
    }
}

JsonProcessor.prototype.buildFolder = function (folderId, parentFolderId, title) {
    return {
        "id": 'folder_' + folderId,
        "parent": parentFolderId == -1 ? this.rootNodeId : 'folder_' + parentFolderId,
        "text": title,
        "icon": "glyphicon glyphicon-folder-open",
    }
}

JsonProcessor.prototype.buildNote = function (noteId, folderId, hasFiles, title) {
    return {
        "id": 'note_' + noteId,
        "noteid": noteId,
        "folderId": folderId,
        "hasFiles": hasFiles,
        "parent": folderId == -1 ? this.rootNodeId : 'folder_' + folderId,
        "text": title,
        "icon": "glyphicon glyphicon-bookmark",
        "class": "jstree-dragable"
    }
}


