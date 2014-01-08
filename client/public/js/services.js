var TaskService = angular.module('gsd.TaskService', ['ngResource']);

TaskService.factory('Task', ['$resource', function ($resource) {
    return $resource('tasks/:tid', {
        tid: '@id'
    }, {
        archived: {method: 'GET', params:{archived:true}, isArray: true, cache:false}
    });
}]);

var TagService = angular.module('gsd.TagService', ['ngResource']);

TagService.factory('Tag', ['$resource', function ($resource) {
    return $resource('tags/:tid', {
        tid: '@id'
    });
}]);
