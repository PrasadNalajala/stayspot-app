import { useAuth } from '@/contexts/AuthContext';
import { fetchComments, fetchRentalById, postComment, Rental } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image, Image as RNImage, ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Helper to format date as 'x hours ago', 'Yesterday', or 'MMM dd, yyyy'
function formatCommentDate(dateString: string) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay === 0) {
    if (diffHr > 0) return `${diffHr} hour${diffHr > 1 ? 's' : ''} ago`;
    if (diffMin > 0) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    return 'Just now';
  } else if (diffDay === 1) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }
}

export default function PropertyDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [property, setProperty] = useState<Rental | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentsError, setCommentsError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [posting, setPosting] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    loadProperty();
    loadComments();
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

  const loadComments = async () => {
    try {
      setCommentsLoading(true);
      const data = await fetchComments(Number(id));
      setComments(data);
      setCommentsError(null);
    } catch (err) {
      setCommentsError('Failed to load comments.');
    } finally {
      setCommentsLoading(false);
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    try {
      setPosting(true);
      await postComment(Number(id), newComment.trim());
      setNewComment('');
      loadComments();
    } catch (err) {
      alert('Failed to post comment.');
    } finally {
      setPosting(false);
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
         {/* Comments Section */}
         <View style={styles.section}>
           <Text style={styles.sectionTitle}>Comments</Text>
           {commentsLoading ? (
             <Text style={styles.commentLoading}>Loading comments...</Text>
           ) : commentsError ? (
             <Text style={styles.commentError}>{commentsError}</Text>
           ) : comments.length === 0 ? (
             <Text style={styles.commentEmpty}>No comments yet.</Text>
           ) : (
             comments.map((c, idx) => (
               <View key={idx} style={styles.commentItem}>
                 <View style={styles.commentHeaderRow}>
                   {c.profile_url ? (
                     <RNImage source={{ uri: c.profile_url }} style={styles.commentAvatar} />
                   ) : (
                     <View style={styles.commentAvatarDummy}>
                       {c.name ? (
                         <Text style={styles.commentAvatarInitial}>{c.name[0].toUpperCase()}</Text>
                       ) : (
                         <Ionicons name="person" size={20} color="#fff" />
                       )}
                     </View>
                   )}
                   <View style={{ flex: 1 }}>
                     <Text style={styles.commentUser}>{c.name || 'User'}</Text>
                     <Text style={styles.commentDate}>{formatCommentDate(c.created_at)}</Text>
                   </View>
                 </View>
                 <Text style={styles.commentText}>{c.comment}</Text>
               </View>
             ))
           )}
           {isAuthenticated && (
             <View style={styles.commentInputRow}>
               <TextInput
                 style={styles.commentInput}
                 placeholder="Add a comment..."
                 value={newComment}
                 onChangeText={setNewComment}
                 editable={!posting}
               />
               <TouchableOpacity style={styles.commentButton} onPress={handlePostComment} disabled={posting || !newComment.trim()}>
                 <Text style={styles.commentButtonText}>{posting ? 'Posting...' : 'Post'}</Text>
               </TouchableOpacity>
             </View>
           )}
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
  commentLoading: { color: '#666', fontSize: 14, marginBottom: 8 },
  commentError: { color: '#D32F2F', fontSize: 14, marginBottom: 8 },
  commentEmpty: { color: '#999', fontSize: 14, marginBottom: 8 },
  commentItem: { marginBottom: 12, backgroundColor: '#f7f7f7', borderRadius: 8, padding: 10 },
  commentHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  commentAvatar: { width: 32, height: 32, borderRadius: 16, marginRight: 10, backgroundColor: '#eee' },
  commentAvatarDummy: { width: 32, height: 32, borderRadius: 16, marginRight: 10, backgroundColor: '#bbb', alignItems: 'center', justifyContent: 'center' },
  commentAvatarInitial: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  commentUser: { fontWeight: 'bold', color: '#333', marginBottom: 2 },
  commentText: { color: '#333', fontSize: 15 },
  commentDate: { color: '#888', fontSize: 12, marginTop: 2 },
  commentInputRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  commentInput: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 8, fontSize: 15, backgroundColor: '#fff', marginRight: 8 },
  commentButton: { backgroundColor: '#4CAF50', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10 },
  commentButtonText: { color: '#fff', fontWeight: 'bold' },
}); 