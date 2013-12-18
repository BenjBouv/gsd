tasks = [
            id: 0
            content: 'do the laundry'
            done: false
        ,
            id: 1
            content: 'do the harlem shake'
            done: false
        ,
            id: 2
            content: 'get s*** done'
            done: true
    ]
nextId = 3

module.exports.all = (cb) ->
    cb null, tasks

module.exports.byId = byId = (id, cb) ->
    for t in tasks
        if t.id == id
            cb null, t
            return
    cb {code: 404, msg: 'task not found'}

module.exports.add = (task, cb) ->
    task.id = nextId++
    tasks.push task
    cb null

module.exports.update = (tid, newT, cb) ->
    byId tid, (err, t) ->
        if err
            cb err
            return
        tasks[tasks.indexOf(t)] = newT
        cb null, newT

module.exports.delete = (tid, cb) ->
    byId tid, (err, t) ->
        if err
            cb err
            return

        for i, t of tasks
            if t.id == tid
                tasks.splice i, 1
                cb null
                return

        cb {code: 404, msg: 'not found'}

