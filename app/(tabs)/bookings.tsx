import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Booking {
  id: string;
  propertyName: string;
  checkIn: string;
  checkOut: string;
  status: 'upcoming' | 'completed' | 'cancelled';
}

export default function BookingsScreen() {
  const bookings: Booking[] = []; // Empty array for now

  const renderBookingItem = ({ item }: { item: Booking }) => (
    <View style={styles.bookingCard}>
      <Text style={styles.propertyName}>{item.propertyName}</Text>
      <View style={styles.bookingDetails}>
        <Text style={styles.dateText}>Check-in: {item.checkIn}</Text>
        <Text style={styles.dateText}>Check-out: {item.checkOut}</Text>
      </View>
      <View style={styles.statusContainer}>
        <Text style={[styles.statusText, { color: item.status === 'upcoming' ? '#4CAF50' : '#FFA000' }]}>
          {item.status}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {bookings.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={48} color="#666" />
            <Text style={styles.emptyStateText}>No bookings yet</Text>
            <Text style={styles.emptyStateSubtext}>Your bookings will appear here</Text>
          </View>
        ) : (
          <FlatList
            data={bookings}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderBookingItem}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
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
    padding: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  listContent: {
    padding: 16,
  },
  bookingCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  propertyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  bookingDetails: {
    marginTop: 8,
  },
  dateText: {
    fontSize: 16,
    color: '#666',
  },
  statusContainer: {
    marginTop: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 4,
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 