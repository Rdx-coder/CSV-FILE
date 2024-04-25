// Importing mongoose library for MongoDB connection
const mongoose = require('mongoose');

// Connecting to MongoDB database named 'csvUploads' running on localhost at port 27017
mongoose.connect('mongodb://127.0.0.1:27017/csvUploads');

// Getting the default connection
const db = mongoose.connection;

// Once the connection is open, this callback function will be executed
db.once('open', function(){
    console.log('database connected to the server successfully!'); // Logging successful connection to the console
});

// Exporting the database connection object for external usage
module.exports = db;
