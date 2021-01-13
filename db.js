const { Pool } = require('pg')

const pool = new Pool({
    host: 'localhost',
    port: 5432,
    user: 'tomi7lav',
    database: 'riftterdb'
});

module.exports = {
    query: (text, params) => {
        return new Promise((resolve, reject) => {
            const start = Date.now()
            
            pool.query(text, params, (err, res) => {
              const duration = Date.now() - start;
              console.log('executed query', { text, duration, rows: res && res.rowCount })

              if(err) {
                  reject(err)
              } else {
                  resolve(res);
              }
            })
        })
    },
  }