Tags = require '../models/tags'
Utils = require './utils'

AddDefaults = (req, res, next) ->
    defaults = [
       isSwitch: false
       name: 'Tag'
       regexp: '#(\\w+)'
       querystr: '#'
       order: 10
    ,
       isSwitch: false
       name: 'Place'
       regexp: '@(\\w+)'
       querystr: '@'
       order: 20
    ,
       isSwitch: false
       name: 'Priority'
       regexp: ':p(\\d)'
       querystr: ':p'
       order: 30
    ]
    owner = req.session.email

    addDefault = (i) ->
        if i < defaults.length
            d = defaults[i]
            Tags.add owner, d, (err) ->
                if err
                    console.error err
                    res.send err.code, err.message
                    return
                addDefault i+1
            return
        GetAll req, res, next
    addDefault 0

GetAll = module.exports.all = (req, res, next) ->
    owner = req.session.email
    Tags.all owner, (err, tags) ->
        if err
            res.send err.code, err.msg
            return
        if tags.length == 0
            AddDefaults req, res, next
        else
            res.json tags

CheckParams = (req) ->
    name = req.param 'name'
    isSwitch = req.param 'isSwitch'
    regexp = req.param 'regexp'
    querystr = req.param 'querystr'
    order = req.param 'order'

    if not name or typeof isSwitch is 'undefined' or not regexp or not querystr or typeof order is 'undefined'
        return false

    if Utils.IsEmptyString name or Utils.IsEmptyString regexp or Utils.IsEmptyString querystr
        return false

    t =
        isSwitch: !!isSwitch
        name: name
        regexp: regexp
        querystr: querystr
        order: order | 0

module.exports.add = (req, res, next) ->
    t = CheckParams req
    if not t
        res.send 400, 'missing parameters'
        return

    owner = req.session.email
    Tags.add owner, t, (err) ->
        if err
            res.send err.code, err.msg
            return
        res.send 200

module.exports.update = (req, res, next) ->
    t = CheckParams req
    if not t
        res.send 400, 'missing parameters'
        return

    id = req.param 'id'
    if not id
        res.send 400, 'missing id'
        return

    id = id | 0
    owner = req.session.email
    Tags.update owner, id, t, (err, newT) ->
        if err
            res.send err.code, err.msg
            return
        res.send 200, newT

module.exports.delete = (req, res, next) ->
    id = req.param 'id'
    if not id
        res.send 400, 'missing id'
        return
    id = id | 0
    owner = req.session.email
    Tags.delete owner, id, (err) ->
        if err
            res.send err.code, err.msg
            return
        res.send 200
