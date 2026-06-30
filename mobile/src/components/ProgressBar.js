import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function ProgressBar({ progress = 0 }) {
  const safeProgress = Math.max(0, Math.min(100, progress));
  return (
    <View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${safeProgress}%` }]} />
      </View>
      <Text style={styles.label}>{safeProgress}% complete</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  track: { height: 10, backgroundColor: 'rgba(255,255,255,0.35)', borderRadius: 999, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: '#00D9A3', borderRadius: 999 },
  label: { marginTop: 6, color: '#fff', fontWeight: '700', fontSize: 12 },
});
