import { View, Text, StyleSheet } from 'react-native';
import { useSearchParams } from 'expo-router';

export default function Subject() {
  const { name, time, location } = useSearchParams();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{name}</Text>
      <Text>Time: {time}</Text>
      <Text>Location: {location}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
});
