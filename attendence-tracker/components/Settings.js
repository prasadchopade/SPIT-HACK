import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, SafeAreaView, Modal, TextInput, ActivityIndicator, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import NavigationBar from './NavigationBar';
import axios from 'axios';

// Replace 10.0.2.2 with your computer's IP address
const BASE_URL = 'http://10.10.61.225:5000/api'; // Replace x.x with your actual IP
// const BASE_URL = 'http://192.168.56.1:5000/api'; // Replace x.x with your actual IP

const CommunityPage = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newPost, setNewPost] = useState({ heading: '', description: '' });
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const featuredPosts = [
    {
      id: 1,
      title: 'RC - Night Cycling',
      image: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182',
      description: 'Exploring the city\'s nightlife is an adventure',
      readTime: '6 minutes ago'
    },
    {
      id: 2,
      title: 'Mountain Escape',
      image: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606',
      description: 'Discover the tranquility of mountain trails',
      readTime: '2 hours ago'
    },
    {
      id: 3,
      title: 'SPIT Cycling',
      image: 'https://images.unsplash.com/photo-1541625810516-44f1ce894bcd',
      description: 'Exploring the campus trails is an adventure',
      readTime: '1 day ago'
    }
  ];

  // Test backend connection on component mount
  useEffect(() => {
    const init = async () => {
      await testConnection();
      if (isConnected) {
        fetchPosts();
      }
    };
    init();
  }, []);

  // Add another useEffect to fetch posts when connection is established
  useEffect(() => {
    if (isConnected) {
      fetchPosts();
    }
  }, [isConnected]);

  const testConnection = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/test`);
      console.log('Backend connection test:', response.data);
      setIsConnected(true);
    } catch (error) {
      console.error('Backend connection test failed:', error);
      Alert.alert(
        'Connection Error',
        'Could not connect to server. Please check your connection.'
      );
    }
  };

  const fetchPosts = async () => {
    if (!isConnected) {
      Alert.alert('Error', 'No connection to server');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/posts`);
      console.log('Fetched posts:', response.data);
      // Only take the latest 3 posts
      const latestPosts = response.data.slice(0, 3);
      setRecentPosts(latestPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      Alert.alert('Error', 'Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPost = async () => {
    if (!isConnected) {
      Alert.alert('Error', 'No connection to server');
      return;
    }

    if (!newPost.heading || !newPost.description) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.post(`${BASE_URL}/posts`, newPost);
      console.log('Post created:', response.data);
      setIsModalVisible(false);
      setNewPost({ heading: '', description: '' });
      Alert.alert('Success', 'Post created successfully');
      fetchPosts(); // Refresh the posts
    } catch (error) {
      console.error('Error adding post:', error);
      Alert.alert(
        'Error',
        'Failed to create post. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffInHours = Math.floor((now - postDate) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Community Page</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setIsModalVisible(true)}
          >
            <Icon name="plus" size={24} color="#1a237e" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.notificationButton}>
            <Icon name="bell-outline" size={24} color="#1a237e" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Featured Posts</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.featuredContainer}
        >
          {featuredPosts.map(post => (
            <TouchableOpacity key={post.id} style={styles.featuredCard}>
              <Image source={{ uri: post.image }} style={styles.featuredImage} />
              <View style={styles.featuredOverlay}>
                <Text style={styles.featuredTitle}>{post.title}</Text>
                <Text style={styles.featuredDescription}>{post.description}</Text>
                <TouchableOpacity style={styles.readMoreButton}>
                  <Text style={styles.readMoreText}>Read More</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>Recent Posts</Text>
        <View style={styles.recentContainer}>
          {recentPosts.map(post => (
            <TouchableOpacity key={post._id} style={styles.recentCard}>
              <View style={styles.recentContent}>
                <Text style={styles.recentTitle}>{post.heading}</Text>
                <Text style={styles.recentDescription}>{post.description}</Text>
                <Text style={styles.timeText}>{formatTime(post.time)}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Post</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Post Title"
              value={newPost.heading}
              onChangeText={(text) => setNewPost(prev => ({ ...prev, heading: text }))}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Write your post..."
              value={newPost.description}
              onChangeText={(text) => setNewPost(prev => ({ ...prev, description: text }))}
              multiline
              numberOfLines={4}
            />

            <TouchableOpacity 
              style={styles.submitButton}
              onPress={handleAddPost}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Post</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <NavigationBar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a237e',
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1a237e',
  },
  featuredContainer: {
    marginBottom: 24,
  },
  featuredCard: {
    width: 280,
    height: 180,
    marginRight: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  featuredDescription: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 8,
  },
  readMoreButton: {
    backgroundColor: '#1a237e',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  readMoreText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  recentContainer: {
    marginBottom: 16,
  },
  recentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  recentContent: {
    padding: 16,
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#1a237e',
  },
  recentDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  timeText: {
    fontSize: 12,
    color: '#999',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a237e',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#1a237e',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CommunityPage; 