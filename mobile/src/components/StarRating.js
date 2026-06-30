import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function StarRating({ rating = 0, onChange }) {
  return (
    <View style={styles.row}>
      {[1, 2, 3].map(star => (
        <Pressable key={star} onPress={() => onChange?.(star)}>
          <Text style={[styles.star, star <= rating && styles.filled]}>{star <= rating ? '⭐' : '☆'}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8 },
  star: { fontSize: 24, opacity: 0.45 },
  filled: { opacity: 1 },
});
