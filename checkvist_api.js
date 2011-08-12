// $Id: checkvist_api.js,v 1.2 2011/08/12 02:36:54 andrew Exp $
checkvist_api = function(spec) {
    var that = {};

    spec.baseURL = spec.baseURL || 'https://checkvist.com/';

    serialize = function(obj) {
        var str = [];
        for(var p in obj)
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        return str.join("&");
    }

    var ajax = function(s) {
        s.params = s.params || {};
        if (spec.token) {
            s.params.token = spec.token;
        }

        var u = spec.baseURL + s.url;
        var qs = serialize(s.params);

        s.method = s.method.toLowerCase();
        if (s.method === 'get') {
            u += '?' + qs;
            qs = null;
        }

        console.log('make request', s.method, u, qs);

        var xhReq = new XMLHttpRequest();
        xhReq.open(s.method, u, false);
        if (s.method === 'post' || s.method === 'put') {
            xhReq.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        }
        if (qs) {
            xhReq.setRequestHeader("Content-length", qs.length);
        }
        xhReq.setRequestHeader("Connection", "close");

        xhReq.onreadystatechange = function(e) {
            console.log(xhReq.readyState, spec);
            if (xhReq.readyState !== 4) { return }

            if (xhReq.status === 200) {
                if (s.success) {
                    s.success(xhReq, e);
                }
                else {
                    console.log(xhReq.responseText);
                }
            }
            else {
                if (s.onError) {
                    s.onError(xhReq, e);
                }
                else {
                    console.log(xhReq, e);
                }
            }
        }

        xhReq.send(qs);
    };

    that.loginSuccess = function(key) {
         spec.token = key.responseText.replace(/"/g, '');
         console.log(spec.token);
    };

    that.Success = function(resp) {
        console.log(resp);
    };

    that.login = function(user,key) {
        spec.username    = user || spec.username;
        spec.remote_key  = key  || spec.remote_key;

        spec.token = null;

        ajax({
            method: 'POST', 
            url: 'auth/login.json', 
            params: {
                username:   spec.username,
                remote_key: spec.remote_key,
            },
            success: that.loginSuccess
        });

    };


    var list = function(specL) {
        var thatL = {};
        var task = function(specT) {
            var thatT = {};
            var comment = function(specC) {
                var thatC = {};

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
        ajax({
            method: 'get', 
            url: 'checklists.json', 
            success: that.Success
        });
    };

    that.getList = function(listId) {};
    that.addList = function(name, public) {};

    return that;
}
