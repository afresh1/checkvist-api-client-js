// $Id: checkvist_api.js,v 1.1 2011/08/11 04:18:45 andrew Exp $
checkvist_api = function(spec) {
    var that = {};

    spec.baseURL = spec.baseURL || 'https://checkvist.com/';

    var makeRequest = function(method, url, params, callback) {};

    that.login = function() {};

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

        thatL.update = function(name, public) {},
        thatL.delete = function() {},

        thatL.getTasks = function(withNotes) {},
        thatL.importTasks = function(content) {};

        thatL.getTask = function(taskId, withNotes) {},
        thatL.addTask = function(content, parentId, position) {},

        return thatL;
    };
     
    that.getLists = function(archived) {};

    that.getList = function(listId) {};
    that.addList = function(name, public) {};

    return that;
}
