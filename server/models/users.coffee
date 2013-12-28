db = require './db'

cache = {}
module.exports.getId = self = (email, cb) ->
    if typeof cache[email] != 'undefined'
        cb null, cache[email]
        return

    db.get 'SELECT rowid AS id FROM users WHERE email = ?', email, (err, row) ->
        if err
            console.error err
            cb {code: 500, msg: err.message}
            return

        if typeof row == 'undefined'
            # not found, add it now
            db.run 'INSERT INTO users(email) VALUES (?)', email, (err2) ->
                if err2
                    console.error err2
                    cb {code: 500, msg: err2.message}
                    return
                self email, cb
            return

        # populate the cache and return
        cache[email] = row.id
        cb null, row.id

