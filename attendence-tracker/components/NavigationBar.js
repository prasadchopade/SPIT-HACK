import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const NavigationBar = () => {
  const router = useRouter();
  const currentPath = usePathname();

  const navigationItems = [
    {
      id: '1',
      title: 'Rides',
      icon: 'bike',
      route: '/subject-form'
    },
    {
      id: '2',
      title: 'Community',
      icon: 'account-group',
      route: '/community'
    },
    {
      id: 'home',
      title: 'Home',
      icon: 'home',
      route: '/dashboard'
    },
    {
      id: '3',
      title: 'Leaderboard',
      icon: 'trophy',
      route: '/leaderboard'
    },
    {
      id: '4',
      title: 'Profile',
      icon: 'account',
      route: '/profile'
    }
  ];

  return (
    <View style={styles.navbar}>
      {navigationItems.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={[
            styles.navItem,
            currentPath === item.route && styles.activeNavItem,
            item.id === 'home' && styles.homeItem
          ]}
          onPress={() => router.push(item.route)}
        >
          <Icon 
            name={item.icon} 
            size={item.id === 'home' ? 32 : 24} 
            color={currentPath === item.route ? '#000' : '#666'} 
          />
          <Text style={[
            styles.navText,
            currentPath === item.route && styles.activeNavText
          ]}>
            {item.title}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  homeItem: {
    marginTop: -20, // Lift the home button up
    backgroundColor: '#fff',
    width: 60,
    height: 60,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  activeNavItem: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
    padding: 4,
  },
  navText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  activeNavText: {
    color: '#000',
    fontWeight: 'bold',
  },
});

export default NavigationBar; 