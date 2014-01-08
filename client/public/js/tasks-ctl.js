var gsd = angular.module('gsd', ['gsd.TaskService'])

gsd.controller('TaskController', function($scope, Task) {
    var metatags = {
        waiting: {
            isSwitch: true,
            name: 'Waiting list',
            regexp: /:w/g,
            querystr: ':w',
            order: 0
        },
        tag: {
            isSwitch: false,
            name: 'Tag',
            regexp: /#(\w+)?/g,
            querystr: '#',
            order: 10
        },
        place: {
            isSwitch: false,
            name: 'Place',
            regexp: /@(\w+)/g,
            querystr: '@',
            order: 20
        },
        priority: {
            isSwitch: false,
            name: 'Priority',
            regexp: /:p(\d)/g,
            querystr: ':p',
            order: 30
        }
    };

    $scope.metatags = (function() {
        var a = [];
        for (var id in metatags) {
            var obj = metatags[id];
            obj.id = id;
            a.push(obj);
        }
        a.sort(function(x,y){return x.order > y.order});
        return a;
    })();

    var results = $scope.results = {};
    // sort by done first, then lastUpdateDate (so that the most ancient todos show up first)
    $scope.orderProp = ['done', 'lastUpdateDate'];

    var findMark = (function() {
        var _set = {};

        function _findMark(regex, task) {
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

                var found = _set[r] = _set[r] || {
                    name: r,
                    done: 0,
                    total: 0
                };

                found.done += task.done;
                found.total += 1;
                alreadyProcessed[r] = true;
            }
        }

        function _findAllTags(regexp) {
            _set = {};
            for (var i = 0; i < $scope.tasks.length; ++i) {
                var t = $scope.tasks[i];
                _findMark(regexp, t);
            }

            var results = [];
            for (var i in _set) {
                results.push(_set[i]);
            }
            results.sort(function (a,b){ return a.name >= b.name });
            return results;
        }

        return _findAllTags;
    })();

    function findSwitch(regexp) {
        var result = {
            with: {done: 0, total: 0},
            without: {done: 0, total: 0}
        };

        for (var i = 0; i < $scope.tasks.length; ++i) {
            var t = $scope.tasks[i];

            regexp.lastIndex = 0; // freaking global regexp
            var set = (regexp.test(t.content)) ? result.with : result.without;

            set.done += t.done;
            set.total += 1;
        }
        return result;
    }

    function reparse() {
        for (var id in metatags) {
            var m = metatags[id];
            var r;
            if (m.isSwitch) {
                r = findSwitch(m.regexp);
            } else {
                r = findMark(m.regexp);
            }
            results[id] = r;
        }

        $scope.tags = results.tag;
        $scope.places = results.place;
        $scope.priorities = results.priority;
        $scope.waiting = results.waiting;
    }

    var reloadTasks = function () {
        var method = ($scope.archivedMode) ? Task.archived : Task.query;
        $scope.tasks = method(function() {
            reparse();
        });
    }
    $scope.archivedMode = false;
    reloadTasks();

    $scope.getCurrentTasks = function() {
        $scope.archivedMode = false;
        reloadTasks();
    }

    $scope.getArchivedTasks = function() {
        $scope.archivedMode = true;
        $scope.tasks = Task.archived(function() {
            reparse();
        });
    }

    $scope.Search = (function() {
        var _unmatched = {};
        var _current = {};

        function _emptyCurrentQuery() {
            _unmatched = {};
            _current = {};
            for (var id in metatags)
                _current[id] = ""
        }

        function _reinitCurrent() {
            var q = $scope.query;

            _emptyCurrentQuery();
            if (q) {
                var words = q.split(' ');
                for (var i in words)
                    _parse(words[i]);
            }
        }
        _reinitCurrent();

        function _parse(str) {
            var found = false;
            for (var id in metatags) {
                var m = metatags[id];
                m.regexp.lastIndex = 0; // damn, global regexp
                if (m.regexp.test(str)) {
                    _current[id] = str;
                    found = true;
                    break;
                } else if (str[0] === '!' && str.substr(1, str.length) == m.querystr) {
                    _current[id] = str;
                    found = true;
                    break;
                }
            }
            if (!found)
                _unmatched[str] = true;
        }

        function _render() {
            var follows = false;
            var q = '';
            function add(str) {
                if (!str)
                    return;
                if (follows)
                    q += ' ';
                q += str;
                follows = true;
            }
            for (var id in _current)
                add(_current[id]);
            for (var str in _unmatched)
                add(str);
            $scope.query = q;
        }

        function _clear(field) {
            if (field === '') {
                _emptyCurrentQuery();
                _render();
                return;
            }

            var found = false;
            for (var id in metatags) {
                if (field === id) {
                    found = true;
                    _current[id] = "";
                    break;
                }
            }
            if (!found)
                console.log('ERROR: unknown field in _clear: ' + field);
            else
                _render();
        }

        function _update(str) {
            _reinitCurrent();
            _parse(str);
            _render();
        }

        return {
            update: _update,
            clear: _clear
        }
    })();

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
        task.archived = !$scope.archivedMode;
        task.$save(function() {
            // success
            reloadTasks();
        }, function() {
            // error
            $scope.edit_status = 'Error when archiving the task content';
        });
    }

    $scope.searchFunction = (function() {
        var lastExpected;
        var esplit;

        function prepareExpected(expected) {
            if (lastExpected === expected)
                return;
            esplit = expected.toString().toLowerCase().split(' ');
            lastExpected = expected;
        }

        return function(task) {
            var actual = task.content.toLowerCase();
            var expected = $scope.query;

            if (!expected)
                return true;

            prepareExpected(expected);
            for (var i = 0; i < esplit.length; ++i) {
                var e = esplit[i];
                var inverted = (e[0] === '!');
                if (inverted) e = e.substr(1, e.length - 1);
                var found = actual.indexOf(e) !== -1;

                if (inverted && found)
                    return false;
                if (!inverted && !found)
                    return false;
            }
            return true;
        }
    })();
});
