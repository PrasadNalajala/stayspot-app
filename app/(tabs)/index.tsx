import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  rating: number;
  image: string;
}

const featuredProperties: Property[] = [
  {
    id: '1',
    title: 'Luxury Villa',
    location: 'Bali, Indonesia',
    price: 299,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227',
  },
  {
    id: '2',
    title: 'Beach House',
    location: 'Maldives',
    price: 199,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4',
  },
];

const categories = [
  { id: '1', name: 'Beach', icon: 'beach-outline' },
  { id: '2', name: 'Mountain', icon: 'mountain-outline' },
  { id: '3', name: 'City', icon: 'business-outline' },
  { id: '4', name: 'Countryside', icon: 'leaf-outline' },
];

export default function HomeScreen() {
  const router = useRouter();

  const renderPropertyCard = ({ item }: { item: Property }) => (
    <TouchableOpacity 
      style={styles.propertyCard}
      onPress={() => router.push({
        pathname: "/property/[id]",
        params: { id: String(item.id) }
      })}
    >
      <Image
        source={{ uri: item.image }}
        style={styles.propertyImage}
        resizeMode="cover"
      />
      <View style={styles.propertyInfo}>
        <Text style={styles.propertyTitle}>{item.title}</Text>
        <Text style={styles.propertyLocation}>{item.location}</Text>
        <View style={styles.propertyDetails}>
          <Text style={styles.propertyPrice}>${item.price}/night</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={styles.rating}>{item.rating}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <View style={styles.categoriesContainer}>
            {categories.map((category) => (
              <TouchableOpacity key={category.id} style={styles.categoryCard}>
                <Ionicons name={category.icon as any} size={32} color="#4CAF50" />
                <Text style={styles.categoryName}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.featuredSection}>
          <Text style={styles.sectionTitle}>Featured Properties</Text>
          <FlatList
            data={featuredProperties}
            renderItem={renderPropertyCard}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
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
    padding: 20,
  },
  categoriesSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  categoryCard: {
    width: '45%',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  categoryName: {
    marginTop: 8,
    fontSize: 14,
    color: '#333',
  },
  propertyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
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
    padding: 12,
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
  },
  featuredSection: {
    padding: 20,
  },
});