require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// middleware
app.use(express.json());
app.use(cors({
  origin: "http://lifexpskilltree.xyz",
  credentials: true
}));

// routes
const authRoutes = require('./routes/auth');
app.use('/api', authRoutes);

// database
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.log("Mongo ERROR:", err));

// start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => 
  console.log(`Server running on port ${PORT}`)
);
