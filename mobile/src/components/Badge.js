import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function Badge({ title, unlocked }) {
  return (
    <View style={[styles.badge, unlocked ? styles.unlocked : styles.locked]}>
      <Text style={styles.icon}>{unlocked ? '🏅' : '🔒'}</Text>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { borderRadius: 20, padding: 12, alignItems: 'center', minWidth: 100 },
  unlocked: { backgroundColor: 'rgba(0,217,163,0.25)', borderWidth: 1, borderColor: '#00D9A3' },
  locked: { backgroundColor: 'rgba(255,255,255,0.2)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)' },
  icon: { fontSize: 24 },
  title: { marginTop: 4, color: '#fff', fontWeight: '700', fontSize: 12 },
});
