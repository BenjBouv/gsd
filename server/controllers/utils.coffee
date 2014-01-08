module.exports.IsEmptyString = (val) ->
    return !val || val.length == 0 || !/\S/.test val

