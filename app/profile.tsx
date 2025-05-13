import { getUserDetails, logout, User } from '@/services/auth'; // Import logout
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserDetails();
  }, []);

  const loadUserDetails = async () => {
    try {
      const userData = await getUserDetails();
      setUser(userData);
    } catch (error) {
      console.error('Error loading user details:', error);
      Alert.alert('Error', 'Failed to load user details');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();  // Call logout function
      router.replace('/(auth)/login');  // Navigate to login page
    } catch (error) {
      Alert.alert('Error', 'Logout failed. Please try again.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.profileImageContainer}>
          {user?.profile_url ? (
            <Image source={{ uri: user.profile_url }} style={styles.profileImage} />
          ) : (
            <Ionicons name="person-circle" size={100} color="#4CAF50" />
          )}
        </View>
        <Text style={styles.name}>{user?.name || 'Guest User'}</Text>
        <Text style={styles.email}>{user?.email || 'Sign in to access your profile'}</Text>
        {user?.location && <Text style={styles.location}>{user.location}</Text>}
        {user?.occupation && <Text style={styles.occupation}>{user.occupation}</Text>}
      </View>

     <View style={styles.menuContainer}>
  {user ? (
    <>
      <TouchableOpacity style={styles.menuItem}>
        <Ionicons name="person-outline" size={24} color="#333" />
        <Text style={styles.menuText}>Edit Profile</Text>
        <Ionicons name="chevron-forward" size={24} color="#666" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuItem}>
        <Ionicons name="settings-outline" size={24} color="#333" />
        <Text style={styles.menuText}>Settings</Text>
        <Ionicons name="chevron-forward" size={24} color="#666" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuItem}>
        <Ionicons name="help-circle-outline" size={24} color="#333" />
        <Text style={styles.menuText}>Help & Support</Text>
        <Ionicons name="chevron-forward" size={24} color="#666" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={24} color="#fff" />
        <Text style={styles.logoutButtonText}>Log Out</Text>
      </TouchableOpacity>
    </>
  ) : (
    <TouchableOpacity
      style={styles.logoutButton}
      onPress={() => router.replace('/(auth)/login')}>
      <Ionicons name="log-in-outline" size={24} color="#fff" />
      <Text style={styles.logoutButtonText}>Log In</Text>
    </TouchableOpacity>
  )}
</View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  header: {
    backgroundColor: '#4CAF50',
    paddingTop: 15,
    paddingBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    elevation: 5,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 40,
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImageContainer: {
    backgroundColor: '#fff',
    borderRadius: 100,
    padding: 10,
    marginBottom: 20,
    elevation: 5,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: '#4CAF50',
    marginBottom: 4,
  },
  occupation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  menuContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 24,
    borderRadius: 8,
    paddingBottom: 20,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  menuText: {
    fontSize: 16,
    color: '#333',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF5722',
    paddingVertical: 14,
    marginTop: 20,
    marginBottom: 16,
    borderRadius: 8,
    justifyContent: 'center',
    marginHorizontal: 24,
    elevation: 5,
  },
  logoutButtonText: {
    fontSize: 16,
    color: '#fff',
    marginLeft: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#4CAF50',
    marginTop: 8,
  },
});
