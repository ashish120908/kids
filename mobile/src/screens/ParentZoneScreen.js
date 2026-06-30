import React, { useState } from 'react';
import { StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import Header from '../components/Header';
import KidButton from '../components/KidButton';

export default function ParentZoneScreen() {
  const [pin, setPin] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [limitOn, setLimitOn] = useState(true);

  if (!unlocked) {
    return (
      <View style={styles.container}>
        <Header title="Parent Zone ��" subtitle="Enter your 4-digit PIN" />
        <TextInput
          value={pin}
          onChangeText={setPin}
          keyboardType="number-pad"
          secureTextEntry
          maxLength={4}
          style={styles.input}
          placeholder="••••"
          placeholderTextColor="rgba(255,255,255,0.6)"
        />
        <KidButton title="Unlock" onPress={() => setUnlocked(pin.length === 4)} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Parent Controls ⚙️" subtitle="Manage time, filters, and reports" />
      <View style={styles.card}>
        <Text style={styles.label}>Screen time limit (45 min/day)</Text>
        <Switch value={limitOn} onValueChange={setLimitOn} />
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>Content filter: Beginner friendly</Text>
        <Text style={styles.meta}>Reports: Weekly summary enabled 📈</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
    borderRadius: 20,
    color: '#fff',
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.42)',
    borderRadius: 24,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: { color: '#fff', fontSize: 16, fontWeight: '800', flex: 1, marginRight: 10 },
  meta: { color: '#fff', fontWeight: '700' },
});
