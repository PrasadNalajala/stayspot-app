import { fetchRentalById, RentalDetails, updateRental, uploadImageToCloudinary } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function EditListingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<any>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (id) loadRental();
  }, [id]);

  const loadRental = async () => {
    try {
      setLoading(true);
      const data: RentalDetails = await fetchRentalById(Number(id));
      setForm({
        title: data.title,
        location: data.location,
        price: data.price.replace(/[^\d.]/g, ''),
        bedrooms: String(data.bedrooms),
        bathrooms: String(data.bathrooms),
        size: data.size,
        description: data.description || '',
        availableFrom: data.availableFrom,
        amenities: data.amenities || {},
        contact: data.contact,
        imageUrl: data.imageUrl,
      });
      setError(null);
    } catch (err) {
      setError('Failed to load listing.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleAmenityChange = (amenity: string) => {
    setForm((prev: any) => ({
      ...prev,
      amenities: { ...prev.amenities, [amenity]: !prev.amenities?.[amenity] },
    }));
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 1,
    });
    if (!result.canceled) {
      const selectedImage = result.assets[0].uri;
      setImageUploading(true);
      try {
        const file = {
          uri: selectedImage,
          type: 'image/jpeg',
          name: 'rental-image.jpg',
        };
        const uploadedImageUrl = await uploadImageToCloudinary(file);
        setForm((prev: any) => ({ ...prev, imageUrl: uploadedImageUrl }));
      } catch (error) {
        Alert.alert('Error', 'Failed to upload image. Please try again.');
      } finally {
        setImageUploading(false);
      }
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      console.log('Submitting updateRental with:', form);
      await updateRental(Number(id), form);
      Alert.alert('Success', 'Listing updated successfully!', [
        { text: 'OK', onPress: () => router.replace('/(tabs)/my-listings') },
      ]);
    } catch (err) {
      console.log('Update rental error:', err);
      Alert.alert('Error', 'Failed to update listing.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !form) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={loadRental} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.customBackButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.header}>Edit Listing</Text>
      </View>
      {/* Image Preview and Edit */}
      <View style={styles.imageSection}>
        {form.imageUrl ? (
          <Image source={{ uri: form.imageUrl }} style={styles.imagePreview} />
        ) : null}
        <TouchableOpacity style={styles.imageButton} onPress={pickImage} disabled={imageUploading}>
          <Ionicons name="image-outline" size={20} color="#4CAF50" />
          <Text style={styles.imageButtonText}>{imageUploading ? 'Uploading...' : 'Change Image'}</Text>
        </TouchableOpacity>
      </View>
      <TextInput
        style={styles.input}
        placeholder="Title"
        value={form.title}
        onChangeText={(v) => handleChange('title', v)}
      />
      <TextInput
        style={styles.input}
        placeholder="Location"
        value={form.location}
        onChangeText={(v) => handleChange('location', v)}
      />
      <TextInput
        style={styles.input}
        placeholder="Price"
        value={form.price}
        keyboardType="numeric"
        onChangeText={(v) => handleChange('price', v)}
      />
      <TextInput
        style={styles.input}
        placeholder="Bedrooms"
        value={form.bedrooms}
        keyboardType="numeric"
        onChangeText={(v) => handleChange('bedrooms', v)}
      />
      <TextInput
        style={styles.input}
        placeholder="Bathrooms"
        value={form.bathrooms}
        keyboardType="numeric"
        onChangeText={(v) => handleChange('bathrooms', v)}
      />
      <TextInput
        style={styles.input}
        placeholder="Size"
        value={form.size}
        onChangeText={(v) => handleChange('size', v)}
      />
      <TextInput
        style={[styles.input, { height: 80 }]}
        placeholder="Description"
        value={form.description}
        multiline
        onChangeText={(v) => handleChange('description', v)}
      />
      <TouchableOpacity
        style={styles.input}
        onPress={() => setShowDatePicker(true)}
        activeOpacity={0.8}
      >
        <Text style={{ color: form.availableFrom ? '#333' : '#aaa', fontSize: 16 }}>
          {form.availableFrom ? `Available From: ${form.availableFrom}` : 'Available From'}
        </Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={form.availableFrom ? new Date(form.availableFrom) : new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              const iso = selectedDate.toISOString().split('T')[0];
              handleChange('availableFrom', iso);
            }
          }}
        />
      )}
      <Text style={styles.label}>Amenities:</Text>
      <View style={styles.amenitiesRow}>
        {['WiFi', 'Parking', 'Gym', 'Pool', 'Garden'].map((amenity) => (
          <TouchableOpacity
            key={amenity}
            style={[styles.amenityButton, form.amenities?.[amenity] && styles.amenitySelected]}
            onPress={() => handleAmenityChange(amenity)}
          >
            <Text style={{ color: form.amenities?.[amenity] ? '#fff' : '#333' }}>{amenity}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.label}>Contact Info:</Text>
      <TextInput
        style={styles.input}
        placeholder="Contact Name"
        value={form.contact.name}
        onChangeText={(v) => setForm((prev: any) => ({ ...prev, contact: { ...prev.contact, name: v } }))}
      />
      <TextInput
        style={styles.input}
        placeholder="Contact Phone"
        value={form.contact.phone}
        onChangeText={(v) => setForm((prev: any) => ({ ...prev, contact: { ...prev.contact, phone: v } }))}
      />
      <TextInput
        style={styles.input}
        placeholder="Contact Email"
        value={form.contact.email}
        onChangeText={(v) => setForm((prev: any) => ({ ...prev, contact: { ...prev.contact, email: v } }))}
      />
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={submitting}>
        <Text style={styles.submitText}>{submitting ? 'Saving...' : 'Save Changes'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff', flexGrow: 1 },
  header: { fontSize: 24, fontWeight: 'bold', color: '#333', textAlign: 'center' },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  customBackButton: { backgroundColor: '#fff', borderRadius: 20, padding: 4, marginRight: 8, elevation: 1 },
  imageSection: { alignItems: 'center', marginBottom: 16 },
  imagePreview: { width: 220, height: 120, borderRadius: 12, marginBottom: 8, backgroundColor: '#eee' },
  imageButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f6f6f6', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  imageButtonText: { color: '#4CAF50', fontWeight: 'bold', marginLeft: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 14,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  label: { fontWeight: 'bold', marginBottom: 6, color: '#333' },
  amenitiesRow: { flexDirection: 'row', marginBottom: 14, flexWrap: 'wrap' },
  amenityButton: {
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  amenitySelected: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  submitButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  submitText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: '#D32F2F', fontSize: 16, marginBottom: 12 },
  retryButton: { backgroundColor: '#4CAF50', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  retryText: { color: '#fff', fontWeight: 'bold' },
}); 