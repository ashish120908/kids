import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { spacing, radius, gradients } from '../theme/tokens';

export default function PromoBanner() {
  return (
    <TouchableOpacity activeOpacity={0.9} style={styles.container}>
      <LinearGradient
        start={{x: 0, y: 0}} end={{x: 1, y: 0}}
        colors={gradients.promo}
        style={styles.gradient}
      >
        <View style={styles.left}>
            <View style={styles.iconGrid}>
               <Text style={styles.tinyIcon}>🔵</Text>
               <Text style={styles.tinyIcon}>🔴</Text>
               <Text style={styles.tinyIcon}>🟡</Text>
               <Text style={styles.tinyIcon}>🟢</Text>
            </View>
        </View>

        <View style={styles.center}>
            <Text style={styles.title}>FUN GAMES! 🤩</Text>
            <Text style={styles.subtitle}>- Try 'Bubble Pop' for FREE! ⭐</Text>
        </View>

        <View style={styles.right}>
            <View style={styles.button}>
                <Text style={styles.buttonText}>PLAY NOW</Text>
            </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
  },
  left: {
    width: 50,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 40,
  },
  tinyIcon: { fontSize: 12 },
  center: {
    flex: 1,
    paddingHorizontal: 10,
  },
  title: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 10,
    fontWeight: '700',
  },
  right: {
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: '#4FACFE',
  },
  buttonText: {
    color: '#2A1B6E',
    fontSize: 10,
    fontWeight: '900',
  },
});
