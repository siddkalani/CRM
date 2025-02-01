// index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/dbConnection');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json()); // built-in body parser

// Serve static files from the uploads directory (for images/docs)
// app.use('/uploads', express.static('uploads'));

// Define routes
// app.use('/api/auth', require('./routes/auth'));
// app.use('/api/leads', require('./routes/leads'));
// app.use('/api/contacts', require('./routes/contacts'));

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
