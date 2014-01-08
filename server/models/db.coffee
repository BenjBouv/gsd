sql = require('sqlite3').verbose()

createTable = () ->
    db.run '''
        CREATE TABLE IF NOT EXISTS todos(owner integer, content text, done integer, archived integer, lastUpdateDate integer);
    '''

    db.run '''
        CREATE TABLE IF NOT EXISTS tags(owner integer, name text, isSwitch integer, regexp text, querystr text, _order integer);
    '''

    db.run '''
        CREATE TABLE IF NOT EXISTS users(email text);
    '''

module.exports = db = new sql.Database('./gsd.sqlite3', createTable);

