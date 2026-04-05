import React from 'react';
import { View, Text } from 'react-native';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';

export default function DashboardScreen({ navigation }) {
  const { user, logout } = useAuth();

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 24, marginBottom: 12 }}>Dashboard</Text>
      <Text style={{ marginBottom: 20 }}>Welcome {user?.email || 'User'}</Text>

      <Button
        title="Logout"
        onPress={() => {
          logout();
          navigation.replace('Login');
        }}
      />
    </View>
  );
}
