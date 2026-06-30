import React from 'react';
import { StyleSheet, Text } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

export default function Header({ title, subtitle }) {
  return (
    <LinearGradient colors={['#FF6B9D', '#C06FF8']} style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: 24, padding: 18, marginBottom: 14 },
  title: { color: '#fff', fontSize: 24, fontWeight: '800' },
  subtitle: { color: 'rgba(255,255,255,0.95)', marginTop: 4, fontWeight: '600' },
});
