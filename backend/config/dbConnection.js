// config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // useCreateIndex: true, // if needed for older mongoose versions
    });
    console.log("database connected: ",conn.connection.host,conn.connection.name);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};
// const Lead = require("../models/leadModel"); // Adjust the path to your model

// async function fixNotesField() {
//   await Lead.updateMany(
//     { notes: { $exists: false } }, // Only update leads without notes
//     { $set: { notes: [] } }
//   );
//   console.log("Fixed missing notes field.");
//   mongoose.disconnect();
// }

// fixNotesField();

module.exports = connectDB;
