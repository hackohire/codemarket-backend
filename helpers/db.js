const mongoose = require('mongoose');

// Only reconnect if needed. State is saved and outlives a handler invocation 
let isConnected;
let dbObj;

const connectToDatabase = (dbURL = '') => {
  // mongoose.set('debug', true);
  const mongoURL = dbURL ? dbURL : process.env.MONGODB_URL;

  if (isConnected && !dbURL) {
    console.log('Re-using existing database connection', mongoURL);
    return Promise.resolve(dbObj);
  }

  console.log('Creating new database connection', mongoURL);
  return mongoose.connect(mongoURL, {
    useFindAndModify: false,
    useNewUrlParser: true, reconnectTries: 30, reconnectInterval: 500, poolSize: 1, socketTimeoutMS: 2000000, keepAlive: true
  })
    .then(db => {
      isConnected = db.connections[0].readyState;
      if (db && db.connections && db.connections.length) {
        dbObj= db.connection;
      }
      return dbObj;
    });
};

module.exports = connectToDatabase;
