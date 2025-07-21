import { fetchRentalById, getMessages, sendMessage } from '@/services/api';
import { getUserDetails } from '@/services/auth';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Image, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

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

export default function ChatScreen() {
  const { id, receiverName } = useLocalSearchParams<{ id: string, receiverName?: string }>();
  const router = useRouter();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [property, setProperty] = useState<any>(null);
  const [myId, setMyId] = useState<number | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    getUserDetails().then(user => setMyId(user.id)).catch(() => setMyId(null));
  }, []);

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 10000);
    return () => clearInterval(interval);
  }, [id, myId]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const data = await getMessages(Number(id));
      // Mark messages as mine if sender_id === myId
      const marked = data.map((msg: any) => ({ ...msg, isMine: myId && msg.sender_id === myId }));
      setMessages(marked);
      setError(null);
      if (marked.length > 0 && flatListRef.current) {
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
      }
      if (marked.length > 0) {
        console.log('First message object:', marked[0]);
      }
    } catch (err) {
      setError('Failed to load messages.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        if (messages.length > 0 && messages[0].rental_id) {
          const data = await fetchRentalById(messages[0].rental_id);
          setProperty(data);
        }
      } catch {}
    };
    fetchProperty();
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    try {
      setSending(true);
      await sendMessage(Number(id), newMessage.trim());
      setNewMessage('');
      loadMessages();
    } catch (err) {
      alert('Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }: { item: any }) => (
    <View style={[styles.messageItem, item.isMine ? styles.myMessage : styles.otherMessage]}>
      <Text style={styles.messageText}>{item.content}</Text>
      <Text style={styles.messageTime}>{item.timestamp ? formatMessageDateTime(item.timestamp) : ''}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView style={styles.bg} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.stickyHeader}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.header}>{receiverName || 'Chat'}</Text>
        </View>
        {property && (
          <View style={styles.propertyCard}>
            {property.imageUrl && (
              <View style={styles.propertyImageWrap}>
                <Image source={{ uri: property.imageUrl }} style={styles.propertyImage} />
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.propertyTitle}>{property.title}</Text>
              <Text style={styles.propertyLocation}>{property.location}</Text>
            </View>
          </View>
        )}
      </View>
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(_, idx) => String(idx)}
          contentContainerStyle={styles.list}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
      )}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={newMessage}
          onChangeText={setNewMessage}
          editable={!sending}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend} disabled={sending || !newMessage.trim()}>
          <Ionicons name="send" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#f6f8fa' },
  stickyHeader: { backgroundColor: '#fff', zIndex: 2, elevation: 2, paddingBottom: 4 },
  headerRow: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderBottomWidth: 0, borderColor: '#eee' },
  backButton: { backgroundColor: '#fff', borderRadius: 20, padding: 4, marginRight: 8, elevation: 1 },
  header: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  propertyCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, marginHorizontal: 16, marginBottom: 8, padding: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  propertyImageWrap: { width: 48, height: 48, borderRadius: 8, overflow: 'hidden', marginRight: 12, backgroundColor: '#eee' },
  propertyImage: { width: 48, height: 48, borderRadius: 8 },
  propertyTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  propertyLocation: { fontSize: 13, color: '#666' },
  list: { padding: 16, paddingBottom: 8 },
  messageItem: { maxWidth: '80%', marginBottom: 16, borderRadius: 18, padding: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  myMessage: { alignSelf: 'flex-end', backgroundColor: '#4CAF50' },
  otherMessage: { alignSelf: 'flex-start', backgroundColor: '#fff' },
  messageText: { fontSize: 15, color: '#222' },
  messageTime: { fontSize: 11, color: '#888', marginTop: 2, alignSelf: 'flex-end' },
  inputRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderTopWidth: 1, borderColor: '#eee', backgroundColor: '#fff', borderRadius: 24, margin: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  input: { flex: 1, borderWidth: 0, borderRadius: 20, padding: 12, fontSize: 15, backgroundColor: '#f6f8fa', marginRight: 8 },
  sendButton: { backgroundColor: '#4CAF50', borderRadius: 20, padding: 10 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: '#D32F2F', fontSize: 16 },
}); 