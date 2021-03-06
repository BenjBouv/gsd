americano = require 'americano'

module.exports =
    persona:
        audience: 'http://127.0.0.1:3000'
    common: [
        americano.cookieParser 'mylittlesecret'
        americano.session()
        americano.json()
        americano.urlencoded()
        americano.methodOverride()
        americano.errorHandler
            dumpExceptions: true
            showStack: true
        americano.static __dirname + '/../client/public',
            maxAge: 86400000
    ]
    development: [
        americano.logger 'dev'
    ]
    production: [
        americano.logger 'short'
    ]
