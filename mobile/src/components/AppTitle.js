import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { spacing } from '../theme/tokens';

export default function AppTitle() {
  return (
    <View style={styles.container}>
      <View style={styles.iconRow}>
        <Text style={styles.decorIcon}>✏️</Text>
        <Text style={styles.decorIcon}>🧊</Text>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.titleLine1}>PLAY & LEARN</Text>
        <Text style={styles.titleLine2}>ADVENTURE</Text>
      </View>
      <View style={styles.iconRowRight}>
        <Text style={styles.decorIcon}>🧩</Text>
        <Text style={styles.decorIcon}>📚</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.md,
  },
  textContainer: {
    alignItems: 'center',
  },
  titleLine1: {
    fontSize: 28,
    fontWeight: '900',
    color: '#34D399', // Greenish
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 2,
    letterSpacing: 1,
  },
  titleLine2: {
    fontSize: 34,
    fontWeight: '900',
    color: '#FB7185', // Pinkish
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 2,
    letterSpacing: 1,
    marginTop: -8,
  },
  iconRow: {
    marginRight: 10,
    gap: 15,
  },
  iconRowRight: {
    marginLeft: 10,
    gap: 15,
  },
  decorIcon: {
    fontSize: 24,
  },
});
