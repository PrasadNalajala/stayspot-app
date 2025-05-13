import { fetchRentals, Rental } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ExploreScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRentals();
  }, []);

  const loadRentals = async () => {
    try {
      setLoading(true);
      const data = await fetchRentals();
      setRentals(data);
      setError(null);
    } catch (err) {
      setError('Failed to load rentals. Please try again.');
      console.error('Error loading rentals:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredRentals = rentals.filter(
    (rental) =>
      rental.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rental.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderPropertyCard = ({ item }: { item: Rental }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push({
        pathname: "/property/[id]",
        params: { id: String(item.id) }
      })}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.image} />
      <View style={styles.cardContent}>
        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.location} numberOfLines={1}>
          {item.location}
        </Text>
        <View style={styles.details}>
          <View style={styles.detailItem}>
            <Ionicons name="bed-outline" size={16} color="#666" />
            <Text style={styles.detailText}>{item.bedrooms} Beds</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="water-outline" size={16} color="#666" />
            <Text style={styles.detailText}>{item.bathrooms} Baths</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="square-outline" size={16} color="#666" />
            <Text style={styles.detailText}>{item.size}</Text>
          </View>
        </View>
        <View style={styles.amenities}>
          {item.amenities?.WiFi && (
            <View style={styles.amenity}>
              <Ionicons name="wifi-outline" size={16} color="#4CAF50" />
            </View>
          )}
          {item.amenities?.Parking && (
            <View style={styles.amenity}>
              <Ionicons name="car-outline" size={16} color="#4CAF50" />
            </View>
          )}
          {item.amenities?.Gym && (
            <View style={styles.amenity}>
              <Ionicons name="barbell-outline" size={16} color="#4CAF50" />
            </View>
          )}
          {item.amenities?.Pool && (
            <View style={styles.amenity}>
              <Ionicons name="water-outline" size={16} color="#4CAF50" />
            </View>
          )}
        </View>
        <Text style={styles.price}>{item.price}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search properties..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading properties...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadRentals}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredRentals}
          renderItem={renderPropertyCard}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          onRefresh={loadRentals}
          refreshing={loading}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    borderBottomWidth: 0,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#333',
  },
  list: {
    padding: 16,
  },
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
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  cardContent: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  location: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  details: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  detailText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
  amenities: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  amenity: {
    marginRight: 12,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
