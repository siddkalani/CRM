const express = require('express')
const errorHandler = require('./middleware/errorHandler')
const connectDb = require('./config/dbConnection')
const dotenv = require("dotenv").config()
const contactRoutes = require('./routes/contactRoutes')
const userRoutes = require('./routes/userRoutes')
const otpRoutes = require('./routes/otpRoutes')
const cors = require('cors');

const app = express()

connectDb()

app.use(express.json());
app.use(cors());
const port = process.env.PORT || 3002;

app.use('/api/contacts',contactRoutes)
app.use('/api/users',userRoutes)
app.use('/api/otp', otpRoutes);
app.use(errorHandler)

app.listen(port, ()=>{
    console.log(`Server is running on port ${port}`)
})