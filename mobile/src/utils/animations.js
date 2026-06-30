import { Animated, Easing } from 'react-native';

export const fadeInUp = (opacity, translateY) => {
  return Animated.parallel([
    Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
    Animated.timing(translateY, {
      toValue: 0,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }),
  ]);
};
