const express = require("express");
const Attendance = require("../models/Attendance");
const Subject = require("../models/Subject");
const router = express.Router();
const { markAttendance } = require('../controller/attendanceController');


router.post('/mark', markAttendance);
router.get("/", async (req, res) => {
  try {
    const records = await Attendance.find().populate("subjectId", "name locationName schedule");
    console.log(records);
    res.status(200).json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
