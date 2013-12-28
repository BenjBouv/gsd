NeedsAuth = require './loggedIn'
index = require './index'

module.exports =
    '':
        get: index.index
    'login':
        get: NeedsAuth index.login
    'tasks':
        get: NeedsAuth index.all
        post: NeedsAuth index.add
    'tasks/:id':
        post: NeedsAuth index.update
        delete: NeedsAuth index.delete
