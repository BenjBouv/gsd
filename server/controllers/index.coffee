Tasks = require '../models/tasks'

module.exports.login = (req, res, next) ->
    res.json req.session.email

module.exports.index = (req, res, next) ->
    res.render 'index.html'

module.exports.all = (req, res, next) ->
    archived = req.param 'archived'
    archived ?= false

    Tasks.all archived, (err, tasks) ->
        if err
            res.send err.code, err.msg
            return
        res.json tasks

IsEmptyString = (val) ->
    return !val || val.length == 0 || !/\S/.test val

module.exports.add = (req, res, next) ->
    t =
        content: req.param 'content'
        done: false
        archived: false

    if IsEmptyString t.content
        res.send 400, 'empty content for the todo'
        return

    Tasks.add t, (err) ->
        if err
            res.send 500
            return
        res.send 200

module.exports.update = (req, res, next) ->
    id = req.param 'id'
    content = req.param 'content'
    done = req.param 'done'
    archived = req.param 'archived'

    if !id || !content || typeof done == 'undefined'
        res.send 400, 'missing parameter'
        return

    id = id | 0
    done = !!done
    archived = !!archived
    t =
        id: id
        done: done
        archived: archived
        content: content

    if IsEmptyString t.content
        res.send 400, 'empty content for the todo'
        return

    Tasks.update id, t, (err, newT) ->
        if err
            res.send err.code, err.msg
            return
        res.send 200, newT

module.exports.delete = (req, res, next) ->
    id = req.param 'id'

    if !id
        res.send 400, 'no id'
        return

    id = id | 0

    Tasks.delete id, (err) ->
        if err
            res.send 500
            return
        res.send 200
