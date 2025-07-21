import { getToken } from '@/services/auth';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';

const API_BASE_URL = 'https://stayspot.onrender.com';

export interface Rental {
  id: number;
  title: string;
  location: string;
  price: string;
  bedrooms: number;
  bathrooms: number;
  size: string;
  imageUrl: string;
  description: string | null;
  availableFrom: string;
  amenities: {
    Gym?: boolean;
    WiFi?: boolean;
    Parking?: boolean;
    Pool?: boolean;
    Garden?: boolean;
  } | null;
  status: string;
  contact: {
    name: string;
    phone: string;
    email: string;
  };
}

export interface RentalDetails extends Rental {
  created_at: string;
  updated_at: string;
  user_id: number;
  name: string;
  email: string;
  profile_url: string | null;
  phone_number: string | null;
  bio: string | null;
  occupation: string | null;
}

export interface RentalFormData {
  title: string;
  location: string;
  price: string;
  bedrooms: string;
  bathrooms: string;
  size: string;
  description: string;
  availableFrom: string;
  amenities: {
    Gym?: boolean;
    WiFi?: boolean;
    Parking?: boolean;
    Pool?: boolean;
    Garden?: boolean;
  };
  contact: {
    name: string;
    phone: string;
    email: string;
  };
  imageUrl:String;
}

export const fetchRentals = async (): Promise<Rental[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/rentals`);
    if (!response.ok) {
      throw new Error('Failed to fetch rentals');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching rentals:', error);
    throw error;
  }
};

export async function fetchRentalById(id: number): Promise<RentalDetails> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/rental-details`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ rental_id: id.toString() }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch rental details');
    }
    
    const data = await response.json();
    
    return {
      ...data,
      location: data.location || '',
      price: `₹${parseFloat(data.price).toLocaleString()}/month`,
      availableFrom: data.available_from,
      contact: {
        name: data.contact_name,
        phone: data.contact_phone,
        email: data.contact_email,
      },
    };
  } catch (error) {
    console.error('Error fetching rental details:', error);
    throw error;
  }
}

export const uploadImageToCloudinary = async (file: any): Promise<string> => {
  const formData = new FormData();
  formData.append('file', {
    uri: file.uri,
    type: file.type,
    name: file.name,
  } as any);

  formData.append('upload_preset', 'imageUrl');

  try {
    const cloudinaryResponse = await fetch('https://api.cloudinary.com/v1_1/dnd03w7us/image/upload', {
      method: 'POST',
      body: formData,
      headers: {
        Accept: 'application/json',
      },
    });

    const data = await cloudinaryResponse.json();

    if (!cloudinaryResponse.ok) {
      console.error('Upload failed:', data);
      throw new Error(data.error?.message || 'Failed to upload image');
    }

    return data.secure_url;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};


export const createRental = async (rentalData: RentalFormData): Promise<Rental> => {
  try {
    const token = await getToken();
    const response = await fetch(`${API_BASE_URL}/rentals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: rentalData.title,
        location: rentalData.location,
        price: rentalData.price,
        bedrooms: rentalData.bedrooms,
        bathrooms: rentalData.bathrooms,
        size: rentalData.size,
        description: rentalData.description,
        availableFrom: rentalData.availableFrom,
        amenities: rentalData.amenities,
        contact_name: rentalData.contact.name,
        contact_phone: rentalData.contact.phone,
        contact_email: rentalData.contact.email,
        status: 'available',
        imageUrl: rentalData.imageUrl,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('Response error:', data);
      throw new Error(data.message || 'Failed to create rental');
    }

    return data;
  } catch (error) {
    console.error('Error creating rental:', error);
    throw error;
  }
};

// --- USER'S OWN LISTINGS ---
export const fetchOwnRentals = async (): Promise<Rental[]> => {
  const token = await getToken();
  const response = await fetch(`${API_BASE_URL}/api/user/rentals`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Failed to fetch your listings');
  return await response.json();
};

export const updateRental = async (rentalId: number, rentalData: Partial<RentalFormData>): Promise<any> => {
  const token = await getToken();
  const response = await fetch(`${API_BASE_URL}/api/rentals/${rentalId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(rentalData),
  });
  if (!response.ok) throw new Error('Failed to update rental');
  return await response.json();
};

export const deleteRental = async (rentalId: number): Promise<any> => {
  const token = await getToken();
  const response = await fetch(`${API_BASE_URL}/api/rentals/${rentalId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Failed to delete rental');
  return await response.json();
};

// --- COMMENTS ---
export const fetchComments = async (rentalId: number): Promise<any[]> => {
  const response = await fetch(`${API_BASE_URL}/api/rentals/${rentalId}/comments`);
  if (!response.ok) throw new Error('Failed to fetch comments');
  return await response.json();
};

export const postComment = async (rentalId: number, comment: string): Promise<any> => {
  const token = await getToken();
  const response = await fetch(`${API_BASE_URL}/api/rentals/${rentalId}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ comment }),
  });
  if (!response.ok) throw new Error('Failed to post comment');
  return await response.json();
};

