Tasks = require '../models/tasks'

module.exports.index = (req, res, next) ->
    Tasks.all (err, tasks) ->
        if err
            res.send 500
            return

        # TODO you kiddin me? rendering server side in the controller?
        response = '<ul>'
        for t in tasks
            response += '<li>' + t.name + '</li>'
        response += '</ul>'
        res.send 200, response
