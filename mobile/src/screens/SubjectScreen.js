import React from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity, SafeAreaView } from 'react-native';
import { games, categories } from '../data/gamesData';
import KidCard from '../components/KidCard';
import { spacing, radius } from '../theme/tokens';

export default function SubjectScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.headerTitle}>Learning Adventure 📚</Text>
        <Text style={styles.headerSub}>Choose a game to start learning!</Text>

        {categories.map((cat) => {
          const items = games.filter((g) => g.cat === cat.key);
          return (
            <View key={cat.key} style={styles.section}>
              <View style={styles.sectionHeader}>
                 <Text style={styles.sectionEmoji}>{cat.emoji}</Text>
                 <View>
                    <Text style={styles.sectionTitle}>{cat.title}</Text>
                    <Text style={styles.sectionSub}>{cat.sub}</Text>
                 </View>
              </View>

              <View style={styles.grid}>
                {items.map((game) => (
                  <TouchableOpacity
                    key={game.id}
                    style={styles.gridItem}
                    onPress={() => navigation.navigate(game.path, { mode: game.mode })}
                  >
                    <KidCard
                      title={game.title}
                      subtitle={game.desc}
                      icon={game.emoji}
                      gradient={[game.color, '#ffffff']} // Simple gradient based on game color
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          );
        })}

        {/* Padding for the floating tab bar */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { padding: 20 },
  headerTitle: { fontSize: 28, fontWeight: '900', color: '#fff', textAlign: 'center' },
  headerSub: { fontSize: 16, fontWeight: '600', color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginBottom: 20 },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  sectionEmoji: { fontSize: 32, marginRight: 12 },
  sectionTitle: { fontSize: 22, fontWeight: '900', color: '#fff' },
  sectionSub: { fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  gridItem: { width: '100%' }, // List style for Learn screen to show descriptions
});
