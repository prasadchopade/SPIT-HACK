import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import NavigationBar from './NavigationBar';

const SubjectList = () => {
  const router = useRouter();

  const navigationItems = [
    {
      id: '1',
      title: 'Rides',
      icon: 'directions-car',
      route: '/subject-form'
    },
    {
      id: '2',
      title: 'Profile',
      icon: 'person',
      route: '/profile'
    },
    {
      id: '3',
      title: 'Leaderboard',
      icon: 'leaderboard',
      route: '/leaderboard'
    },
    {
      id: '4',
      title: 'Settings',
      icon: 'settings',
      route: '/settings'
    }
  ];

  return (
    <LinearGradient
      colors={['#B4E1DC', '#E7D5C4']}
      style={styles.container}
    >
      <Text style={styles.greeting}>CySpace</Text>
      <View style={styles.grid}>
        {navigationItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.box}
            onPress={() => router.push(item.route)}
          >
            <MaterialIcons name={item.icon} size={40} color="#333" />
            <Text style={styles.boxText}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <NavigationBar />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingBottom: 70,
  },
  greeting: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginTop: 60,
    lineHeight: 40,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  box: {
    width: '45%',
    aspectRatio: 1,
    backgroundColor: 'white',
    borderRadius: 10,
    margin: 8,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  boxText: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default SubjectList;
