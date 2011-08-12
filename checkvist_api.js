// $Id: checkvist_api.js,v 1.4 2011/08/12 16:44:57 andrew Exp $
checkvist_api = function(spec) {
    var that = {};
    spec = spec || {};
    spec.baseURL = spec.baseURL || 'https://checkvist.com/';

    that.login = function(options) {
        options = options || {};

        var onSuccess  = options.onSuccess;
        options.method = 'post';

        options.parameters = options.parameters || {};

        spec.username = options.username || options.parameters.username 
            || spec.username;
        delete options.username;
        options.parameters.username = spec.username;

        spec.remote_key = options.remote_key || options.parameters.remote_key 
            || spec.remote_key;
        delete options.remote_key;
        options.parameters.remote_key = spec.remote_key;

        options.onSuccess = function(transport) {
            that.token = transport.responseText.replace(/"/g, '');

            if (onSuccess) {
                onSuccess(that.token);
            }
            else {
                console.log(that.token);
            }

        };

        delete that.token;
        new Ajax.Request(spec.baseURL + 'auth/login.json', options);
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
     
    that.getLists = function(options) {
        options = options || {};

        var onSuccess = options.onSuccess;
        options.method = 'get';

        options.parameters = options.parameters || {};
        options.parameters.token = options.parameters.token || that.token;

        options.parameters.archived = options.archived 
                || options.parameters.archived;
        delete options.archived;

        options.onSuccess = function(transport) {
            var lists = [];
            transport.responseJSON.each(function(item) { 
                lists.push( list(item) ); 
            });
            if (onSuccess) {
                onSuccess(lists);
            }
            else {
                console.log(lists);
            }
        }

        new Ajax.Request(spec.baseURL + 'checklists.json', options);
    };

    that.getList = function(listId) {};
    that.addList = function(name, public) {};

    return that;
}
