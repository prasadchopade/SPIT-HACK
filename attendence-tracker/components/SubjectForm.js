// Ride.js
import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Button,
  Alert,
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import MapView, { Marker, UrlTile, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import NavigationBar from './NavigationBar';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// EXAMPLE: Pothole data from your DB
const POTHOLES_DB = [
  { id: 1, latitude: 20.595, longitude: 78.965 },
  { id: 2, latitude: 20.596, longitude: 78.969 },
  { id: 3, latitude: 19.1255, longitude: 72.8531 },
  { id: 4, latitude: 19.1234, longitude: 72.5678 },
  { id: 5, latitude: 19.2345, longitude: 72.6789 },
  { id: 6, latitude: 19.3456, longitude: 72.7890 },
  { id: 7, latitude: 19.4567, longitude: 72.8901 },
  { id: 8, latitude: 19.5678, longitude: 72.9012 },
  { id: 9, latitude: 19.6789, longitude: 72.0123 },
  { id: 10, latitude: 19.7890, longitude: 72.1234 },
  { id: 11, latitude: 19.8912, longitude: 72.2345 },
  { id: 12, latitude: 19.9123, longitude: 72.3456 },
  { id: 13, latitude: 19.9234, longitude: 72.4567 },
  { id: 14, latitude: 19.9345, longitude: 72.5678 },
  { id: 15, latitude: 19.9456, longitude: 72.6789 },
  { id: 16, latitude: 19.1272, longitude: 72.8357 },
  { id: 17, latitude: 19.1267, longitude: 72.8313 },
  { id: 18, latitude: 19.1271, longitude: 72.8353 },
  { id: 19, latitude: 19.1243, longitude: 72.8375 },
  { id: 20, latitude: 19.1277, longitude: 72.8461 },
  { id: 21, latitude: 19.1276, longitude: 72.8406 },
  { id: 22, latitude: 19.1278, longitude: 72.8319 },
  { id: 23, latitude: 19.1223, longitude: 72.8459 },
];

// You might want a haversine distance library, but let's do a quick approximation
function getDistanceLatLng(lat1, lng1, lat2, lng2) {
  // returns approximate distance in meters using the haversine formula
  const R = 6371e3; // Earth radius in meters
  const toRad = (x) => (x * Math.PI) / 180;

  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lng2 - lng1);

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c;
  return distance; // in meters
}

// Add this function near the top with other utility functions
const calculateRouteScore = (potholes, distance) => {
  if (!distance) return 0;
  
  // Convert distance to kilometers
  const distanceKm = distance / 1000;
  
  // Base score starts at 100
  let score = 100;
  
  // Penalize for potholes (more penalty for shorter distances)
  const potholeDensity = potholes / distanceKm;
  const potholePenalty = Math.min(60, potholeDensity * 15); // Max 60 points penalty for potholes
  
  // Penalize for very short or very long distances
  const optimalDistance = 5; // 25km is considered optimal
  const distancePenalty = Math.min(30, Math.abs(distanceKm - optimalDistance) * 2);
  // const distancePenalty = Math.max(15, (distanceKm - optimalDistance) * 2);
  
  // Calculate final score
  score = Math.max(0, score - potholePenalty - distancePenalty);
  
  return Math.round(score);
};

