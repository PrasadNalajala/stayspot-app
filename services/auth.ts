import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://stayspot.onrender.com';

export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
  location: string | null;
  occupation: string | null;
  phone_number: string | null;
  bio: string | null;
  profile_url: string | null;
}

export interface LoginResponse {
  id: number;
  name: string;
  email: string;
  token: string;
}

export interface RegisterResponse extends LoginResponse {}

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();
    // Store the token
    await storeToken(data.token);
    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const register = async (
  name: string,
  email: string,
  password: string
): Promise<RegisterResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });

    if (!response.ok) {
      throw new Error('Registration failed');
    }

    const data = await response.json();
    // Store the token
    await storeToken(data.token);
    return data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const getUserDetails = async (): Promise<User> => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch(`${API_BASE_URL}/api/user`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user details');
    }

    const data = await response.json();
    return data[0]; // API returns an array with one user
  } catch (error) {
    console.error('Get user details error:', error);
    throw error;
  }
};

// Token storage functions
const storeToken = async (token: string) => {
  try {
    await AsyncStorage.setItem('userToken', token);
  } catch (error) {
    console.error('Error storing token:', error);
  }
};

export const getToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem('userToken');
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

export const logout = async () => {
  try {
    await AsyncStorage.removeItem('userToken');
  } catch (error) {
    console.error('Error removing token:', error);
  }
}; 