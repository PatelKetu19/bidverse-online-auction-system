const express = require('express');
const cors = require('cors');
const mongoose = require('./db');
const User = require('./models/user');
const app = express();

// Middleware — allow up to 10 MB for base64 image uploads
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/product', require('./routes/product'));
app.use('/bid', require('./routes/bid'));

// Start server only after MongoDB is connected
mongoose.connection.once('open', () => {
    console.log("MongoDB connection is open");
    app.listen(3000, () => {
        console.log("Server running on port 3000");
    });
});

mongoose.connection.on('error', err => {
    console.error("MongoDB connection error:", err);
});
