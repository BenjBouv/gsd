db = require './db'
Users = require './users'

module.exports.all = (owner, archived, cb) ->
    Users.getId owner, (uerr, uid) ->
        if uerr
            cb uerr
            return

        db.all 'SELECT rowid as id, * FROM todos WHERE archived = ? AND owner = ?', !!archived, uid, (err, rows) ->
            if err
                console.error err
                cb {code: 500, msg: err.message}
                return

            rows = rows.map (a) ->
                a.done = !!a.done
                a.archived = !!a.archived
                a.lastUpdateDate = new Date a.lastUpdateDate
                delete a.owner
                a

            cb null, rows

module.exports.byId = byId = (owner, id, cb) ->
    Users.getId owner, (uerr, uid) ->
        if uerr
            cb uerr
            return

        db.get 'SELECT rowid as id, * FROM todos WHERE rowid = ? AND owner = ?', id, uid, (err, row) ->
            if err
                console.error err
                cb {code: 500, msg: err.message}
                return
            if typeof row == 'undefined'
                cb {code: 404, msg: 'task not found'}
                return

            row.done = !!row.done
            row.archived = !!row.archived
            row.lastUpdateDate = new Date row.lastUpdateDate
            delete row.owner

            cb null, row

module.exports.add = (owner, task, cb) ->
    Users.getId owner, (uerr, uid) ->
        if uerr
            cb uerr
            return

        db.run 'INSERT INTO todos(content, done, archived, lastUpdateDate, owner) VALUES (?, ?, ?, ?, ?)', task.content, 0, 0, +new Date, uid, (err, results) ->
            if err
                console.error err
                cb {code: 500, msg: err.message}
                return
            cb null

module.exports.update = (owner, tid, newT, cb) ->
    byId owner, tid, (err, t) ->
        if err
            console.error err
            cb err
            return

        Users.getId owner, (uerr, uid) ->
            if uerr
                cb uerr
                return

            db.run 'UPDATE todos SET content = ?, done = ?, archived = ?, lastUpdateDate = ? WHERE rowid = ? AND owner = ?', newT.content, newT.done | 0, newT.archived | 0, +new Date, tid, uid, (err2) ->
                if err2
                    console.error err2
                    cb {code: 500, msg: err2.message}
                    return
                byId owner, tid, cb

module.exports.delete = (owner, tid, cb) ->
    byId owner, tid, (err, t) ->
        if err
            console.error err
            cb err
            return

        Users.getId owner, (uerr, uid) ->
            if uerr
                cb uerr
                return

            db.run 'DELETE FROM todos WHERE rowid = ? AND owner = ?', tid, uid, (err2) ->
                if err2
                    console.error err2
                    cb {code: 500, msg: err2.message}
                    return
                cb null

