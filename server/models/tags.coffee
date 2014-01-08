db = require './db'
Users = require './users'

module.exports.all = (owner, cb) ->
    Users.getId owner, (uerr, uid) ->
        if uerr
            cb uerr
            return

        db.all 'SELECT rowid AS id, * FROM tags WHERE owner = ?', uid, (err, rows) ->
            if err
                console.error err
                cb {code:500, msg: err.message}
                return

            rows = rows.map (a) ->
                a.isSwitch = !!a.isSwitch
                delete a.owner
                a.order = a._order
                delete a._order
                a
            cb null, rows

module.exports.add = (owner, tag, cb) ->
    Users.getId owner, (uerr, uid) ->
        if uerr
            cb uerr
            return
        db.run 'INSERT INTO tags(owner, name, isSwitch, regexp, querystr, _order) VALUES (?, ?, ?, ?, ?, ?)', uid, tag.name, tag.isSwitch, tag.regexp, tag.querystr, tag.order, (err) ->
            if err
                console.error err
                cb {code: 500, msg: err.message}
                return
            cb null

byId = (owner, id, cb) ->
    Users.getId owner, (uerr, uid) ->
        if uerr
            cb uerr
            return
        db.get 'SELECT rowid AS id, * FROM tags WHERE rowid = ? AND owner = ?', id, uid, (err, row) ->
            if err
                console.error err
                cb {code: 500, msg: err.message}
                return
            if typeof row is 'undefined'
                cb {code: 404, msg: 'tag not found'}
                return

            row.isSwitch = !!row.isSwitch
            delete row.owner
            row.order = row._order
            delete row._order

            cb null, row

module.exports.update = (owner, tid, newT, cb) ->
    byId owner, tid, (err, t) ->
        if err
            cb err
            return
        Users.getId owner, (uerr, uid) ->
            if uerr
                cb uerr
                return
            db.run 'UPDATE tags SET name = ?, isSwitch = ?, regexp = ?, querystr = ?, _order = ? WHERE rowid = ? AND owner = ?', newT.name, newT.isSwitch | 0, newT.regexp, newT.querystr, newT.order, tid, uid, (err2) ->
                if err2
                    console.error err2
                    cb {code: 500, msg: err2.message}
                    return
                byId owner, tid, cb

module.exports.delete = (owner, tid, cb) ->
    byId owner, tid, (err, t) ->
        if err
            cb err
            return

        Users.getId owner, (uerr, uid) ->
            if uerr
                cb uerr
                return

            db.run 'DELETE FROM tags WHERE rowid = ? AND owner = ?', tid, uid, (err2) ->
                if err2
                    console.error err2
                    cb {code: 500, msg: err2.message}
                    return
                cb null
