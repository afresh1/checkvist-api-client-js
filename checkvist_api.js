// $Id: checkvist_api.js,v 1.6 2011/08/12 17:48:01 andrew Exp $
checkvist_api = function(spec) {
    var that = {};
    var my = {};
    spec = spec || {};
    spec.baseURL = spec.baseURL || 'https://checkvist.com/';

    my.request = function(url, options, p, cb) {
        var callback;
        options = options || {};
        options.parameters = options.parameters || {};
        p = p || [];
        cb = cb || {};

        p.each( function(item) {
            options.parameters[item] = options[item]
                || options.parameters[item]
                || spec[item]
                || that[item];
            delete options[item];
        });

        for (item in cb) {
            if (cb.hasOwnProperty(item)) {
                callback = options[item];
                options[item] = function(transport) {
                    cb[item](transport, callback);
                };
            }
        }

        new Ajax.Request(spec.baseURL + url, options);
    };

    that.login = function(options) {
        options = options || {};
        parameters = [ 'username', 'remote_key' ];
        callbacks = {
            onSuccess: function(transport, callback) {
                that.token = transport.responseText.replace(/"/g, '');

                if (callback) {
                    callback(that.token);
                }
                else {
                    console.log(that.token);
                }

            }
        };

        delete that.token;
        options.method = 'post';
        my.request('auth/login.json', options, parameters, callbacks);
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
        options.method = 'get';

        var parameters = [ 'token', 'archived' ];

        var callbacks = {
            onSuccess: function(transport, callback) {
                var lists = [];
                transport.responseJSON.each(function(item) { 
                    lists.push( list(item) ); 
                });
                if (callback) {
                    callback(lists);
                }
                else {
                    console.log(lists);
                }
            }
        };

        my.request('checklists.json', options, parameters, callbacks);
    };

    that.getList = function(listId) {};
    that.addList = function(name, public) {};

    return that;
}
