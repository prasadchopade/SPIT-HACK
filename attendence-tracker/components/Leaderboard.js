import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import NavigationBar from './NavigationBar';
import axios from 'axios';

const BASE_URL = 'http://10.10.61.225:5000/api/auth';

const InitialAvatar = ({ name, size = 40 }) => {
  const getInitialLetter = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  const getRandomColor = (name) => {
    const colors = [
      '#1a237e', // Deep Blue
      '#0D47A1', // Blue
      '#1B5E20', // Green
      '#B71C1C', // Red
      '#4A148C', // Purple
      '#004D40', // Teal
      '#E65100', // Orange
      '#263238', // Blue Grey
    ];
    
    // Use name to consistently get same color for same user
    const index = name ? name.length % colors.length : 0;
    return colors[index];
  };

  return (
    <View 
      style={[
        styles.initialAvatar, 
        { 
          width: size, 
          height: size, 
          borderRadius: size / 2,
          backgroundColor: getRandomColor(name)
        }
      ]}
    >
      <Text style={[styles.initialText, { fontSize: size * 0.4 }]}>
        {getInitialLetter(name)}
      </Text>
    </View>
  );
};

const Leaderboard = () => {
  const [selectedFilter, setSelectedFilter] = useState('Worldwide');
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const filters = ['Hacks', '6Dimens', 'SPIT', 'India'];

  useEffect(() => {
    fetchLeaderboardData();
  }, []);

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching from:', `${BASE_URL}/leaderboard`);
      
      const response = await axios.get(`${BASE_URL}/leaderboard`);
      console.log('Leaderboard response:', response.data);
      
      if (response.data && Array.isArray(response.data)) {
        setLeaderboardData(response.data);
      } else {
        throw new Error('Invalid data format received');
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setError(error.message);
      Alert.alert(
        'Error',
        'Failed to load leaderboard data. Please try again later.'
      );
    } finally {
      setLoading(false);
    }
  };

  const TopThree = () => {
    if (!leaderboardData || leaderboardData.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No data available</Text>
        </View>
      );
    }

    if (leaderboardData.length < 3) {
      // Handle case with less than 3 users
      return (
        <View style={styles.podiumWrapper}>
          {/* Show available users */}
          <View style={styles.podiumContainer}>
            {leaderboardData.map((user, index) => (
              <View 
                key={user.id} 
                style={[
                  styles.podiumItem,
                  index === 0 && styles.firstPlace,
                  index === 1 && styles.secondPlace,
                  index === 2 && styles.thirdPlace
                ]}
              >
                <View style={styles.rankBadge}>
                  <Text style={styles.rankText}>{index + 1}</Text>
                </View>
                <InitialAvatar name={user.name} size={60} />
                <Text style={styles.podiumName}>{user.name}</Text>
                <View style={styles.distanceContainer}>
                  <Icon name="map-marker-distance" size={16} color="#666" />
                  <Text style={styles.distanceText}>{user.distance}km</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      );
    }

    // Original TopThree implementation for 3 or more users
    return (
      <View style={styles.podiumWrapper}>
        {/* Podium Background */}
        <View style={styles.podiumBackground}>
          <View style={styles.podiumSecond} />
          <View style={styles.podiumFirst} />
          <View style={styles.podiumThird} />
        </View>

        <View style={styles.podiumContainer}>
          {/* Second Place */}
          <View style={[styles.podiumItem, styles.secondPlace]}>
            <View style={styles.rankBadge}>
              <Text style={styles.rankText}>2</Text>
            </View>
            <InitialAvatar name={leaderboardData[1].name} size={60} />
            <Text style={styles.podiumName}>{leaderboardData[1].name}</Text>
            <View style={styles.distanceContainer}>
              <Icon name="map-marker-distance" size={16} color="#666" />
              <Text style={styles.distanceText}>{leaderboardData[1].distance}km</Text>
            </View>
          </View>

          {/* First Place */}
          <View style={[styles.podiumItem, styles.firstPlace]}>
            <View style={[styles.rankBadge, styles.firstBadge]}>
              <Text style={styles.rankText}>1</Text>
            </View>
            <InitialAvatar name={leaderboardData[0].name} size={60} />
            <Text style={styles.podiumName}>{leaderboardData[0].name}</Text>
            <View style={styles.distanceContainer}>
              <Icon name="map-marker-distance" size={16} color="#666" />
              <Text style={styles.distanceText}>{leaderboardData[0].distance}km</Text>
            </View>
          </View>

          {/* Third Place */}
          <View style={[styles.podiumItem, styles.thirdPlace]}>
            <View style={styles.rankBadge}>
              <Text style={styles.rankText}>3</Text>
            </View>
            <InitialAvatar name={leaderboardData[2].name} size={60} />
            <Text style={styles.podiumName}>{leaderboardData[2].name}</Text>
            <View style={styles.distanceContainer}>
              <Icon name="map-marker-distance" size={16} color="#666" />
              <Text style={styles.distanceText}>{leaderboardData[2].distance}km</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1a237e" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error loading leaderboard</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={fetchLeaderboardData}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Leaderboard</Text>
      </View>

      <View style={styles.filterContainer}>
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterButton,
              selectedFilter === filter && styles.filterButtonActive
            ]}
            onPress={() => setSelectedFilter(filter)}
          >
            <Text style={[
              styles.filterText,
              selectedFilter === filter && styles.filterTextActive
            ]}>
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.content}>
        <TopThree />

        <View style={styles.listContainer}>
          {leaderboardData.slice(3).map((item) => (
            <View key={item.id} style={styles.listItem}>
              <Text style={styles.listRank}>{item.rank}</Text>
              <View style={styles.avatarContainer}>
                <InitialAvatar name={item.name} size={40} />
              </View>
              <Text style={styles.listName}>{item.name}</Text>
              <View style={styles.listDistanceContainer}>
                <Icon name="map-marker-distance" size={16} color="#666" />
                <Text style={styles.listDistanceText}>{item.distance}km</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <NavigationBar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a237e',
  },
  header: {
    padding: 16,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#fff',
  },
  filterText: {
    color: '#fff',
    fontSize: 13,
  },
  filterTextActive: {
    color: '#1a237e',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 20,
  },
  podiumWrapper: {
    height: 220,
    position: 'relative',
  },
  podiumBackground: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingBottom: 10,
  },
  podiumFirst: {
    width: 80,
    height: 100,
    backgroundColor: '#2A2A2A',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    marginHorizontal: 25,
  },
  podiumSecond: {
    width: 80,
    height: 80,
    backgroundColor: '#2A2A2A',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    marginRight: 10,
  },
  podiumThird: {
    width: 80,
    height: 60,
    backgroundColor: '#2A2A2A',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    marginLeft: 10,
  },
  podiumContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    height: '100%',
    paddingHorizontal: 20,
    position: 'relative',
    zIndex: 1,
  },
  podiumItem: {
    alignItems: 'center',
    marginHorizontal: 15,
  },
  firstPlace: {
    marginBottom: 100,
  },
  secondPlace: {
    marginBottom: 80,
  },
  thirdPlace: {
    marginBottom: 60,
  },
  podiumAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#fff',
  },
  firstAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  rankBadge: {
    position: 'absolute',
    top: -12,
    backgroundColor: '#FFD700',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  firstBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    top: -14,
  },
  rankText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  podiumName: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '500',
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  distanceText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#666',
  },
  listContainer: {
    padding: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  listRank: {
    width: 30,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  avatarContainer: {
    marginRight: 12,
  },
  listName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  listDistanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listDistanceText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#666',
  },
  initialAvatar: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#1a237e',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default Leaderboard; 