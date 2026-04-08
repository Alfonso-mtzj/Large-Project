import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import Input from '../components/Input';
import Button from '../components/Button';
import AuthContainer from '../components/AuthContainer';
import { verifyEmail } from '../api/auth';
import { authStyles } from '../styles/authStyles';
import { SPACING } from '../../../skilltree-shared/theme';

export default function VerifyScreen({ navigation }) {
  const [token, setToken] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const [loading, setLoading] = useState(false);

  const onVerify = async () => {
    setMessage('');
    setMessageType('');

    if (!token.trim()) {
      setMessage('Please enter a verification token');
      setMessageType('error');
      return;
    }

    setLoading(true);
    try {
      const res = await verifyEmail(token.trim());
      setMessage(res.data?.message || 'Email verified successfully!');
      setMessageType('success');
      
      // Redirect to login after success
      setTimeout(() => navigation.replace('Login'), 2000);
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Verification failed';
      setMessage(errorMsg);
      setMessageType('error');
      Alert.alert('Verification Error', errorMsg);
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
      <View style={authStyles.form}>
        <Text style={authStyles.title}>Verify Email</Text>

        <Text style={{ 
          marginBottom: SPACING.lg, 
          marginTop: SPACING.xl,
          color: '#c8aa5a',
          fontFamily: 'Cinzel',
          fontSize: 14,
          lineHeight: 20
        }}>
          Normally you verify by clicking the email link. This screen is for manual verification.
        </Text>

        {message && (
          <View style={messageType === 'error' ? authStyles.errorContainer : authStyles.successContainer}>
            <Text style={messageType === 'error' ? authStyles.errorText : authStyles.successText}>
              {message}
            </Text>
          </View>
        )}

        <Input
          label="Verification Token"
          value={token}
          autoCapitalize="none"
          onChangeText={setToken}
          placeholder="Paste your token"
          style={{ marginTop: SPACING.lg }}
        />

        <Button
          title={loading ? 'Verifying...' : 'Verify'}
          onPress={onVerify}
          disabled={loading}
          style={{ marginTop: SPACING.xl }}
        />

        <View style={authStyles.linksContainer}>
          <Text
            style={authStyles.link}
            onPress={() => navigation.navigate('Login')}
          >
            Back to Login
          </Text>
        </View>
      </View>
    </AuthContainer>
  );
}
