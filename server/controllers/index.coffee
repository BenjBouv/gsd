Tasks = require '../models/tasks'

module.exports.index = (req, res, next) ->
    res.render 'index.html'

module.exports.all = (req, res, next) ->
    Tasks.all (err, tasks) ->
        if err
            res.send 500
            return
        res.json tasks

module.exports.add = (req, res, next) ->
    t =
        content: req.param 'content'
        done: false

    Tasks.add t, (err) ->
        if err
            res.send 500
            return
        res.send 200

module.exports.update = (req, res, next) ->
    id = req.param 'id'
    content = req.param 'content'
    done = req.param 'done'

    if !id || !content || typeof done == 'undefined'
        res.send 301
        return

    id = id | 0
    done = !!done
    t =
        id: id
        done: done
        content: content

    Tasks.update id, t, (err, newT) ->
        if err
            res.send err.code, err.msg
            return
        res.send 200, newT

module.exports.delete = (req, res, next) ->
    id = req.param 'id'

    if !id
        res.send 301
        return

    id = id | 0

    Tasks.delete id, (err) ->
        if err
            res.send 500
            return
        res.send 200
