require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const { checkScheduleAndNotify } = require('./services/AttendenceTracker.js');

// Import routes
const subjectRoutes = require("./routes/subjectRoutes.js");
const attendanceRoutes = require("./routes/attendanceRoutes");
const postRoutes = require('./routes/posts');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB first
mongoose
  .connect(process.env.MONGO_URL, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
  })
  .then(() => {
    console.log("Connected to MongoDB");
    
    // Only set up routes after successful database connection
    app.use("/api/subjects", subjectRoutes);
    app.use("/api/attendance", attendanceRoutes);
    app.use('/api', postRoutes);
    app.use('/api/auth', authRoutes);
    
    // Start server after routes are set up
    app.listen(5000, '0.0.0.0', () => {
      console.log("Server running on port 5000");
      console.log("Try accessing: http://localhost:5000/api/test");
    });
  })
  .catch((err) => {
    console.log("MongoDB connection error:", err);
    process.exit(1);
  });

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

setInterval(checkScheduleAndNotify, 60000);