export default function Ride() {
  const [currentLocation, setCurrentLocation] = useState(null); // Blue marker
  const [locationSubscription, setLocationSubscription] = useState(null);

  const [destinationCoord, setDestinationCoord] = useState(null); // Red marker

  // Text fields
  const [currentLocationInput, setCurrentLocationInput] = useState('');
  const [destinationInput, setDestinationInput] = useState('');

  // Example placeholders
  const [potholePrediction, setPotholePrediction] = useState('High');
  const [predictiveCollision, setPredictiveCollision] = useState('5%');
  const [fatigueLevel, setFatigueLevel] = useState('Low');
  const [collisionProbability, setCollisionProbability] = useState('5%');

  const [mapRegion, setMapRegion] = useState({
    latitude: 0, // This will be updated immediately with current location
    longitude: 0,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  // Route
  const [routeCoords, setRouteCoords] = useState([]);
  
  // Potholes that lie on the route
  const [potholesOnRoute, setPotholesOnRoute] = useState([]); 

  const [totalDistance, setTotalDistance] = useState(0);

  // 1) Request location & track user
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location permission is required to show your current location.'
        );
        return;
      }

      // Get initial location
      const initialLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });
      
      // Set initial map region to current location
      setMapRegion({
        latitude: initialLocation.coords.latitude,
        longitude: initialLocation.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
      
      setCurrentLocation({
        latitude: initialLocation.coords.latitude,
        longitude: initialLocation.coords.longitude,
      });
      
      setCurrentLocationInput(
        `Lat: ${initialLocation.coords.latitude.toFixed(4)}, Lng: ${initialLocation.coords.longitude.toFixed(4)}`
      );

      // Start watching position
      const sub = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 1,
        },
        (loc) => {
          const { latitude, longitude } = loc.coords;
          setCurrentLocation({ latitude, longitude });
          setCurrentLocationInput(
            `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`
          );
        }
      );
      setLocationSubscription(sub);
    })();

    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, []);

  // Tapping the map -> set red marker
  const handleMapPress = (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setDestinationCoord({ latitude, longitude });
  };

  // 2) Fetch route & detect potholes
  const handleSetDestination = async () => {
    if (!destinationCoord) {
      Alert.alert('No Destination', 'Please tap the map to place the red marker first.');
      return;
    }
    setDestinationInput(
      `Lat: ${destinationCoord.latitude.toFixed(4)}, Lng: ${destinationCoord.longitude.toFixed(4)}`
    );

    if (!currentLocation) {
      Alert.alert('No Current Location', 'We do not have your current location yet.');
      return;
    }

    try {
      const ORS_API_KEY = '5b3ce3597851110001cf62481d7f7e0470d341efa47b5e7ddc6eadf7';

      const start = `${currentLocation.longitude},${currentLocation.latitude}`;
      const end = `${destinationCoord.longitude},${destinationCoord.latitude}`;
      const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${ORS_API_KEY}&start=${start}&end=${end}`;
      
      const resp = await fetch(url);
      const data = await resp.json();
      if (!data.features || !data.features[0]) {
        Alert.alert('Route Error', 'No route found by ORS.');
        return;
      }

      const route = data.features[0].geometry.coordinates; // [lon, lat]
      const polylineCoords = route.map(([lon, lat]) => ({
        latitude: lat,
        longitude: lon,
      }));
      setRouteCoords(polylineCoords);

      // Calculate total distance
      let routeDistance = 0;
      for (let i = 0; i < polylineCoords.length - 1; i++) {
        const dist = getDistanceLatLng(
          polylineCoords[i].latitude,
          polylineCoords[i].longitude,
          polylineCoords[i + 1].latitude,
          polylineCoords[i + 1].longitude
        );
        routeDistance += dist;
      }
      setTotalDistance(routeDistance);

      // === DETECT POTHOLES ON ROUTE ===
      // We'll do a simple "closest route coordinate" check
      const threshold = 50; // meters
      const found = [];

      POTHOLES_DB.forEach((pothole) => {
        let isOnRoute = false;
        for (let i = 0; i < polylineCoords.length; i++) {
          const dist = getDistanceLatLng(
            pothole.latitude,
            pothole.longitude,
            polylineCoords[i].latitude,
            polylineCoords[i].longitude
          );
          if (dist < threshold) {
            // This pothole is "close enough"
            isOnRoute = true;
            break;
          }
        }
        if (isOnRoute) {
          found.push(pothole);
        }
      });

      setPotholesOnRoute(found);

      Alert.alert(
        'Directions Loaded',
        `Route displayed! Found ${found.length} pothole(s) on this path.`
      );
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Could not fetch route from OpenRouteService.');
    }
  };

  if (!currentLocation) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#000" />
        <Text>Fetching your current location...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Plan Your Ride</Text>
          <Text style={styles.headerSubtitle}>Select your destination on the map</Text>
        </View>

        {/* Location Cards */}
        <View style={styles.locationContainer}>
          {/* Current Location Card */}
          <View style={styles.locationCard}>
            <View style={styles.locationIconContainer}>
              <Icon name="crosshairs-gps" size={24} color="#1a237e" />
            </View>
            <View style={styles.locationTextContainer}>
              <Text style={styles.locationLabel}>Current Location</Text>
              <TextInput
                style={styles.locationInput}
                value={currentLocationInput}
                onChangeText={setCurrentLocationInput}
                placeholder="Fetching location..."
                placeholderTextColor="#999"
                editable={false}
              />
            </View>
          </View>

          {/* Destination Card */}
          <View style={styles.locationCard}>
            <View style={styles.locationIconContainer}>
              <Icon name="map-marker-radius" size={24} color="#1a237e" />
            </View>
            <View style={styles.locationTextContainer}>
              <Text style={styles.locationLabel}>Destination</Text>
              <TextInput
                style={styles.locationInput}
                value={destinationInput}
                onChangeText={setDestinationInput}
                placeholder="Tap on map to set destination"
                placeholderTextColor="#999"
                editable={false}
              />
            </View>
          </View>
        </View>

        {/* Set Destination Button */}
        <TouchableOpacity 
          style={styles.setDestinationButton}
          onPress={handleSetDestination}
        >
          <Icon name="navigation-variant" size={20} color="#fff" />
          <Text style={styles.setDestinationText}>Set Destination</Text>
        </TouchableOpacity>

        {/* Map */}
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            region={mapRegion}
            onRegionChangeComplete={(reg) => setMapRegion(reg)}
            onPress={handleMapPress}
          >
            {/* OSM tiles */}
            <UrlTile urlTemplate="https://a.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {/* Blue marker for user */}
            <Marker
              coordinate={{
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
              }}
              pinColor="blue"
              title="You are here"
            />

            {/* Red marker for destination */}
            {destinationCoord && (
              <Marker
                coordinate={destinationCoord}
                pinColor="red"
                title="Destination"
              />
            )}

            {/* Polyline for route */}
            {routeCoords.length > 0 && (
              <Polyline
                coordinates={routeCoords}
                strokeColor="#ff0000"
                strokeWidth={3}
              />
            )}

            {/* Markers for potholes on route */}
            {potholesOnRoute.map((p) => (
              <Marker
                key={p.id}
                coordinate={{ latitude: p.latitude, longitude: p.longitude }}
                title={`Pothole #${p.id}`}
                pinColor="orange"
              />
            ))}
          </MapView>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Icon 
              name="alert-octagon" 
              size={28} 
              color="#1a237e" 
            />
            <Text style={styles.statValue}>{potholesOnRoute.length || 0}</Text>
            <Text style={styles.statLabel}>Potholes</Text>
          </View>
          <View style={styles.statCard}>
            <Icon 
              name="map-marker-distance" 
              size={28} 
              color="#1a237e" 
            />
            <Text style={styles.statValue}>
              {totalDistance ? (totalDistance/1000).toFixed(1) : 0} km
            </Text>
            <Text style={styles.statLabel}>Distance</Text>
          </View>
        </View>

        {/* Route Score */}
        <View style={[styles.routeScoreContainer, {
          backgroundColor: totalDistance ? '#E8EAF6' : '#f5f5f5'
        }]}>
          <Text style={styles.routeScoreTitle}>Optimal Route Score</Text>
          <View style={styles.scoreCircle}>
            <Text style={styles.scoreNumber}>
              {calculateRouteScore(potholesOnRoute.length, totalDistance)}
            </Text>
            <Text style={styles.scoreLabel}>/100</Text>
          </View>
          <Text style={styles.scoreHint}>
            {totalDistance ? 
              `Based on ${potholesOnRoute.length} potholes over ${(totalDistance/1000).toFixed(1)}km` :
              'Set a destination to see route score'
            }
          </Text>
        </View>
      </ScrollView>
      <NavigationBar />
    </SafeAreaView>
  );
}

// ---------------------------------
// STYLES
// ---------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    paddingBottom: 70, // Add padding for NavigationBar
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
    marginTop: 8,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 14,
    marginBottom: 8,
    borderRadius: 4,
  },
  map: {
    width: '100%',
    height: 300,
    marginVertical: 12,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    marginTop: 16,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a237e',
    marginTop: 12,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    fontWeight: '500',
  },
  routeScoreContainer: {
    margin: 16,
    marginBottom: 90, // Increased bottom margin to avoid navbar overlap
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  routeScoreTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 12,
  },
  scoreCircle: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginVertical: 8,
  },
  scoreNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#1a237e',
  },
  scoreLabel: {
    fontSize: 18,
    color: '#666',
    marginLeft: 4,
  },
  scoreHint: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  locationContainer: {
    marginBottom: 16,
  },
  locationCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  locationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8EAF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  locationTextContainer: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontWeight: '500',
  },
  locationInput: {
    fontSize: 14,
    color: '#1a237e',
    fontWeight: '500',
  },
  setDestinationButton: {
    flexDirection: 'row',
    backgroundColor: '#1a237e',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  setDestinationText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  mapContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
});