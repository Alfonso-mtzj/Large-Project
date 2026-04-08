import React from 'react';
import {
  View,
  ImageBackground,
  Dimensions,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import FireflyBackground from './FireflyBackground';
import { authStyles } from '../styles/authStyles';
import { COLORS } from '../../../skilltree-shared/theme';

const windowWidth = Dimensions.get('window').width;

export default function AuthContainer({
  frameImage,
  children,
  frameAspectRatio = 0.75,
  maxFrameWidth = 420,
}) {
  const frameHeight = (windowWidth * 0.88) / frameAspectRatio;

  return (
    <SafeAreaView style={authStyles.safeArea}>
      <ScrollView
        contentContainerStyle={authStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ImageBackground
          source={require('../assets/auth/Login-register.png')}
          style={authStyles.background}
          imageStyle={{ resizeMode: 'cover' }}
        >
          {/* Fireflies */}
          <FireflyBackground />

          {/* Frame Wrapper */}
          <View
            style={[
              authStyles.frameWrapper,
              {
                width: Math.min(maxFrameWidth, windowWidth * 0.88),
                height: frameHeight,
              },
            ]}
          >
            {/* Frame Image with overlay */}
            {frameImage && (
              <ImageBackground
                source={frameImage}
                style={{ width: '100%', height: '100%' }}
                resizeMode="contain"
              >
                <View style={authStyles.overlay}>{children}</View>
              </ImageBackground>
            )}

            {/* Fallback if no frame image */}
            {!frameImage && <View style={authStyles.overlay}>{children}</View>}
          </View>
        </ImageBackground>
      </ScrollView>
    </SafeAreaView>
  );
}
