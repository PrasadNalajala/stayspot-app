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