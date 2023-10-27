const pg = require('pg');

queryTestDb = (query, config) => { 
  console.log('### db connect cypress:', config.env.DB_CONNECT_URL);
  const connection = new pg.Client(config.env.DB_CONNECT_URL);
  connection.connect();

  return new Promise((resolve, reject) => {
    connection.query( query, (error, results) =>{
      if (error) reject(error);
      else {
        connection.end();
        return resolve(results);
      }
    })
  })
}

module.exports = (on, config) => {
  on("task", {
    queryDb: (query) => {
      return queryTestDb(query, config);
    }
  })

}

