import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import Input from '../components/Input';
import Button from '../components/Button';
import AuthContainer from '../components/AuthContainer';
import { loginUser } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import { authStyles } from '../styles/authStyles';
import { SPACING } from '../../../skilltree-shared/theme';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setError('');

    if (!form.email || !form.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const { data } = await loginUser(form);
      await login(data);
      navigation.replace('Dashboard');
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Login failed';
      setError(errorMessage);
      Alert.alert('Login Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContainer
      frameImage={require('../assets/auth/login_UI.png')}
      frameAspectRatio={0.75}
      maxFrameWidth={420}
    >
      {error && (
        <View style={authStyles.errorContainer}>
          <Text style={authStyles.errorText}>{error}</Text>
        </View>
      )}

      <View style={authStyles.form}>
        <Text style={authStyles.title}>Log In</Text>

        <Input
          label="Email"
          placeholder="Enter your email"
          value={form.email}
          onChangeText={(v) => setForm((f) => ({ ...f, email: v }))}
          keyboardType="email-address"
          autoCapitalize="none"
          style={{ marginTop: SPACING.xl }}
        />

        <Input
          label="Password"
          placeholder="Enter your password"
          value={form.password}
          onChangeText={(v) => setForm((f) => ({ ...f, password: v }))}
          secureTextEntry
        />

        <Button
          title={loading ? 'Logging in...' : 'Log In'}
          onPress={onSubmit}
          disabled={loading}
          style={{ marginTop: SPACING.xl }}
        />

        <View style={authStyles.linksContainer}>
          <Text
            style={authStyles.link}
            onPress={() => navigation.navigate('Register')}
          >
            Don't have an account? Register
          </Text>
          <Text
            style={authStyles.link}
            onPress={() => navigation.navigate('Verify')}
          >
            Have a verification token? Verify
          </Text>
        </View>
      </View>
    </AuthContainer>
  );
}
