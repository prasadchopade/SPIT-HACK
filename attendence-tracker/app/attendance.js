import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { useRouter, useLocalSearchParams } from 'expo-router';

const AttendanceScreen = () => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({ present: 0, absent: 0 });
  const router = useRouter();
  const { subjectId } = useLocalSearchParams();


  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        if (!subjectId) {
          console.error('No subject ID provided');
          return;
        }
        const response = await axios.get(`https://192.168.73.233/api/attendance?subjectId=${subjectId}`);
        setAttendanceRecords(response.data);
        console.log('Attendance fetched:', response.data);

        let presentCount = 0;
        let absentCount = 0;
        response.data.forEach((record) => {
          if (record.status === "present") presentCount++;
          else if (record.status === "absent") absentCount++;
        });
        setAnalytics({ present: presentCount, absent: absentCount });
      } catch (error) {
        console.error("Error fetching attendance:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [subjectId]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading attendance...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Attendance Analytics</Text>
      <Text>Total Present: {analytics.present}</Text>
      <Text>Total Absent: {analytics.absent}</Text>

      <FlatList
        data={attendanceRecords}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text>Date: {new Date(item.date).toLocaleDateString()}</Text>
            <Text>Status: {item.status}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  item: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#ccc' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default AttendanceScreen;
