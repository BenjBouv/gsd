var gsd = angular.module('gsd', ['TaskService'])

gsd.controller('TaskController', function($scope, Task) {
    $scope.tags = [];
    $scope.places = [];
    $scope.priorities = [];

    $scope.orderProp = 'done';

    var tags;
    var places;
    var priorities;

    function findAllTags() {
        tags = {};
        for (var i = 0; i < $scope.tasks.length; ++i) {
            var t = $scope.tasks[i];
            findTags(t);
        }
        $scope.tags = [];
        for (var i in tags) {
            $scope.tags.push(tags[i]);
        }
        $scope.tags.sort(function (a,b){ return a.name >= b.name });
    }

    function findAllPlaces() {
        places = {}
        for (var i = 0; i < $scope.tasks.length; ++i) {
            var t = $scope.tasks[i];
            findPlaces(t);
        }
        $scope.places = [];
        for (var i in places) {
            $scope.places.push(places[i]);
        }
        $scope.places.sort(function (a,b){ return a.name >= b.name });
    }

    function findAllPriorities() {
        priorities = {}
        for (var i = 0; i < $scope.tasks.length; ++i) {
            var t = $scope.tasks[i];
            findPriorities(t);
        }
        $scope.priorities = [];
        for (var i in priorities) {
            $scope.priorities.push(priorities[i]);
        }
        $scope.priorities.sort(function (a,b){ return a.name >= b.name });
    }

    var status;
    function findAllStatuses() {
        status = {
            waiting: {done: 0, total: 0},
            next_action: {done: 0, total: 0}
        };

        for (var i = 0; i < $scope.tasks.length; ++i) {
            var t = $scope.tasks[i];
            findStatus(t);
        }
        $scope.status = status;
    }

    function reparse() {
        findAllTags();
        findAllPlaces();
        findAllPriorities();
        findAllStatuses();
    }

    function findSpecialMark(regex, task, set) {
        var results;

        var alreadyProcessed = {};
        while ((results = regex.exec(task.content)) !== null) {
            // ignore tags that are followed by a special char, like something@example.com
            var nextChar = task.content[regex.lastIndex];
            if (nextChar && nextChar !== ' ')
                continue;

            var r = results[1];
            // don't add the same tag if it's already present
            if (typeof alreadyProcessed[r] !== 'undefined')
                continue;

            var found = set[r] = set[r] || {
                name: r,
                done: 0,
                total: 0
            };

            found.done += task.done;
            found.total += 1;
            alreadyProcessed[r] = true;
        }
    }

    var findTags = (function() {
        var tagRgx = /#(\w+)/g;
        return function(task) {
            findSpecialMark(tagRgx, task, tags);
        }
    })();

    var findPlaces = (function() {
        var placeRgx = /@(\w+)/g;
        return function(task) {
            findSpecialMark(placeRgx, task, places);
        }
    })();

    var findPriorities = (function() {
        var priorityRgx = /:p(\d)/g;
        return function(task) {
            findSpecialMark(priorityRgx, task, priorities);
        }
    })();

    var findStatus = (function() {
        var waitRgx = /:w\(([\w\s]+)\)/g;
        return function _findWaiting(task) {
            var results;
            var set = (waitRgx.test(task.content)) ? status.waiting : status.next_action;
            set.done += task.done;
            set.total += 1;
        }
    })();

    var reloadTasks = function () {
        var method = (archivedMode) ? Task.archived : Task.query;
        $scope.tasks = method(function() {
            reparse();
        });
    }
    var archivedMode = false;
    reloadTasks();

    $scope.getCurrentTasks = function() {
        archivedMode = false;
        reloadTasks();
    }

    $scope.getArchivedTasks = function() {
        archivedMode = true;
        $scope.tasks = Task.archived(function() {
            reparse();
        });
    }

    $scope.updateSearch = function(str) {
        $scope.query = str;
    }

    $scope.addTask = function() {
        var t = new Task({content: $scope.content});
        t.$save(function(a,b,c) {
            // success
            reloadTasks();
            $scope.content = '';
        }, function(err) {
            // error
            $scope.error = 'Error when adding a task';
        });
    }

    $scope.toggleDone = function(task) {
        task.done = !task.done;
        task.$save(function() {
            // success
            reparse(); // to update count
        }, function(err) {
            // error
            $scope.error = 'Error when setting the task as done';
        });
    }

    $scope.deleteTask = function(task) {
        var tid = task.id;
        task.$delete(function() {
            // success
            reloadTasks();
        }, function() {
            // error
            $scope.error = 'Error when deleting the task';
        });
    }

    var currentTask = null;

    var Modal = (function() {
        var editModal = $('[data-reveal]');
        function _open() {
            editModal.foundation('reveal', 'open');
        }
        function _close() {
            editModal.foundation('reveal', 'close');
        }
        return {
            open: _open,
            close: _close
        }
    })();

    $scope.editCurrent = function(task) {
        $scope.edit_id = task.id;
        $scope.edit_content = task.content;
        currentTask = task;
        Modal.open();
    }

    $scope.updateTask = function() {
        var editId = $scope.edit_id | 0;

        if (editId === -1 || editId !== currentTask.id) {
            $scope.edit_status = 'Inconsistent state: please reload the page';
            return;
        }

        currentTask.content = $scope.edit_content;
        currentTask.$save(function() {
            // success
            reloadTasks();
            Modal.close();
        }, function() {
            // error
            $scope.edit_status = 'Error when updating the task content';
        });
    }

    $scope.archiveTask = function(task) {
        task.archived = true;
        task.$save(function() {
            // success
            reloadTasks();
        }, function() {
            // error
            $scope.edit_status = 'Error when archiving the task content';
        });
    }
});
