import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import axios from 'axios';

const TASK_NAME = 'background-attendance-check';

TaskManager.defineTask(TASK_NAME, async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return BackgroundFetch.Result.Failed;

    const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    const { latitude, longitude } = location.coords;

    const response = await axios.get('http://localhost:5000/subjects');
    const subjects = response.data;

    const now = new Date();
    const matchedSubject = subjects.find((subject) => {
      const subjectTime = new Date(subject.time);
      return (
        subjectTime.getHours() === now.getHours() &&
        subjectTime.getMinutes() === now.getMinutes() &&
        checkProximity(latitude, longitude, subject.location)
      );
    });

    if (matchedSubject) {
      await axios.post('http://localhost:5000/attendance/mark', { subjectId: matchedSubject._id });
    }

    return BackgroundFetch.Result.NewData;
  } catch (error) {
    console.error('Error in background fetch:', error);
    return BackgroundFetch.Result.Failed;
  }
});

export const registerBackgroundTask = async () => {
  const status = await BackgroundFetch.registerTaskAsync(TASK_NAME, {
    minimumInterval: 15 * 60,
  });
  console.log('Background task registered:', status);
};

const checkProximity = (lat1, lon1, loc2) => {

};
