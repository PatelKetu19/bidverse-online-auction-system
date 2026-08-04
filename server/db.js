// db.js
const mongoose = require('mongoose');

// Connection URL
const mongoURI = 'mongodb://127.0.0.1:27017/auctionDB';

// Connect to MongoDB
mongoose.connect(mongoURI)
    .then(() => console.log("MongoDB Connected ✅"))
    .catch(err => console.error("MongoDB connection error ❌", err));

// Optional: Log when connection is open
mongoose.connection.once('open', () => {
    console.log("MongoDB connection is open ✅");
});

// Optional: Log errors after initial connection
mongoose.connection.on('error', err => {
    console.error("MongoDB connection error after initial connection ❌", err);
});

module.exports = mongoose;