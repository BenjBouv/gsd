LoggedIn = (req, res, next) ->
    if req.session.email
        next()
    else
        res.send 401

module.exports = (func) ->
    [LoggedIn, func]
