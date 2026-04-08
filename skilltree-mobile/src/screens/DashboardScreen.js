import React from 'react';
import { View, Text, SafeAreaView, StyleSheet } from 'react-native';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { COLORS, FONTS, FONT_SIZES, SPACING } from '../../../skilltree-shared/theme';

export default function DashboardScreen({ navigation }) {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigation.replace('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          Welcome, {user?.username || user?.email || 'Adventurer'}!
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Level Up Your Skills</Text>
          <Text style={styles.cardDescription}>
            Log workouts, study sessions, and social activities to level up your character stats.
          </Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Experience</Text>
            <Text style={styles.statValue}>1200 XP</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Level</Text>
            <Text style={styles.statValue}>5</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          title="Logout"
          onPress={handleLogout}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },

  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 220, 80, 0.2)',
  },

  title: {
    fontFamily: FONTS.decorative,
    fontSize: FONT_SIZES['3xl'],
    fontWeight: '700',
    color: COLORS.primary.goldLight,
    textShadowColor: 'rgba(255, 220, 80, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },

  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
  },

  card: {
    backgroundColor: 'rgba(255, 220, 80, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 220, 80, 0.2)',
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
  },

  cardTitle: {
    fontFamily: FONTS.primary,
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.primary.gold,
    marginBottom: SPACING.sm,
  },

  cardDescription: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZES.base,
    color: COLORS.primary.goldLight,
    lineHeight: 20,
  },

  statsContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
  },

  stat: {
    flex: 1,
    backgroundColor: 'rgba(255, 220, 80, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 220, 80, 0.2)',
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
  },

  statLabel: {
    fontFamily: FONTS.primary,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.primary.gold,
    marginBottom: SPACING.xs,
  },

  statValue: {
    fontFamily: FONTS.decorative,
    fontSize: FONT_SIZES['2xl'],
    fontWeight: '700',
    color: COLORS.primary.goldAccent,
  },

  footer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 220, 80, 0.2)',
  },
});
