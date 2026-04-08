import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { authStyles } from '../styles/authStyles';
import { COLORS } from '../../../skilltree-shared/theme';

export default function FireflyBackground() {
  const [fireflies, setFireflies] = useState([]);

  useEffect(() => {
    // Create 15-20 fireflies with random positions
    const newFireflies = Array.from({ length: 18 }, (_, i) => ({
      id: i,
      left: Math.random() * 90 + '%',
      top: Math.random() * 80 + '%',
      delay: Math.random() * 2,
      duration: Math.random() * 2 + 3,
    }));
    setFireflies(newFireflies);
  }, []);

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
      {fireflies.map((firefly) => (
        <View
          key={firefly.id}
          style={[
            authStyles.firefly,
            {
              left: firefly.left,
              top: firefly.top,
              opacity: 0.7,
              shadowColor: COLORS.primary.goldAccent,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.8,
              shadowRadius: 6,
              elevation: 5,
            },
          ]}
        />
      ))}
    </View>
  );
}
