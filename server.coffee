americano = require('americano')

port = process.env.PORT || 3000
americano.start name: '', port: port, (app) ->
    require('express-persona') app,
        audience: 'http://127.0.0.1:3000' # TODO
