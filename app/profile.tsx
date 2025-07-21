import { useAuth } from '@/contexts/AuthContext';
import { getFavourites, updateProfile } from '@/services/api';
import { getUserDetails, logout, User } from '@/services/auth';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const router = useRouter();
  const { setAuthenticated } = useAuth(); 
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [favourites, setFavourites] = useState<any[]>([]);
  const [favouritesLoading, setFavouritesLoading] = useState(true);
  const [favouritesError, setFavouritesError] = useState<string | null>(null);
  const [showFavourites, setShowFavourites] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editProfileData, setEditProfileData] = useState<any>(null);
  const [editProfileLoading, setEditProfileLoading] = useState(false);
  const [editProfileError, setEditProfileError] = useState<string | null>(null);

  useEffect(() => {
    loadUserDetails();
    loadFavourites();
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

  const loadFavourites = async () => {
    try {
      setFavouritesLoading(true);
      const data = await getFavourites();
      setFavourites(data);
      setFavouritesError(null);
    } catch (err) {
      console.log('Favourites error:', err);
      setFavouritesError('Failed to load favourites.');
    } finally {
      setFavouritesLoading(false);
    }
  };

  const handleLogout = async () => {
  try {
    await logout();  
    setAuthenticated(false);  
  } catch (error) {
    Alert.alert('Error', 'Logout failed. Please try again.');
  }
};

  const openEditProfile = () => {
    if (!user) return;
    setEditProfileData({
      name: user.name || '',
      location: user.location || '',
      occupation: user.occupation || '',
      bio: user.bio || '',
      profile_url: user.profile_url || '',
    });
    setShowEditProfile(true);
  };

  const handleEditProfileChange = (field: string, value: string) => {
    setEditProfileData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleEditProfileSubmit = async () => {
    if (!editProfileData) return;
    setEditProfileLoading(true);
    setEditProfileError(null);
    try {
      await updateProfile(editProfileData);
      setShowEditProfile(false);
      loadUserDetails();
    } catch (err) {
      setEditProfileError('Failed to update profile.');
    } finally {
      setEditProfileLoading(false);
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
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }} contentContainerStyle={{ padding: 0 }}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <View style={[styles.content, { paddingHorizontal: 0 }]}> {/* Remove horizontal padding */}
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

     <View style={[styles.menuContainer, { marginHorizontal: 0 }]}> {/* Remove horizontal margin */}
  {user ? (
    <>
      <TouchableOpacity style={styles.menuItem} onPress={openEditProfile}>
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

      <TouchableOpacity style={styles.favButton} onPress={() => setShowFavourites(true)}>
        <Text style={styles.favButtonText}>View Favourites</Text>
      </TouchableOpacity>
      <Modal
        visible={showFavourites}
        animationType="slide"
        onRequestClose={() => setShowFavourites(false)}
        transparent={false}
      >
        <View style={styles.modalHeader}>
          <Text style={styles.sectionHeader}>Favourites</Text>
          <TouchableOpacity onPress={() => setShowFavourites(false)} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
        {favouritesLoading ? (
          <ActivityIndicator size="large" color="#4CAF50" style={{ marginVertical: 16 }} />
        ) : favouritesError ? (
          <Text style={styles.errorText}>{favouritesError}</Text>
        ) : favourites.length === 0 ? (
          <Text style={styles.emptyText}>No favourites yet.</Text>
        ) : (
          <FlatList
            data={favourites}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.favCard} onPress={() => { setShowFavourites(false); router.push({ pathname: '/property/[id]', params: { id: String(item.id) } }); }}>
                <Image source={{ uri: item.imageUrl }} style={styles.favImage} />
                <View style={styles.favContent}>
                  <Text style={styles.favTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.favLocation} numberOfLines={1}>{item.location}</Text>
                </View>
              </TouchableOpacity>
            )}
            keyExtractor={item => String(item.id)}
            contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          />
        )}
      </Modal>
      <Modal
        visible={showEditProfile}
        animationType="slide"
        onRequestClose={() => setShowEditProfile(false)}
        transparent={false}
      >
        <View style={styles.modalHeader}>
          <Text style={styles.sectionHeader}>Edit Profile</Text>
          <TouchableOpacity onPress={() => setShowEditProfile(false)} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
        {editProfileError && <Text style={styles.errorText}>{editProfileError}</Text>}
        <ScrollView contentContainerStyle={{ padding: 24 }}>
          <Text style={styles.inputLabel}>Name</Text>
          <TextInput
            style={styles.input}
            value={editProfileData?.name}
            onChangeText={v => handleEditProfileChange('name', v)}
            placeholder="Name"
          />
          <Text style={styles.inputLabel}>Location</Text>
          <TextInput
            style={styles.input}
            value={editProfileData?.location}
            onChangeText={v => handleEditProfileChange('location', v)}
            placeholder="Location"
          />
          <Text style={styles.inputLabel}>Occupation</Text>
          <TextInput
            style={styles.input}
            value={editProfileData?.occupation}
            onChangeText={v => handleEditProfileChange('occupation', v)}
            placeholder="Occupation"
          />
          <Text style={styles.inputLabel}>Bio</Text>
          <TextInput
            style={[styles.input, { height: 80 }]}
            value={editProfileData?.bio}
            onChangeText={v => handleEditProfileChange('bio', v)}
            placeholder="Bio"
            multiline
          />
          <Text style={styles.inputLabel}>Profile Image URL</Text>
          <TextInput
            style={styles.input}
            value={editProfileData?.profile_url}
            onChangeText={v => handleEditProfileChange('profile_url', v)}
            placeholder="Profile Image URL"
          />
          <TouchableOpacity style={styles.saveButton} onPress={handleEditProfileSubmit} disabled={editProfileLoading}>
            <Text style={styles.saveButtonText}>{editProfileLoading ? 'Saving...' : 'Save Changes'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>
    </ScrollView>
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
  sectionHeader: { fontSize: 20, fontWeight: 'bold', marginTop: 24, marginBottom: 12, color: '#333' },
  favButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 8,
  },
  favButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#fff' },
  closeButton: { padding: 8, borderRadius: 8, backgroundColor: '#eee' },
  closeButtonText: { color: '#333', fontWeight: 'bold' },
  favCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    padding: 8,
  },
  favImage: { width: 60, height: 60, borderRadius: 8, marginRight: 12, backgroundColor: '#eee' },
  favContent: { flex: 1 },
  favTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  favLocation: { fontSize: 13, color: '#666' },
  errorText: { color: '#D32F2F', fontSize: 16, marginVertical: 8 },
  emptyText: { color: '#999', fontSize: 15, marginVertical: 8 },
  inputLabel: { fontWeight: 'bold', marginBottom: 6, color: '#333', marginTop: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 4,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
