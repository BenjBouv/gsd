index = require './index'
module.exports =
    '':
        get: index.index
    'tasks':
        get: index.all
        post: index.add
    'tasks/:id':
        post: index.update
        delete: index.delete
