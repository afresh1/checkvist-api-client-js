// $Id: checkvist_api.js,v 1.3 2011/08/12 03:01:27 andrew Exp $
checkvist_api = function(spec) {
    var that = {};

    spec.baseURL = spec.baseURL || 'https://checkvist.com/';

    that.Success = function(resp) {
        console.log(resp);
    };

    that.login = function(user,key) {
        spec.username    = user || spec.username;
        spec.remote_key  = key  || spec.remote_key;

        spec.token = null;

        new Ajax.Request(spec.baseURL + 'auth/login.json', {
            method: 'POST', 
            parameters: {
                username:   spec.username,
                remote_key: spec.remote_key
            },
            onSuccess: function(key) {
                spec.token = key.responseText.replace(/"/g, '');
                console.log(spec.token);
            }
        });

    };


    var list = function(specL) {
        var thatL = specL || {};
        var task = function(specT) {
            var thatT = specT || {};
            var comment = function(specC) {
                var thatC = specC || {};

                thatC.update = function() {};
                thatC.delete = function() {};

                return thatC;
            };

            thatT.update = function() {};
            thatT.delete = function() {};
            thatT.setAction = function() {};

            thatT.getComments = function(listId,taskId) {};
            thatT.addComment = function(listId,taskId) {};

            return thatT;
        };

        thatL.update = function(name, public) {};
        thatL.delete = function() {};

        thatL.getTasks = function(withNotes) {};
        thatL.importTasks = function(content) {};

        thatL.getTask = function(taskId, withNotes) {};
        thatL.addTask = function(content, parentId, position) {};

        return thatL;
    };
     
    that.getLists = function(archived) {
        new Ajax.Request(spec.baseURL + 'checklists.json', {
            method: 'get', 
            onSuccess: function(transport) {
                var i, lists = [], json = transport.responseJSON;
                json.each(function(item) { lists.push( list(item) ); });
                console.log(lists);
            }
        });
    };

    that.getList = function(listId) {};
    that.addList = function(name, public) {};

    return that;
}
