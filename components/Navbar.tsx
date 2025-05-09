import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface NavbarProps {
  onProfilePress?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onProfilePress }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>Stayspot</Text>
      <TouchableOpacity onPress={onProfilePress} style={styles.profileButton}>
        <Ionicons name="person-circle-outline" size={28} color="#333" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  profileButton: {
    padding: 5,
  },
}); 