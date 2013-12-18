var TaskService = angular.module('TaskService', ['ngResource']);

TaskService.factory('Task', ['$resource', function ($resource) {
    return $resource('tasks/:tid', {tid: '@id'});
}]);
