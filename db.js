const { Client } = require('pg')

let dbClient = null;

const initializeDb = () => {
    if(!dbClient) {
        dbClient = new Client({
            user: '',
            host: 'localhost',
            database: 'mydb',
            password: 'secretpassword',
            port: 5432,
        })
        dbClient.connect()
        console.log('creating db client yaaay')
    }
}

const getDbClient = () => dbClient;

module.exports = {
    initializeDb: initializeDb,
    getDbClient: getDbClient
};