import { fetchRentals, Rental } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const router = useRouter();
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRentals();
  }, []);

  const loadRentals = async () => {
    try {
      const data = await fetchRentals();
      setRentals(data.slice(0, 3)); // Limit to 3 recommended
    } catch (err) {
      console.error('Error loading rentals:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderPropertyCard = ({ item }: { item: Rental }) => (
    <TouchableOpacity
      style={styles.propertyCard}
      onPress={() =>
        router.push({
          pathname: '/property/[id]',
          params: { id: String(item.id) },
        })
      }
    >
      <Image
        source={{ uri: item.imageUrl }}
        style={styles.propertyImage}
        resizeMode="cover"
      />
      <View style={styles.propertyInfo}>
        <Text style={styles.propertyTitle}>{item.title}</Text>
        <Text style={styles.propertyLocation}>{item.location}</Text>
        <View style={styles.propertyDetails}>
          <Text style={styles.propertyPrice}>{item.price}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="bed-outline" size={16} color="#666" />
            <Text style={styles.rating}>{item.bedrooms} Beds</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.content}>
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Find Your Perfect Stay</Text>
          <Text style={styles.heroSubtitle}>
            Browse curated rentals or list your own.
          </Text>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => router.push('/post')}
          >
            <Text style={styles.ctaButtonText}>List Your Property</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.featuredSection}>
          <Text style={styles.sectionTitle}>Recommended for You</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#4CAF50" />
          ) : (
            <FlatList
              data={rentals}
              renderItem={renderPropertyCard}
              keyExtractor={(item) => String(item.id)}
              scrollEnabled={false}
            />
          )}
        </View>
        <View style={styles.quickLinksSection}>
          <Text style={styles.sectionTitle}>Explore More</Text>
          <View style={styles.quickLinks}>
            <TouchableOpacity style={styles.quickCard}>
              <Ionicons name="location-outline" size={28} color="#4CAF50" />
              <Text style={styles.quickTitle}>Nearby</Text>
              <Text style={styles.quickText}>
                Rentals close to your current location.
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickCard}>
              <Ionicons name="flame-outline" size={28} color="#FF5722" />
              <Text style={styles.quickTitle}>Popular</Text>
              <Text style={styles.quickText}>
                See trending and top-rated properties.
              </Text>
            </TouchableOpacity>
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
  content: {
    flex: 1,
  },

  // Hero
  heroSection: {
    padding: 24,
    backgroundColor: '#f8f8f8',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  ctaButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  ctaButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Section Title
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },

  // Rentals
  featuredSection: {
    padding: 16,
  },
  propertyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  propertyImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  propertyInfo: {
    padding: 16,
  },
  propertyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  propertyLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  propertyDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  propertyPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },

  // Quick Links
  quickLinksSection: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    marginBottom:20,
  },
  quickLinks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quickTitle: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  quickText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});
