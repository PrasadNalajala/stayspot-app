import { fetchRentalById, getMessages, sendMessage } from '@/services/api';
import { getUserDetails } from '@/services/auth';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

function formatMessageDateTime(dateString: string) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDateHeader(dateString: string) {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isToday = date.toDateString() === today.toDateString();
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) return 'Today';
  if (isYesterday) return 'Yesterday';
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
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
    loadMessages(); // Initial load
    const interval = setInterval(loadMessages, 10000); // Poll every 10 sec
    return () => clearInterval(interval);
  }, [id, myId]);

  const loadMessages = async () => {
    try {
      const data = await getMessages(Number(id));

      let grouped: any[] = [];
      let lastDate = '';

      data.forEach((msg: any) => {
        const msgDate = formatDateHeader(msg.timestamp);
        if (msgDate !== lastDate) {
          grouped.push({ type: 'date', label: msgDate });
          lastDate = msgDate;
        }
        grouped.push({
          ...msg,
          type: 'message',
          isMine: myId && msg.sender_id === myId
        });
      });

      const lastOld = messages[messages.length - 1];
      const lastNew = grouped[grouped.length - 1];
      const hasNewMessage = !lastOld || !lastNew || lastOld.id !== lastNew.id;

      if (hasNewMessage) {
        setMessages(grouped);
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
      }

      setError(null);
    } catch (err) {
      setError('Failed to load messages.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const rentalId = messages.find((m) => m.rental_id)?.rental_id;
        if (rentalId) {
          const data = await fetchRentalById(rentalId);
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

  const renderMessage = ({ item }: { item: any }) => {
    if (item.type === 'date') {
      return (
        <View style={styles.dateSeparator}>
          <Text style={styles.dateText}>{item.label}</Text>
        </View>
      );
    }

    return (
      <View style={[styles.messageItem, item.isMine ? styles.myMessage : styles.otherMessage]}>
        <Text style={[styles.messageText, item.isMine && { color: '#fff' }]}>{item.content}</Text>
        <View style={styles.messageMeta}>
          <Text style={[styles.messageTime, item.isMine && styles.messageTimeWhite]}>
            {item.timestamp ? formatMessageDateTime(item.timestamp) : ''}
          </Text>
          {item.isMine && (
  <View style={styles.tickWrapper}>
    <MaterialCommunityIcons
      name="check-all"
      size={16}
      color={item.is_read === 1 ? '#34B7F1' : '#ccc'} 
    />
  </View>
)}

        </View>
      </View>
    );
  };

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
          keyExtractor={(item, index) => item.type === 'date' ? `date-${index}` : `msg-${item.id}`}
          contentContainerStyle={styles.list}
          initialNumToRender={10}
          removeClippedSubviews={true}
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
  headerRow: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#fff' },
  backButton: { backgroundColor: '#fff', borderRadius: 20, padding: 4, marginRight: 8, elevation: 1 },
  header: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  propertyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2
  },
  propertyImageWrap: { width: 48, height: 48, borderRadius: 8, overflow: 'hidden', marginRight: 12, backgroundColor: '#eee' },
  propertyImage: { width: 48, height: 48, borderRadius: 8 },
  propertyTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  propertyLocation: { fontSize: 13, color: '#666' },
  list: { padding: 16, paddingBottom: 8 },
  messageItem: {
    maxWidth: '80%',
    marginBottom: 16,
    borderRadius: 18,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2
  },
  myMessage: { alignSelf: 'flex-end', backgroundColor: '#4CAF50' },
  otherMessage: { alignSelf: 'flex-start', backgroundColor: '#fff' },
  messageText: { fontSize: 15, color: '#222' },
  messageMeta: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 4
  },
  messageTime: { fontSize: 11, color: '#888', marginRight: 4 },
  messageTimeWhite: { color: '#eee' },
  tickWrapper: { flexDirection: 'row', alignItems: 'center' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
    borderRadius: 24,
    margin: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2
  },
  input: {
    flex: 1,
    borderWidth: 0,
    borderRadius: 20,
    padding: 12,
    fontSize: 15,
    backgroundColor: '#f6f8fa',
    marginRight: 8
  },
  sendButton: { backgroundColor: '#4CAF50', borderRadius: 20, padding: 10 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: '#D32F2F', fontSize: 16 },
  dateSeparator: {
    alignSelf: 'center',
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12
  },
  dateText: {
    fontSize: 12,
    color: '#444'
  }
});
