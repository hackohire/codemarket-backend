const mongoose = require('mongoose');

// Only reconnect if needed. State is saved and outlives a handler invocation 
let isConnected;
let dbObj;

const connectToDatabase = () => {
  // mongoose.set('debug', true);
  if (isConnected) {
    console.log('Re-using existing database connection', process.env.MONGODB_URL);
    return Promise.resolve(dbObj);
  }

  console.log('Creating new database connection', process.env.MONGODB_URL);
  return mongoose.connect(process.env.MONGODB_URL, {
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
