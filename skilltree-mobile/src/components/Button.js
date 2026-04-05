import React from 'react';
import { Pressable, Text } from 'react-native';

export default function Button({ title, onPress, disabled }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={{
        backgroundColor: disabled ? '#9aa0a6' : '#2e7d32',
        padding: 12,
        borderRadius: 6,
        alignItems: 'center'
      }}
    >
      <Text style={{ color: 'white', fontWeight: '600' }}>{title}</Text>
    </Pressable>
  );
}
