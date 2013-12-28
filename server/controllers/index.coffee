Tasks = require '../models/tasks'
Users = require '../models/users'

module.exports.login = (req, res, next) ->
    Users.getId req.session.email, () ->

    res.json
        email: req.session.email

module.exports.index = (req, res, next) ->
    res.render 'index.html'

module.exports.all = (req, res, next) ->
    archived = req.param 'archived'
    archived ?= false

    owner = req.session.email
    Tasks.all owner, archived, (err, tasks) ->
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

    owner = req.session.email
    Tasks.add owner, t, (err) ->
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

    owner = req.session.email
    Tasks.update owner, id, t, (err, newT) ->
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
    owner = req.session.email
    Tasks.delete owner, id, (err) ->
        if err
            res.send 500
            return
        res.send 200
