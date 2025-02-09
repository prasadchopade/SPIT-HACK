const mongoose = require('mongoose');
const Subject = require('../models/Subject');
const axios = require('axios');
const moment = require('moment');

const checkScheduleAndNotify = async () => {
  try {
    const now = moment();
    const day = now.format('dddd');
    const time = now.format('h:mm A');

    const subjects = await Subject.find({ "schedule.day": day });

    const matchingSubjects = subjects.filter((subject) =>
      subject.schedule.some((entry) => entry.day === day && entry.time === time)
    );

    for (const subject of matchingSubjects) {
      await axios.post('http://app-notification-url', {
        subjectId: subject._id,
        message: `Time to check in for ${subject.name}`,
      });
    }
  } catch (error) {
    console.error('Error checking schedule:', error.message);
  }
};
module.exports = { checkScheduleAndNotify };
