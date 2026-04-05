import React, { useState } from 'react';
import { View, Text } from 'react-native';
import Input from '../components/Input';
import Button from '../components/Button';
import { loginUser } from '../api/auth';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      const { data } = await loginUser(form);
      login(data);
      navigation.replace('Dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 24, marginBottom: 16 }}>Login</Text>

      {error ? <Text style={{ color: 'red', marginBottom: 12 }}>{error}</Text> : null}

      <Input
        label="Email"
        value={form.email}
        autoCapitalize="none"
        keyboardType="email-address"
        onChangeText={(v) => setForm((f) => ({ ...f, email: v }))}
      />
      <Input
        label="Password"
        value={form.password}
        secureTextEntry
        onChangeText={(v) => setForm((f) => ({ ...f, password: v }))}
      />

      <Button title={loading ? 'Logging in...' : 'Login'} onPress={onSubmit} disabled={loading} />

      <Text style={{ marginTop: 14 }}>
        Don’t have an account?{' '}
        <Text style={{ color: 'blue' }} onPress={() => navigation.navigate('Register')}>
          Register
        </Text>
      </Text>

      <Text style={{ marginTop: 10 }}>
        Have a verification token?{' '}
        <Text style={{ color: 'blue' }} onPress={() => navigation.navigate('Verify')}>
          Verify
        </Text>
      </Text>
    </View>
  );
}
