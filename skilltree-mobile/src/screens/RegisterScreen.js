import React, { useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import Input from '../components/Input';
import Button from '../components/Button';
import AuthContainer from '../components/AuthContainer';
import { registerUser } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import { authStyles } from '../styles/authStyles';
import { SPACING } from '../../../skilltree-shared/theme';

export default function RegisterScreen({ navigation }) {
  const { login } = useAuth();
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

    // Validation
    if (!form.firstName || !form.lastName || !form.username || !form.email || !form.password) {
      setError('Please fill in all fields');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const { data } = await registerUser(form);
      setSuccess(data.message || 'Registered! Check your email to verify your account.');
      
      // Optional: Auto-login after registration
      if (data.token) {
        await login(data);
        navigation.replace('Dashboard');
      } else {
        // Navigate to login after a delay
        setTimeout(() => navigation.replace('Login'), 2000);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Registration failed';
      setError(errorMessage);
      Alert.alert('Registration Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContainer
      frameImage={require('../assets/auth/register_UI.png')}
      frameAspectRatio={1.5}
      maxFrameWidth={700}
    >
      <ScrollView style={authStyles.form} showsVerticalScrollIndicator={false}>
        <Text style={authStyles.title}>Create Account</Text>

        {error && (
          <View style={authStyles.errorContainer}>
            <Text style={authStyles.errorText}>{error}</Text>
          </View>
        )}

        {success && (
          <View style={authStyles.successContainer}>
            <Text style={authStyles.successText}>{success}</Text>
          </View>
        )}

        <Input
          label="First Name"
          value={form.firstName}
          onChangeText={(v) => setForm((f) => ({ ...f, firstName: v }))}
          style={{ marginTop: SPACING.xl }}
        />

        <Input
          label="Last Name"
          value={form.lastName}
          onChangeText={(v) => setForm((f) => ({ ...f, lastName: v }))}
        />

        <Input
          label="Username"
          value={form.username}
          autoCapitalize="none"
          onChangeText={(v) => setForm((f) => ({ ...f, username: v }))}
        />

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

        <Button
          title={loading ? 'Creating...' : 'Create Account'}
          onPress={onSubmit}
          disabled={loading}
          style={{ marginTop: SPACING.xl }}
        />

        <View style={authStyles.linksContainer}>
          <Text
            style={authStyles.link}
            onPress={() => navigation.navigate('Login')}
          >
            Already have an account? Login
          </Text>
        </View>
      </ScrollView>
    </AuthContainer>
  );
}
