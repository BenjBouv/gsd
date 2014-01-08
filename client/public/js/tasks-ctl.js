var gsd = angular.module('gsd', ['gsd.TaskService', 'gsd.TagService'])

gsd.controller('TaskController', function($scope, Task, Tag) {
    function showError (err, lastAction) {
        $scope.error = 'Error' + ((lastAction) ? ' when ' + lastAction : '') + ':' + err.data;
    }
    function showEditError (err, lastAction) {
        $scope.edit_status = 'Error' + ((lastAction) ? ' when ' + lastAction : '') + ':' + err.data;
    }

    $scope.metatags = [];
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
        for (var i = 0 ; i < $scope.metatags.length; ++i) {
            var m = $scope.metatags[i];
            var r;
            if (m.isSwitch) {
                r = findSwitch(m.regexp);
            } else {
                r = findMark(m.regexp);
            }
            results[m.name] = r;
        }
    }

    var reloadTasks = function () {
        var method = ($scope.archivedMode) ? Task.archived : Task.query;
        $scope.tasks = method(function() {
            reparse();
        }, function(err) {
            showError(err, 'loading all tasks');
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
        reloadTasks();
    }

    $scope.Search = (function() {
        var _unmatched = {};
        var _current = {};

        function _emptyCurrentQuery() {
            _unmatched = {};
            _current = {};
            for (var i = 0; i < $scope.metatags.length; ++i)
                _current[$scope.metatags[i].name] = ""
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
            for (var i = 0; i < $scope.metatags.length; ++i) {
                var m = $scope.metatags[i];
                m.regexp.lastIndex = 0; // damn, global regexp
                if (m.regexp.test(str)) {
                    _current[m.name] = str;
                    found = true;
                    break;
                } else if (str[0] === '!' && str.substr(1, str.length) == m.querystr) {
                    _current[m.name] = str;
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
            for (var i = 0; i < $scope.metatags.length; ++i) {
                var id = $scope.metatags[i].name;
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
            showError(err, 'adding a task');
        });
    }

    $scope.toggleDone = function(task) {
        task.done = !task.done;
        task.$save(function() {
            // success
            reparse(); // to update count
        }, function(err) {
            // error
            showError(err, 'setting the task as done');
        });
    }

    $scope.deleteTask = function(task) {
        var tid = task.id;
        task.$delete(function() {
            // success
            reloadTasks();
        }, function(err) {
            // error
            showError(err, 'deleting a task');
        });
    }

    var currentTask = null;

    var Modal = function(name) {
        var modal = $(name);
        function _open() {
            modal.foundation('reveal', 'open');
        }
        function _close() {
            modal.foundation('reveal', 'close');
        }
        return {
            open: _open,
            close: _close
        }
    };

    var EditModal = Modal('#editModal');
    $scope.editCurrent = function(task) {
        $scope.edit_id = task.id;
        $scope.edit_content = task.content;
        currentTask = task;
        EditModal.open();
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
            EditModal.close();
        }, function(err) {
            // error
            showEditError(err, 'updating the task content');
        });
    }

    $scope.archiveTask = function(task) {
        task.archived = !$scope.archivedMode;
        task.$save(function() {
            // success
            reloadTasks();
        }, function(err) {
            // error
            showError(err, 'archiving or dis-archiving the task');
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

    var TagModal = Modal('#tagModal');
    $scope.openTagModal = function() {
        TagModal.open();
    };

    function reloadTags() {
        var metatags = Tag.query(function() {

            metatags.sort(function(a, b) { return a.order > b.order });
            for (var i = 0; i < metatags.length; ++i) {
                metatags[i].regexp = new RegExp(metatags[i].regexp, 'g');
            }

            $scope.metatags = metatags;
            reparse();
        });
    }
    reloadTags();

    $scope.createTag = function() {
        var name = $scope.tagName,
            isSwitch = !!$scope.tagIsSwitch,
            regexp = $scope.tagRegexp,
            querystr = $scope.tagQuerystr,
            order = $scope.tagOrder | 0;

        var t = new Tag({
            name: name,
            isSwitch: isSwitch,
            regexp: regexp,
            querystr: querystr,
            order: order
        });
        t.$save(function() {
            $scope.tagName = $scope.tagRegexp = $scope.tagQuerystr = $scope.tagOrder = '';
            $scope.tagIsSwitch = false;
            reloadTags();
        }, function(err) {
            showError(err, 'adding a tag');
        });
    }

    $scope.deleteTag = function(tag) {
        tag.$delete(function() {
            reloadTags();
        }, function(err) {
            showError(err, 'deleting a tag');
        });
    }
});
