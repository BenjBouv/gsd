module.exports.all = (cb) ->
    tasks = [
            name: 'do the laundry'
            done: false
            tags: ['perso']
        ,
            name: 'do the harlem shake'
            done: false
            tags: ['dance', 'fnu']
        ,
            name: 'get s*** done'
            done: true
            tags: ['gtd', 'fnu']
    ]
    cb null, tasks
