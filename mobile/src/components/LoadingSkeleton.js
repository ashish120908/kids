import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function LoadingSkeleton() {
  return (
    <View style={styles.box}>
      <View style={styles.barLg} />
      <View style={styles.barSm} />
    </View>
  );
}

const styles = StyleSheet.create({
  box: { borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.22)', padding: 16, marginBottom: 12 },
  barLg: { height: 16, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.35)', marginBottom: 8 },
  barSm: { height: 12, width: '60%', borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.28)' },
});
