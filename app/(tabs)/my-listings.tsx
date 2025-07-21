import { deleteRental, fetchOwnRentals, Rental } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MyListingsScreen() {
  const [listings, setListings] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    try {
      setLoading(true);
      const data = await fetchOwnRentals();
      setListings(data);
      setError(null);
    } catch (err) {
      setError('Failed to load your listings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    Alert.alert('Delete Listing', 'Are you sure you want to delete this listing?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteRental(id);
            loadListings();
          } catch (err) {
            Alert.alert('Error', 'Failed to delete listing.');
          }
        },
      },
    ]);
  };

  const renderListing = ({ item }: { item: Rental }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.imageUrl }} style={styles.image} />
      <View style={styles.cardContent}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.location}>{item.location}</Text>
        <Text style={styles.price}>{item.price}</Text>
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => router.push({ pathname: '/property/edit/[id]', params: { id: String(item.id) } })}
          >
            <Ionicons name="create-outline" size={20} color="#1976D2" />
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.id)}>
            <Ionicons name="trash-outline" size={20} color="#D32F2F" />
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Text style={styles.header}>My Listings</Text>
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={loadListings} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : listings.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>You have no listings yet.</Text>
        </View>
      ) : (
        <FlatList
          data={listings}
          renderItem={renderListing}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          refreshing={loading}
          onRefresh={loadListings}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { fontSize: 24, fontWeight: 'bold', margin: 16, color: '#333' },
  list: { padding: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 180,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  cardContent: { padding: 16 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  location: { fontSize: 14, color: '#666', marginBottom: 8 },
  price: { fontSize: 16, fontWeight: 'bold', color: '#4CAF50', marginBottom: 8 },
  actions: { flexDirection: 'row', marginTop: 8 },
  editButton: { flexDirection: 'row', alignItems: 'center', marginRight: 24 },
  editText: { color: '#1976D2', marginLeft: 4, fontWeight: 'bold' },
  deleteButton: { flexDirection: 'row', alignItems: 'center' },
  deleteText: { color: '#D32F2F', marginLeft: 4, fontWeight: 'bold' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: '#D32F2F', fontSize: 16, marginBottom: 12 },
  retryButton: { backgroundColor: '#4CAF50', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  retryText: { color: '#fff', fontWeight: 'bold' },
  emptyText: { color: '#666', fontSize: 16 },
}); 