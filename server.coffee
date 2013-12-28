americano = require('americano')
config = require './server/config'

port = process.env.PORT || 3000
americano.start name: '', port: port, (app) ->
    require('express-persona') app,
        audience: config.persona.audience
