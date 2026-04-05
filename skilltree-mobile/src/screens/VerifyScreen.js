import React, { useState } from 'react';
import { View, Text } from 'react-native';
import Input from '../components/Input';
import Button from '../components/Button';
import { verifyEmail } from '../api/auth';

export default function VerifyScreen() {
  const [token, setToken] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const onVerify = async () => {
    setMessage('');
    setLoading(true);
    try {
      const res = await verifyEmail(token.trim());
      setMessage(res.data || 'Verified!');
    } catch (err) {
      setMessage(String(err.response?.data || err.message || 'Verification failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 24, marginBottom: 16 }}>Verify Email</Text>

      <Text style={{ marginBottom: 10 }}>
        Normally you verify by clicking the email link. This screen is a manual tester.
      </Text>

      <Input label="Verification Token" value={token} autoCapitalize="none" onChangeText={setToken} />

      <Button title={loading ? 'Verifying...' : 'Verify'} onPress={onVerify} disabled={loading} />

      {message ? <Text style={{ marginTop: 12 }}>{message}</Text> : null}
    </View>
  );
}
