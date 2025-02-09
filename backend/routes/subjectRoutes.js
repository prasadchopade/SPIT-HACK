const express = require("express");
const Subject = require("../models/Subject");
const router = express.Router();

router.post("/create", async (req, res) => {
  try {
    const { name, locationName, coordinates, schedule } = req.body;
console.log(req.body);
    if (!name || !locationName || !coordinates || !schedule) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const subject = new Subject({
      name,
      locationName,
      coordinates: {
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
      },
      schedule,
    });

    await subject.save();
    res.status(201).json(subject);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const subjects = await Subject.find();
    res.status(200).json(subjects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { name, locationName, coordinates, schedule } = req.body;

    const updatedSubject = await Subject.findByIdAndUpdate(
      req.params.id,
      {
        name,
        locationName,
        coordinates: coordinates
          ? {
              latitude: coordinates.latitude,
              longitude: coordinates.longitude,
            }
          : undefined,
        schedule,
      },
      { new: true }
    );

    if (!updatedSubject) {
      return res.status(404).json({ error: "Subject not found." });
    }

    res.status(200).json(updatedSubject);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
