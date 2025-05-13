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
    
    // Transform the API response to match our RentalDetails interface
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
  try {
    const response = await fetch(file.uri);
    const blob = await response.blob(); 

    const formData = new FormData();
    formData.append('file', blob, file.name);  
    formData.append('upload_preset', 'imageUrl');

    const cloudinaryResponse = await fetch('https://api.cloudinary.com/v1_1/dnd03w7us/image/upload', {
      method: 'POST',
      body: formData,
    });

    if (!cloudinaryResponse.ok) {
      const errorData = await cloudinaryResponse.json();
      console.error('Upload error response:', errorData);
      throw new Error('Failed to upload image');
    }

    const data = await cloudinaryResponse.json();
    return data.secure_url;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

export const createRental = async (rentalData: RentalFormData): Promise<Rental> => {
  try {
    const response = await fetch(`${API_BASE_URL}/rentals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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
        status: 'available'
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create rental');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating rental:', error);
    throw error;
  }
};

const PostScreen = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null); // State to store the uploaded image URL
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

      // Create a file object for the upload
      const file = {
        uri: selectedImage,
        type: 'image/jpeg', // Adjust this based on the actual image type
        name: 'rental-image.jpg', // You can also use a dynamic name if needed
      };

      // Upload image to Cloudinary
      try {
        const uploadedImageUrl = await uploadImageToCloudinary(file);
        setImageUrl(uploadedImageUrl); // Store the uploaded image URL
      } catch (error) {
        console.error('Error uploading image:', error);
        Alert.alert('Error', 'Failed to upload image. Please try again.');
      }
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Check if an image has been uploaded
      if (!imageUrl) {
        Alert.alert('Error', 'Please upload an image before posting.');
        return;
      }

      // Create rental with image URL
      const rentalData = {
        ...formData,
        imageUrl, // Use the uploaded image URL here
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