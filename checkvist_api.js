// $Id: checkvist_api.js,v 1.15 2011/09/19 18:28:49 andrew Exp $
/*
 * Copyright (c) 2011 Andrew Fresh <andrew@afresh1.com>
 *
 * Permission to use, copy, modify, and distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */

checkvist_api = function(spec) {
    var that = {};
    var my = {};
    spec = spec || {};
    spec.baseURL = spec.baseURL || 'https://checkvist.com/';

    my.serialize = function(obj) {
        var str = [];
        for(var p in obj) {
            if ( obj[p] !== undefined ) {
                str.push(p + "=" + encodeURIComponent(obj[p]));
            }
        }
        return str.join("&");
    };

    my.ajax = function(url, options) {
        options = options || {};
        options.parameters = options.parameters || {};

        var method = options.method.toUpperCase() || 'POST';

        if (method === 'PUT' || method === 'DELETE') {
            options.parameters._method = method;
            method = 'POST';
        }

        var qs = my.serialize(options.parameters);

        //console.log(method + ' ' +  url + '?' + qs);

        if (method === 'GET' || method === 'DELETE') {
            url += '?' + qs;
        }

        var xhReq = new XMLHttpRequest();
        xhReq.open(method, url, true);
        if (method === 'POST' || method === 'PUT') {
            xhReq.setRequestHeader("Content-type", 
                                   "application/x-www-form-urlencoded");
            if (qs) {
                xhReq.setRequestHeader("Content-length", qs.length);
            }
        }
        xhReq.setRequestHeader("Connection", "close");

        xhReq.onreadystatechange = function(e) {
            var location;

            if (xhReq.readyState !== 4) { return }
            clearTimeout(xmlHttpTimeout);

            if (xhReq.status === 200) {
                location = xhReq.getResponseHeader('Location');
                if (location && location.indexOf('http:') === 0) {
                    console.log("Not using https");
                    spec.baseURL = spec.baseURL.replace('https', 'http');
                }

                if (options.onSuccess) {
                    xhReq.responseJSON = JSON.parse(xhReq.responseText);
                    options.onSuccess(xhReq, e);
                }
                else {
                    console.log(xhReq);
                }
            }
            else {
                if (options.onError) {
                    options.onError(xhReq, e);
                }
                else {
                    console.log(xhReq.status + ': ' + xhReq.statusText)
                    console.log(xhReq)
                    console.log(e);
                }
            }
        }

        xhReq.send(qs);

        my.ajaxTimeout = function(){
            xhReq.responseText = "Timed out";
            xhReq.abort();
            alert("Request timed out");
        };
        var xmlHttpTimeout=setTimeout(my.ajaxTimeout,30000);
    };


    my.request = function(url, o, p, cb) {
        var i, key, callback;
        o = o || {};
        o.parameters = o.parameters || {};
        p = p || [];
        cb = cb || {};

        for (i = 0; i < p.length; i++) {
            key = o._parameter_prefix 
                ? o._parameter_prefix + '[' + p[i] + ']' 
                : p[i];
            o.parameters[ key ] 
                = o[ p[i] ]         !== undefined ? o[ p[i] ]
                : o.parameters[key] !== undefined ? o.parameters[key]
                : spec[ key ]       !== undefined ? spec[ key ]
                : this[ p[i] ]      !== undefined ? this[ p[i] ]
                : that[ key ]       !== undefined ? that[ key ]
                :                                   undefined;
            delete o[ p[i] ];
        };

        if (that.token) {
            o.parameters.token = that.token;
        }

        for (item in cb) {
            if (cb.hasOwnProperty(item)) {
                callback = o[item];
                o[item] = function(transport) {
                    cb[item](transport, callback);
                };
            }
        }

        my.ajax(spec.baseURL + url, o);
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

        options.method = 'post';
        my.request('auth/login.json', options, parameters, callbacks);
    };


    var list = function(specL) {
        var thatL = specL || {};
        var task = function(specT) {
            var thatT = specT || {};
            var comment = function(specC) {
                var thatC = specC || {};

                thatC.update = function(options) {
                    var i;
                    options = options || {};
                    options.parameters = options.parameters || {};
                    options._parameter_prefix = 'comment';
                    var parameters = [ 'comment' ];
                    var callbacks  = {
                        onSuccess: function(transport, callback) {
                            var item = comment( transport.responseJSON );
                            if (callback) {
                                callback(item);
                            }
                            else {
                                console.log(item);
                            }
                        }
                    };

                    for (i = 0; i < parameters.length; i++) {
                        options[ parameters[i] ] 
                            = options[ parameters[i] ] 
                            || this[ parameters[i] ];
                    }

                    options.method = 'put';
                    my.request('checklists/'  + thatL.id 
                               + '/tasks/'    + thatT.id 
                               + '/comments/' + thatC.id + '.json', 
                            options, parameters, callbacks);
                };


                // XXX Doesn't work, server error 500
                thatC.delete = function(options) {
                    options = options || {};
                    var parameters = [];
                    var callbacks  = {
                        onSuccess: function(transport, callback) {
                            var item = comment( transport.responseJSON );
                            if (callback) {
                                callback(item);
                            }
                            else {
                                console.log(item);
                            }
                        }
                    };

                    options.method = 'delete';
                    my.request('checklists/'  + thatL.id 
                               + '/tasks/'    + thatT.id 
                               + '/comments/' + thatC.id + '.json', 
                            options, parameters, callbacks);
                };

                return thatC;
            };

            thatT.update = function(options) {
                var i;
                options = options || {};
                options.parameters = options.parameters || {};
                options._parameter_prefix = 'task';
                var parameters = [ 'content', 'parent_id', 'position' ];
                var callbacks  = {
                    onSuccess: function(transport, callback) {
                        var item = task( transport.responseJSON );
                        if (callback) {
                            callback(item);
                        }
                        else {
                            console.log(item);
                        }
                    }
                };

                if (options.list_id) {
                    options.content = '[list: ' + options.content
                        + ' |' + options.list_id + ']';
                }

                for (i = 0; i < parameters.length; i++) {
                    options[ parameters[i] ] 
                        = options[ parameters[i] ] 
                        || this[ parameters[i] ];
                }

                options.method = 'put';
                my.request('checklists/' + thatL.id + '/tasks/' 
                        + thatT.id + '.json', 
                        options, parameters, callbacks);
            };

            // XXX Doesn't work, server error 500
            thatT.delete = function(options) {
                options = options || {};
                var parameters = [];
                var callbacks  = {
                    onSuccess: function(transport, callback) {
                        var item = task( transport.responseJSON );
                        if (callback) {
                            callback(item);
                        }
                        else {
                            console.log(item);
                        }
                    }
                };

                options.method = 'delete';
                my.request('checklists/' + thatL.id 
                           + '/tasks/' + thatT.id + '.json', 
                           options, parameters, callbacks);
            };

            thatT._action = function(action, options) {
                options = options || {};
                var parameters = [];
                var callbacks  = {
                    onSuccess: function(transport, callback) {
                        var i, j = transport.responseJSON, items = [];
                        for (i = 0; i < j.length; i++) {
                            items.push( task(j[i]) ); 
                        };
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
                var parameters = [];
                var callbacks  = {
                    onSuccess: function(transport, callback) {
                        var i, items = [], j = transport.responseJSON;
                        for (i = 0; i < j.length; i++) {
                            items.push( comment(j[i]) ); 
                        };
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

            thatT.addComment = function(options) {
                options = options || {};
                options._parameter_prefix = 'comment';
                var parameters = [ 'comment' ];
                var callbacks  = {
                    onSuccess: function(transport, callback) {
                        var item = comment( transport.responseJSON );
                        if (callback) {
                            callback(item);
                        }
                        else {
                            console.log(item);
                        }
                    }
                };

                options.method = 'post';
                my.request('checklists/' + thatL.id 
                           + '/tasks/' + thatT.id + '/comments.json',
                        options, parameters, callbacks);
            };

            thatT.refresh = thatL.getTasks;
            return thatT;
        };

        thatL.update = function(options) {
            var i;
            options = options || {};
            options.parameters = options.parameters || {};
            options._parameter_prefix = 'checklist';
            var parameters = [ 'name', 'public' ];
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

            for (i = 0; i < parameters.length; i++) {
                options[ parameters[i] ] 
                    = options[ parameters[i] ] 
                    || this[ parameters[i] ];
            }

            options.public = options.public || 0;

            options.method = 'put';
            my.request('checklists/' + thatL.id + '.json', 
                    options, parameters, callbacks);
        };

        // XXX Doesn't work, server error 500
        thatL.delete = function(options) {
            options = options || {};
            var parameters = [];
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

            options.method = 'delete';
            my.request('checklists/' + thatL.id + '.json', 
                       options, parameters, callbacks);
        };

        thatL.getTasks = function(options) {
            options = options || {};
            var taskMatch = /\[list:\s*([^|]+?)\s*\|\s*(\d+)\D/i;
            var parameters = [ 'with_notes' ];
            var callbacks  = {
                onSuccess: function(transport, callback) {
                    var i, list, items = [], j = transport.responseJSON;
                    for (i = 0; i < j.length; i++) {
                        if (j[i].content.indexOf('[list:') === 0) {
                            enyo.log(j[i].content);
                            list = taskMatch.exec(j[i].content);
                            if (list) {
                                enyo.log(list[1]);
                                j[i].content = list[1];
                                j[i].list_id = list[2];
                            }
                        }
                        items.push( task(j[i]) ); 
                    };
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
            var parameters = [ 'with_notes' ];
            var callbacks  = {
                onSuccess: function(transport, callback) {
                    var i, items = [], j = transport.responseJSON;
                    for (i = 0; i < j.length; i++) {
                        items.push( task(j[i]) ); 
                    };
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

            options.method = 'get';
            my.request('checklists/' + thatL.id + '/tasks/' + id + '.json', 
                options, parameters, callbacks);
        };

        thatL.addTask = function(options) {
            options = options || {};
            options._parameter_prefix = 'task';
            var parameters = [ 'content', 'parent_id', 'position' ];
            var callbacks  = {
                onSuccess: function(transport, callback) {
                    var item = task( transport.responseJSON );
                    if (callback) {
                        callback(item);
                    }
                    else {
                        console.log(item);
                    }
                }
            };

            options.method = 'post';
            my.request('checklists/' + thatL.id + '/tasks.json', 
                       options, parameters, callbacks);
        };

        thatL.importTasks = function(options) {
            options = options || {};
            var parameters = [ 'import_content' ];
            var callbacks  = {
                onSuccess: function(transport, callback) {
                    var item = task( transport.responseJSON );
                    if (callback) {
                        callback(item);
                    }
                    else {
                        console.log(item);
                    }
                }
            };

            options.method = 'post';
            my.request('checklists/' + thatL.id + '/import.json', 
                       options, parameters, callbacks);
        };

        return thatL;
    };
     
    that.getLists = function(options) {
        options = options || {};
        var parameters = [ 'archived' ];
        var callbacks  = {
            onSuccess: function(transport, callback) {
                var i, items = [], j = transport.responseJSON;
                for (i = 0; i < j.length; i++) {
                    items.push( list(j[i]) ); 
                };
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
        var parameters = [];
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

        options.method = 'get';
        my.request('checklists/' + id + '.json', 
            options, parameters, callbacks);
    };

    that.addList = function(options) {
        options = options || {};
        options._parameter_prefix = 'checklist';
        var parameters = [ 'name', 'public' ];
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

        options.method = 'post';
        my.request('checklists.json', options, parameters, callbacks);
    };

    return that;
}
