const express = require('express');
const errorHandler = require('./middleware/errorHandler');
const connectDb = require('./config/dbConnection');
const dotenv = require('dotenv').config();
const morgan = require('morgan');
const contactRoutes = require('./routes/contactRoutes');
const userRoutes = require('./routes/userRoutes');
const otpRoutes = require('./routes/otpRoutes');
const leadRoutes = require('./routes/leadRoutes');
const speechRoutes = require('./routes/speechRoute'); // <-- Added this line

const cors = require('cors');

const app = express();

connectDb();

app.use(express.json());
app.use(cors());

const port = process.env.PORT || 3002;

app.use(morgan('dev'));
app.use('/api/contacts', contactRoutes);
app.use('/api/users', userRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/lead', leadRoutes);
app.use('/api', speechRoutes); // <-- Added this line
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
