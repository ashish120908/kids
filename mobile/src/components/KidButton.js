import React, { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { radius, spacing } from '../theme/tokens';

export default function KidButton({ title, onPress, colors = ['#FF6B9D', '#C06FF8'] }) {
  const scale = useRef(new Animated.Value(1)).current;

  const animate = toValue => {
    Animated.spring(scale, { toValue, useNativeDriver: true, speed: 30, bounciness: 6 }).start();
  };

  return (
    <Pressable
      onPressIn={() => animate(0.95)}
      onPressOut={() => animate(1)}
      onPress={onPress}
      accessibilityRole="button"
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        <LinearGradient colors={colors} style={styles.button}>
          <Text style={styles.text}>{title}</Text>
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    shadowColor: '#7C36CC',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 4,
  },
  text: { color: '#fff', fontWeight: '800', fontSize: 16, textAlign: 'center' },
});
