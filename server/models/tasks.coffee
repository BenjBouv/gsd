sql = require('sqlite3').verbose()

createTable = () ->
    db.run '''
        CREATE TABLE IF NOT EXISTS todos(content text, done integer, archived integer);
    '''

db = new sql.Database('./gsd.sqlite3', createTable);

module.exports.all = (archived, cb) ->
    db.all 'SELECT rowid as id, * FROM todos WHERE archived = ?;', !!archived, (err, rows) ->
        if err
            console.error err
            cb {code: 500, msg: err.message}
            return

        rows = rows.map (a) ->
            a.done = !!a.done
            a.archived = !!a.archived
            a

        cb null, rows

module.exports.byId = byId = (id, cb) ->
    db.get 'SELECT rowid as id, * FROM todos WHERE rowid = ?', id, (err, row) ->
        if err
            console.error err
            cb {code: 500, msg: err.message}
            return
        if typeof row == 'undefined'
            cb {code: 404, msg: 'task not found'}
            return

        row.done = !!row.done
        row.archived = !!row.archived

        cb null, row

module.exports.add = (task, cb) ->
    db.run 'INSERT INTO todos(content, done, archived) VALUES (?, ?, ?)', task.content, 0, 0, (err, results) ->
        if err
            console.error err
            cb {code: 500, msg: err.message}
            return
        cb null

module.exports.update = (tid, newT, cb) ->
    byId tid, (err, t) ->
        if err
            console.error err
            cb err
            return

        db.run 'UPDATE todos SET content = ?, done = ?, archived = ? WHERE rowid = ?', newT.content, newT.done | 0, newT.archived | 0, tid, (err2) ->
            if err2
                console.error err2
                cb {code: 500, msg: err2.message}
                return
            byId tid, cb

module.exports.delete = (tid, cb) ->
    byId tid, (err, t) ->
        if err
            console.error err
            cb err
            return

        db.run 'DELETE FROM todos WHERE rowid = ?', tid, (err2) ->
            if err2
                console.error err2
                cb {code: 500, msg: err2.message}
                return
            cb null

