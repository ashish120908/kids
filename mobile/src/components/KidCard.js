import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors, radius, spacing } from '../theme/tokens';

export default function KidCard({ title, subtitle, icon = '⭐', gradient = ['#FF6B9D', '#C06FF8'], rightNode }) {
  return (
    <LinearGradient colors={gradient} style={styles.outer}>
      <View style={styles.glass}>
        <Text style={styles.icon}>{icon}</Text>
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {rightNode}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  outer: {
    borderRadius: radius.xl,
    marginBottom: spacing.md,
    padding: 1,
  },
  glass: {
    borderRadius: radius.xl,
    padding: spacing.md,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: { fontSize: 28, marginRight: spacing.sm },
  content: { flex: 1 },
  title: { fontSize: 18, fontWeight: '800', color: '#fff' },
  subtitle: { color: 'rgba(255,255,255,0.92)', marginTop: 4, fontWeight: '600' },
});