// --- MESSAGING ---
export const getConversations = async (): Promise<any[]> => {
  const token = await getToken();
  const response = await fetch(`${API_BASE_URL}/api/conversations`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Failed to fetch conversations');
  const data = await response.json();
  return data.conversations || [];
};

export const startConversation = async (rentalId: number): Promise<any> => {
  const token = await getToken();
  const response = await fetch(`${API_BASE_URL}/api/conversations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ rentalId }),
  });
  if (!response.ok) throw new Error('Failed to start conversation');
  return await response.json();
};

export const getMessages = async (conversationId: number): Promise<any[]> => {
  const token = await getToken();
  const response = await fetch(`${API_BASE_URL}/api/conversations/${conversationId}/messages`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Failed to fetch messages');
  const data = await response.json();
  return data.messages || [];
};

export const sendMessage = async (conversationId: number, content: string): Promise<any> => {
  const token = await getToken();
  const response = await fetch(`${API_BASE_URL}/api/conversations/${conversationId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ content }),
  });
  if (!response.ok) throw new Error('Failed to send message');
  return await response.json();
};

// --- FAVOURITES ---
export const getFavourites = async (): Promise<Rental[]> => {
  const token = await getToken();
  const response = await fetch(`${API_BASE_URL}/api/favourites`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Failed to fetch favourites');
  return await response.json();
};

export const addFavourite = async (rentalId: number): Promise<any> => {
  const token = await getToken();
  const response = await fetch(`${API_BASE_URL}/api/favourites`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ rentalId }),
  });
  if (!response.ok) throw new Error('Failed to add favourite');
  return await response.json();
};

export const removeFavourite = async (rentalId: number): Promise<any> => {
  const token = await getToken();
  const response = await fetch(`${API_BASE_URL}/api/favourites/${rentalId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Failed to remove favourite');
  return await response.json();
};

// --- PROFILE ---
export const updateProfile = async (profileData: any): Promise<any> => {
  const token = await getToken();
  const response = await fetch(`${API_BASE_URL}/api/user`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(profileData),
  });
  if (!response.ok) throw new Error('Failed to update profile');
  return await response.json();
};


const PostScreen = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null); 
  const [formData, setFormData] = useState<RentalFormData>({
    title: '',
    location: '',
    price: '',
    bedrooms: '',
    bathrooms: '',
    size: '',
    description: '',
    availableFrom: '',
    amenities: {},
    contact: {
      name: '',
      phone: '',
      email: '',
    },
    imageUrl:'',
  });

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 1,
    });

    if (!result.canceled) {
      const selectedImage = result.assets[0].uri;
      setImage(selectedImage);
      const file = {
        uri: selectedImage,
        type: 'image/jpeg', 
        name: 'rental-image.jpg', 
      };
      try {
        const uploadedImageUrl = await uploadImageToCloudinary(file);
        setImageUrl(uploadedImageUrl); 
      } catch (error) {
        console.error('Error uploading image:', error);
        Alert.alert('Error', 'Failed to upload image. Please try again.');
      }
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      if (!imageUrl) {
        Alert.alert('Error', 'Please upload an image before posting.');
        return;
      }
      const rentalData = {
        ...formData,
        imageUrl, 
      };

      await createRental(rentalData);
      Alert.alert('Success', 'Rental posted successfully!');
      router.replace('/(tabs)/explore');
    } catch (error) {
      console.error('Error posting rental:', error);
      Alert.alert('Error', 'Failed to post rental. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return null
}; 