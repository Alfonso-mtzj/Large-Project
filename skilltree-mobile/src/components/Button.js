import React, { useState } from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { authStyles } from '../styles/authStyles';

export default function Button({ 
  title, 
  onPress, 
  disabled = false, 
  style,
  variant = 'primary' // 'primary' or 'secondary'
}) {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <TouchableOpacity
      style={[
        authStyles.button,
        isPressed && authStyles.buttonPressed,
        disabled && authStyles.buttonDisabled,
        style,
      ]}
      onPress={onPress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={authStyles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
}
