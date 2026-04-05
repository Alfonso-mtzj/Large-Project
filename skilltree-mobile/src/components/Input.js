import React from 'react';
import { TextInput, View, Text } from 'react-native';

export default function Input({ label, ...props }) {
  return (
    <View style={{ marginBottom: 12 }}>
      {label ? <Text style={{ marginBottom: 6 }}>{label}</Text> : null}
      <TextInput
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          padding: 10,
          borderRadius: 6
        }}
        {...props}
      />
    </View>
  );
}
