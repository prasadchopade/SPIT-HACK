import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  SafeAreaView, 
  Modal, 
  TextInput, 
  ActivityIndicator, 
  Alert 
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import NavigationBar from './NavigationBar';
import axios from 'axios';

const BASE_URL = 'http://10.10.61.225:5000/api';

const CommunityPage = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newPost, setNewPost] = useState({ heading: '', description: '' });
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const init = async () => {
      await testConnection();
      if (isConnected) {
        fetchPosts();
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (isConnected) {
      fetchPosts();
    }
  }, [isConnected]);

  const testConnection = async () => {
    try {
      await axios.get(`${BASE_URL}/test`);
      setIsConnected(true);
    } catch (error) {
      console.error('Connection test failed:', error);
      setIsConnected(false);
    }
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/posts`);
      console.log('Fetched posts:', response.data);
      const latestPosts = response.data.slice(0, 3);
      setRecentPosts(latestPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      Alert.alert('Error', 'Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async () => {
    if (!newPost.heading || !newPost.description) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      await axios.post(`${BASE_URL}/posts`, newPost);
      setNewPost({ heading: '', description: '' });
      setIsModalVisible(false);
      fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Error', 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      if (!dateString) return '';
      
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      if (minutes < 60) {
        return minutes <= 1 ? 'Just now' : `${minutes} minutes ago`;
      } else if (hours < 24) {
        return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
      } else if (days < 7) {
        return days === 1 ? 'Yesterday' : `${days} days ago`;
      } else {
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
      }
    } catch (error) {
      console.error('Date formatting error:', error);
      return '';
    }
  };

  const featuredPosts = [
    {
      id: 1,
      title: 'RC - Night Cycling',
      image: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182',
      description: "Exploring the city's nightlife is an adventure",
      readTime: '6 minutes ago'
    },
    {
      id: 2,
      title: 'Mountain Escape',
      image: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606',
      description: 'Discover the tranquility of mountain hikes.',
      readTime: '2 hours ago'
    },
    {
      id: 3,
      title: 'SPIT Cycling Club',
      image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b',
      description: 'Join our weekend cycling adventures!',
      readTime: '1 day ago'
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Community Page</Text>
          <TouchableOpacity style={styles.notificationButton}>
            <Icon name="bell" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Featured Posts Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Featured Posts</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.featuredContainer}
          >
            {featuredPosts.map((post) => (
              <TouchableOpacity 
                key={post.id} 
                style={styles.featuredCard}
                onPress={() => {/* Handle post click */}}
              >
                <Image 
                  source={{ uri: post.image }} 
                  style={styles.featuredImage}
                />
                <View style={styles.featuredContent}>
                  <Text style={styles.featuredTitle}>{post.title}</Text>
                  <Text style={styles.featuredDescription}>
                    {post.description}
                  </Text>
                  <TouchableOpacity style={styles.readMoreButton}>
                    <Text style={styles.readMoreText}>Read More</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Recent Posts Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Posts</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setIsModalVisible(true)}
            >
              <Icon name="plus" size={20} color="#fff" />
              <Text style={styles.addButtonText}>New Post</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.recentPostsContainer}>
            {recentPosts.map((post, index) => (
              <View key={post._id || index} style={styles.postCard}>
                <Text style={styles.postTitle}>{post.heading}</Text>
                <Text style={styles.postDescription}>{post.description}</Text>
                <View style={styles.postFooter}>
                  <View style={styles.postMeta}>
                    <Icon name="clock-outline" size={14} color="#666" />
                    <Text style={styles.timestamp}>
                      {formatDate(post.createdAt)}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalView}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Post</Text>
              <TouchableOpacity 
                onPress={() => setIsModalVisible(false)}
              >
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Title"
              value={newPost.heading}
              onChangeText={(text) => setNewPost(prev => ({ ...prev, heading: text }))}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="What's on your mind?"
              value={newPost.description}
              onChangeText={(text) => setNewPost(prev => ({ ...prev, description: text }))}
              multiline
              numberOfLines={4}
            />

            <TouchableOpacity 
              style={styles.submitButton}
              onPress={handlePost}
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
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1a237e',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  notificationButton: {
    padding: 8,
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 16,
  },
  featuredContainer: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  featuredCard: {
    width: 280,
    marginRight: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  featuredImage: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  featuredContent: {
    padding: 16,
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 8,
  },
  featuredDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  readMoreButton: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#1a237e',
    borderRadius: 16,
  },
  readMoreText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a237e',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#fff',
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
  },
  recentPostsContainer: {
    marginTop: 8,
  },
  postCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 8,
  },
  postDescription: {
    fontSize: 16,
    color: '#444',
    marginBottom: 12,
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 8,
  },
  postMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalView: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
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