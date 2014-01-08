NeedsAuth = require './loggedIn'
tasks = require './tasks'
tags = require './tags'

module.exports =
    '':
        get: tasks.index
    'login':
        get: NeedsAuth tasks.login
    'tasks':
        get: NeedsAuth tasks.all
        post: NeedsAuth tasks.add
    'tasks/:id':
        post: NeedsAuth tasks.update
        delete: NeedsAuth tasks.delete
    'tags':
        get: NeedsAuth tags.all
        post: NeedsAuth tags.add
    'tags/:id':
        post: NeedsAuth tags.update
        delete: NeedsAuth tags.delete
