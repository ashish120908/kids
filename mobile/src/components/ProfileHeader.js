import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { spacing, radius } from '../theme/tokens';

export default function ProfileHeader() {
  return (
    <View style={styles.container}>
      {/* Top Row: Avatar and Stars */}
      <View style={styles.topRow}>
        <View style={styles.avatarWrapper}>
           <LinearGradient colors={['#00E5FF', '#1200FF']} style={styles.avatarBorder}>
              <View style={styles.avatarInner}>
                 <Text style={{fontSize: 40}}>👦</Text>
              </View>
           </LinearGradient>
        </View>

        <View style={styles.starsPill}>
           <Text style={styles.starsText}>25 Stars ⭐</Text>
        </View>
      </View>

      {/* Stats Row: Level and XP */}
      <View style={styles.statsRow}>
         <View style={styles.levelInfo}>
            <Text style={styles.levelLabel}>LVL 5</Text>
         </View>

         <View style={styles.xpInfo}>
            <Text style={styles.xpLabel}>120/200 XP</Text>
            <View style={styles.xpTrack}>
               <LinearGradient
                  start={{x: 0, y: 0}} end={{x: 1, y: 0}}
                  colors={['#FFD700', '#FFA500']}
                  style={[styles.xpFill, { width: '70%' }]}
               >
                  <Text style={styles.xpPercent}>70%</Text>
               </LinearGradient>
            </View>
         </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  avatarWrapper: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  avatarBorder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInner: {
    width: '100%',
    height: '100%',
    borderRadius: 36,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2A1B6E',
  },
  starsPill: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  starsText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 18,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  levelInfo: {
    marginBottom: 4,
  },
  levelLabel: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
  },
  xpInfo: {
    width: '65%',
  },
  xpLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'right',
    marginBottom: 4,
  },
  xpTrack: {
    height: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
  },
  xpFill: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  xpPercent: {
    fontSize: 12,
    fontWeight: '900',
    color: '#000',
  },
});
