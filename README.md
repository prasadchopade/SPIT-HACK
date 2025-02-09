# Geo-Based Attendance Tracker

## Description
Geo-Based Attendance Tracker is a mobile application built with React Native and Expo that allows users to manage attendance for various subjects. The app provides features for adding subjects, viewing attendance records, and updating attendance status in background based on location.

## Features
- **Subject Management**: Users can add, edit, and delete subjects.
- **Attendance Records**: Users can view attendance records for each subject.
- **Location-Based Attendance**: The app updates attendance status in the background based on the user's location.

## Installation
To set up the project locally, follow these steps:

1. Clone the repository:
   ```sh
   git clone <repository-url>
   cd attendence-tracker
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Start the development server:
   ```sh
   npx expo start
   ```

## Usage
- Open the app on your mobile device or emulator.
- Use the "Add Subject" tab to create new subjects.
- View existing subjects in the "Subjects" tab.
- Access settings and additional features in the "Settings" tab.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License
This project is licensed under the MIT License.



<!-- ////////////////////components -> SubjectForm.js////////////////////////// -->
// import React, { useState } from "react";
// import { View, Text, TextInput, Button, StyleSheet, ScrollView } from "react-native";
// import { Picker } from "@react-native-picker/picker";
// import axios from "axios";

// const SubjectForm = () => {
//   const [name, setName] = useState("");
//   const [locationName, setLocationName] = useState("");
//   const [coordinates, setCoordinates] = useState({ latitude: "", longitude: "" });
//   const [schedule, setSchedule] = useState([{ day: "Monday", time: "" }]);

//   const handleScheduleChange = (index, field, value) => {
//     const updatedSchedule = [...schedule];
//     updatedSchedule[index][field] = value;
//     setSchedule(updatedSchedule);
//   };

//   const addSchedule = () => {
//     setSchedule([...schedule, { day: "Monday", time: "" }]);
//   };

//   const handleSubmit = async () => {
//     try {
//       console.log({
//         name,
//         locationName,
//         coordinates,
//         schedule,
//       });
//       const response = await axios.post(`http://192.168.73.233:5000/api/subjects/create`, {
//         name,
//         locationName,
//         coordinates,
//         schedule,
//       });
//       console.log("Subject created:", response.data);
//     } catch (error) {
//       console.error("Error creating subject:", error);
//     }
//   };

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Text style={styles.label}>Name:</Text>
//       <TextInput
//         style={styles.input}
//         value={name}
//         onChangeText={setName}
//         placeholder="Enter subject name"
//       />

//       <Text style={styles.label}>Location Name:</Text>
//       <TextInput
//         style={styles.input}
//         value={locationName}
//         onChangeText={setLocationName}
//         placeholder="Enter location name"
//       />

//       <Text style={styles.label}>Latitude:</Text>
//       <TextInput
//         style={styles.input}
//         value={coordinates.latitude}
//         onChangeText={(value) => setCoordinates({ ...coordinates, latitude: value })}
//         placeholder="Enter latitude"
//         keyboardType="numeric"
//       />

//       <Text style={styles.label}>Longitude:</Text>
//       <TextInput
//         style={styles.input}
//         value={coordinates.longitude}
//         onChangeText={(value) => setCoordinates({ ...coordinates, longitude: value })}
//         placeholder="Enter longitude"
//         keyboardType="numeric"
//       />

//       <Text style={styles.label}>Schedule:</Text>
//       {schedule.map((entry, index) => (
//         <View key={index} style={styles.scheduleContainer}>
//           <Picker
//             selectedValue={entry.day}
//             onValueChange={(value) => handleScheduleChange(index, "day", value)}
//             style={styles.picker}
//           >
//             <Picker.Item label="Monday" value="Monday" />
//             <Picker.Item label="Tuesday" value="Tuesday" />
//             <Picker.Item label="Wednesday" value="Wednesday" />
//             <Picker.Item label="Thursday" value="Thursday" />
//             <Picker.Item label="Friday" value="Friday" />
//             <Picker.Item label="Saturday" value="Saturday" />
//             <Picker.Item label="Sunday" value="Sunday" />
//           </Picker>

//           <TextInput
//             style={styles.input}
//             value={entry.time}
//             onChangeText={(value) => handleScheduleChange(index, "time", value)}
//             placeholder="Enter time (e.g., 09:00 AM)"
//           />
//         </View>
//       ))}

//       <Button title="Add Schedule" onPress={addSchedule} />
//       <View style={styles.submitButton}>
//         <Button title="Create Subject" onPress={handleSubmit} />
//       </View>
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     padding: 20,
//   },
//   label: {
//     fontSize: 16,
//     fontWeight: "bold",
//     marginBottom: 8,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     padding: 10,
//     marginBottom: 16,
//     borderRadius: 5,
//   },
//   scheduleContainer: {
//     marginBottom: 16,
//     padding: 10,
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 5,
//   },
//   picker: {
//     marginBottom: 16,
//     height: 50,
//   },
//   submitButton: {
//     marginTop: 20,
//   },
// });

// export default SubjectForm;