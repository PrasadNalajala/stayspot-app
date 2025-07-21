import { getConversations } from '@/services/api';
import { getUserDetails } from '@/services/auth';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Helper to format message date/time
function formatMessageDateTime(dateString: string) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (isToday) return time;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ', ' + time;
}

export default function MessagesScreen() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [myId, setMyId] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    getUserDetails().then(user => setMyId(user.id)).catch(() => setMyId(null));
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const data = await getConversations();
      setConversations(data);
      setError(null);
    } catch (err) {
      setError('Failed to load conversations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderConversation = ({ item }: { item: any }) => {
    // Determine receiver name based on current user
    let receiverName = '';
    if (myId) {
      if (item.owner_id === myId) receiverName = item.user_name;
      else receiverName = item.owner_name;
    }
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push({ pathname: '/messages/[id]', params: { id: String(item.id), receiverName } })}
      >
        <Image source={{ uri: item.rental_imageUrl }} style={styles.image} />
        <View style={styles.cardContent}>
          <Text style={styles.title} numberOfLines={1}>{item.rental_title}</Text>
          <Text style={styles.location} numberOfLines={1}>{item.rental_location}</Text>
          <Text style={styles.userName} numberOfLines={1}>{receiverName}</Text>
          <Text style={styles.lastMessage} numberOfLines={2}>{item.last_message || 'No messages yet.'}</Text>
          <Text style={styles.lastMessageTime}>{item.last_message_time ? formatMessageDateTime(item.last_message_time) : ''}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Text style={styles.header}>Messages</Text>
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={loadConversations} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : conversations.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No conversations yet.</Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderConversation}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          refreshing={loading}
          onRefresh={loadConversations}
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    padding: 8,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#eee',
  },
  cardContent: { flex: 1 },
  title: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  location: { fontSize: 13, color: '#666' },
  userName: { fontSize: 13, color: '#1976D2', marginTop: 2 },
  lastMessage: { fontSize: 14, color: '#444', marginTop: 4 },
  lastMessageTime: { fontSize: 12, color: '#888', marginTop: 2 },
  chevron: { marginLeft: 8 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: '#D32F2F', fontSize: 16, marginBottom: 12 },
  retryButton: { backgroundColor: '#4CAF50', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  retryText: { color: '#fff', fontWeight: 'bold' },
  emptyText: { color: '#666', fontSize: 16 },
}); 