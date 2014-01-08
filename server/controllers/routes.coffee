NeedsAuth = require './loggedIn'
index = require './index'
tags = require './tags'

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
    'tags':
        get: NeedsAuth tags.all
        post: NeedsAuth tags.add
    'tags/:id':
        post: NeedsAuth tags.update
        delete: NeedsAuth tags.delete
