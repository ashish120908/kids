import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { spacing, radius } from '../theme/tokens';

export default function GameCard({ title, subtitle, icon, gradient, onPress }) {
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={styles.cardContainer}>
      <LinearGradient colors={gradient} style={styles.gradientBg}>
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.iconContainer}>
             <Text style={styles.mainIcon}>{icon}</Text>
          </View>
          <Text style={styles.subtitle}>{subtitle}</Text>

          {/* Play Button */}
          <View style={styles.playButton}>
             <LinearGradient colors={['#fff', '#f0f0f0']} style={styles.playCircle}>
                <Text style={styles.playIcon}>▶️</Text>
             </LinearGradient>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: '48%',
    aspectRatio: 0.85,
    marginBottom: spacing.md,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.6)',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  gradientBg: {
    flex: 1,
    padding: spacing.sm,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  iconContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainIcon: {
    fontSize: 50,
  },
  subtitle: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 40, // Space for play button
  },
  playButton: {
    position: 'absolute',
    bottom: -10,
    alignSelf: 'center',
  },
  playCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  playIcon: {
    fontSize: 18,
    marginLeft: 2,
  },
});
