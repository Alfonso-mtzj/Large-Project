import React, { useState } from 'react';
import { TextInput, View, Text } from 'react-native';
import { authStyles } from '../styles/authStyles';
import { COLORS } from '../../../skilltree-shared/theme';

export default function Input({
  label,
  placeholder = '',
  value,
  onChangeText,
  secureTextEntry = false,
  autoCapitalize = 'none',
  keyboardType = 'default',
  editable = true,
  style,
  ...props
}) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={{ marginBottom: 12, ...style }}>
      {label && <Text style={authStyles.label}>{label}</Text>}
      <TextInput
        style={[
          authStyles.input,
          isFocused && authStyles.inputFocused,
          !editable && authStyles.inputDisabled,
        ]}
        placeholder={placeholder}
        placeholderTextColor="rgba(200, 170, 90, 0.3)"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        editable={editable}
        selectionColor={COLORS.primary.gold}
        {...props}
      />
    </View>
  );
}
