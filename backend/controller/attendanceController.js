const Attendance = require('../models/Attendance');
const Subject = require('../models/Subject');

const checkProximity = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c * 1000;
};

exports.markAttendance = async (req, res) => {
  try {
    const { subjectId, latitude, longitude } = req.body;

    const subject = await Subject.findById(subjectId);
    if (!subject) return res.status(404).json({ message: 'Subject not found' });

    const { latitude: subjectLat, longitude: subjectLon } = subject.coordinates;
    const distance = checkProximity(latitude, longitude, subjectLat, subjectLon);

    const status = distance <= 50 ? 'present' : 'absent';

    await Attendance.create({
      subjectId,
      date: new Date(),
      status,
    });

    res.json({ message: `Attendance marked as ${status}` });
  } catch (error) {
    console.error('Error updating attendance:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};
