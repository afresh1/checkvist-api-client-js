// $Id: checkvist_api.js,v 1.11 2011/08/12 19:31:01 andrew Exp $
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
        var parameters = [ 'username', 'remote_key' ];
        var callbacks  = {
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

            thatT._action = function(action, options) {
                options = options || {};
                var parameters = [ 'token' ];
                var callbacks  = {
                    onSuccess: function(transport, callback) {
                        var items = [];
                        transport.responseJSON.each(function(item) { 
                            items.push( task(item) ); 
                        });
                        if (callback) {
                            callback(items);
                        }
                        else {
                            console.log(items);
                        }
                    }
                };

                options.method = 'post';
                my.request('checklists/' + thatL.id + '/tasks/' 
                        + thatT.id + '/' + action + '.json', 
                        options, parameters, callbacks);
            };

            thatT.close      = function(o) { thatT._action('close',      o) };
            thatT.invalidate = function(o) { thatT._action('invalidate', o) };
            thatT.reopen     = function(o) { thatT._action('reopen',     o) };

            thatT.getComments = function(options) {
                options = options || {};
                var parameters = [ 'token' ];
                var callbacks  = {
                    onSuccess: function(transport, callback) {
                        var items = [];
                        transport.responseJSON.each(function(item) { 
                            items.push( comment(item) ); 
                        });
                        if (callback) {
                            callback(items);
                        }
                        else {
                            console.log(items);
                        }
                    }
                };

                options.method = 'get';
                my.request('checklists/' + thatL.id + '/tasks/' 
                        + thatT.id + '/comments.json', 
                        options, parameters, callbacks);
            };
            thatT.addComment = function(listId,taskId) {};

            return thatT;
        };

        thatL.update = function(name, public) {};
        thatL.delete = function() {};

        thatL.getTasks = function(options) {
            options = options || {};
            var parameters = [ 'token', 'with_notes' ];
            var callbacks  = {
                onSuccess: function(transport, callback) {
                    var items = [];
                    transport.responseJSON.each(function(item) { 
                        items.push( task(item) ); 
                    });
                    if (callback) {
                        callback(items);
                    }
                    else {
                        console.log(items);
                    }
                }
            };

            options.method = 'get';
            my.request('checklists/' + thatL.id + '/tasks.json', 
                       options, parameters, callbacks);
        };

        thatL.getTask = function(options) {
            options = options || {};
            var parameters = [ 'token', 'with_notes' ];
            var callbacks  = {
                onSuccess: function(transport, callback) {
                    var items = [];
                    transport.responseJSON.each(function(item) { 
                        items.push( task(item) ); 
                    });
                    if (callback) {
                        callback(items);
                    }
                    else {
                        console.log(items);
                    }
                }
            };

            var id = options.id;
            delete options.id;

            console.log('getTask', id);

            options.method = 'get';
            my.request('checklists/' + thatL.id + '/tasks/' + id + '.json', 
                options, parameters, callbacks);
        };

        thatL.addTask = function(content, parentId, position) {};

        thatL.importTasks = function(content) {};

        return thatL;
    };
     
    that.getLists = function(options) {
        options = options || {};
        var parameters = [ 'token', 'archived' ];
        var callbacks  = {
            onSuccess: function(transport, callback) {
                var items = [];
                transport.responseJSON.each(function(item) { 
                    items.push( list(item) ); 
                });
                if (callback) {
                    callback(items);
                }
                else {
                    console.log(items);
                }
            }
        };

        options.method = 'get';
        my.request('checklists.json', options, parameters, callbacks);
    };

    that.getList = function(options) {
        options = options || {};
        var parameters = [ 'token' ];
        var callbacks  = {
            onSuccess: function(transport, callback) {
                var item = list( transport.responseJSON );
                if (callback) {
                    callback(item);
                }
                else {
                    console.log(item);
                }
            }
        };

        var id = options.id;
        delete options.id;

        console.log('getList', id);

        options.method = 'get';
        my.request('checklists/' + id + '.json', 
            options, parameters, callbacks);
    };

    that.addList = function(options) {
        options = options || {};
        var parameters = [ 'token', 'name', 'public' ];
        var callbacks  = {
            onSuccess: function(transport, callback) {
                var item = list( transport.responseJSON );
                if (callback) {
                    callback(item);
                }
                else {
                    console.log(item);
                }
            }
        };

        options.method = 'put';
        my.request('checklists.json', 
            options, parameters, callbacks);
    };

    return that;
}
