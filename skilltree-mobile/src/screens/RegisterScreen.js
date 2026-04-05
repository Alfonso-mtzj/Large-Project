import React, { useState } from 'react';
import { View, Text } from 'react-native';
import Input from '../components/Input';
import Button from '../components/Button';
import { registerUser } from '../api/auth';

export default function RegisterScreen({ navigation }) {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const { data } = await registerUser(form);
      setSuccess(data.message || 'Registered! Check your email.');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 24, marginBottom: 16 }}>Register</Text>

      {error ? <Text style={{ color: 'red', marginBottom: 12 }}>{error}</Text> : null}
      {success ? <Text style={{ color: 'green', marginBottom: 12 }}>{success}</Text> : null}

      <Input label="First name" value={form.firstName} onChangeText={(v) => setForm((f) => ({ ...f, firstName: v }))} />
      <Input label="Last name" value={form.lastName} onChangeText={(v) => setForm((f) => ({ ...f, lastName: v }))} />
      <Input label="Username" value={form.username} autoCapitalize="none" onChangeText={(v) => setForm((f) => ({ ...f, username: v }))} />
      <Input label="Email" value={form.email} autoCapitalize="none" keyboardType="email-address" onChangeText={(v) => setForm((f) => ({ ...f, email: v }))} />
      <Input label="Password" value={form.password} secureTextEntry onChangeText={(v) => setForm((f) => ({ ...f, password: v }))} />

      <Button title={loading ? 'Creating...' : 'Create account'} onPress={onSubmit} disabled={loading} />

      <Text style={{ marginTop: 14 }}>
        Already have an account?{' '}
        <Text style={{ color: 'blue' }} onPress={() => navigation.navigate('Login')}>
          Login
        </Text>
      </Text>
    </View>
  );
}
