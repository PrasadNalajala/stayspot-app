import { fetchRentalById, Rental } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PropertyDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [property, setProperty] = useState<Rental | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProperty();
  }, [id]);

  const loadProperty = async () => {
    try {
      setLoading(true);
      const data = await fetchRentalById(Number(id));
      setProperty(data);
      setError(null);
    } catch (err) {
      setError('Failed to load property details. Please try again.');
      console.error('Error loading property:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading property details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !property) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || 'Property not found'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadProperty}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        
        <Image source={{ uri: property.imageUrl }} style={styles.image} />
        
        <View style={styles.content}>
          <Text style={styles.title}>{property.title}</Text>
          <Text style={styles.location}>{property.location}</Text>
          
          <View style={styles.priceContainer}>
            <Text style={styles.price}>{property.price}</Text>
            <Text style={styles.availableFrom}>
              Available from: {new Date(property.availableFrom).toLocaleDateString()}
            </Text>
          </View>

          <View style={styles.details}>
            <View style={styles.detailItem}>
              <Ionicons name="bed-outline" size={24} color="#666" />
              <Text style={styles.detailText}>{property.bedrooms} Beds</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="water-outline" size={24} color="#666" />
              <Text style={styles.detailText}>{property.bathrooms} Baths</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="square-outline" size={24} color="#666" />
              <Text style={styles.detailText}>{property.size}</Text>
            </View>
          </View>

          {property.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{property.description}</Text>
            </View>
          )}

          {property.amenities && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Amenities</Text>
              <View style={styles.amenities}>
                {property.amenities.WiFi && (
                  <View style={styles.amenity}>
                    <Ionicons name="wifi-outline" size={24} color="#4CAF50" />
                    <Text style={styles.amenityText}>WiFi</Text>
                  </View>
                )}
                {property.amenities.Parking && (
                  <View style={styles.amenity}>
                    <Ionicons name="car-outline" size={24} color="#4CAF50" />
                    <Text style={styles.amenityText}>Parking</Text>
                  </View>
                )}
                {property.amenities.Gym && (
                  <View style={styles.amenity}>
                    <Ionicons name="barbell-outline" size={24} color="#4CAF50" />
                    <Text style={styles.amenityText}>Gym</Text>
                  </View>
                )}
                {property.amenities.Pool && (
                  <View style={styles.amenity}>
                    <Ionicons name="water-outline" size={24} color="#4CAF50" />
                    <Text style={styles.amenityText}>Pool</Text>
                  </View>
                )}
                {property.amenities.Garden && (
                  <View style={styles.amenity}>
                    <Ionicons name="leaf-outline" size={24} color="#4CAF50" />
                    <Text style={styles.amenityText}>Garden</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>{property.contact.name}</Text>
              <Text style={styles.contactDetail}>{property.contact.phone}</Text>
              {property.contact.email && (
                <Text style={styles.contactDetail}>{property.contact.email}</Text>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 8,
  },
  image: {
    width: '100%',
    height: 300,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  location: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  priceContainer: {
    marginBottom: 16,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  availableFrom: {
    fontSize: 14,
    color: '#666',
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  detailItem: {
    alignItems: 'center',
  },
  detailText: {
    marginTop: 4,
    fontSize: 14,
    color: '#666',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  amenities: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  amenity: {
    alignItems: 'center',
    width: '30%',
  },
  amenityText: {
    marginTop: 4,
    fontSize: 14,
    color: '#666',
  },
  contactInfo: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
  },
  contactName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  contactDetail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
}); 