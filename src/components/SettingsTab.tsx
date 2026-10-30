import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserSettings } from '../types';
import { Colors, Shadows } from '../theme';

interface SettingsTabProps {
  settings: UserSettings;
  onOpenGoalsModal: () => void;
  onOpenDataModal: () => void;
  onTriggerCelebration: () => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  settings,
  onOpenGoalsModal,
  onOpenDataModal,
  onTriggerCelebration,
}) => {
  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.brandSubtitle}>PREFERENCES & PROFILE</Text>
        <Text style={styles.title}>Settings</Text>
      </View>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.profileAvatar}>
          <Ionicons name="person" size={28} color="#FFFFFF" />
        </View>

        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{settings.userName || 'Fitness Champion'}</Text>
          <Text style={styles.profileStats}>
            {settings.userWeightKg} kg · {settings.userHeightCm} cm · {settings.userAge} yrs
          </Text>
          <View style={styles.goalTag}>
            <Text style={styles.goalTagText}>
              Goal: {settings.goal === 'lose' ? 'Fat Loss' : settings.goal === 'gain' ? 'Muscle Building' : 'Maintain'}
            </Text>
          </View>
        </View>
      </View>

      {/* Personalized Nutrition Calculator Button */}
      <Pressable style={styles.calculatorCard} onPress={onOpenGoalsModal}>
        <View style={styles.calculatorLeft}>
          <View style={styles.calcIcon}>
            <Ionicons name="calculator-outline" size={22} color={Colors.primary} />
          </View>
          <View>
            <Text style={styles.calcTitle}>Personalized Goals Calculator</Text>
            <Text style={styles.calcSub}>
              Recalculate BMR, TDEE, & protein based on your metrics
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={Colors.primary} />
      </Pressable>

      {/* Active Targets Grid */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active Daily Targets</Text>
          <Pressable onPress={onOpenGoalsModal}>
            <Text style={styles.editText}>Edit</Text>
          </Pressable>
        </View>

        <View style={styles.targetsGrid}>
          <View style={styles.targetCard}>
            <Text style={styles.targetLabel}>Protein Goal</Text>
            <Text style={[styles.targetValue, { color: Colors.primaryDark }]}>
              {settings.proteinTarget} <Text style={styles.targetUnit}>g</Text>
            </Text>
            <Text style={styles.targetSub}>Muscle growth</Text>
          </View>

          <View style={styles.targetCard}>
            <Text style={styles.targetLabel}>Calorie Goal</Text>
            <Text style={[styles.targetValue, { color: '#C2410C' }]}>
              {settings.calorieTarget} <Text style={styles.targetUnit}>kcal</Text>
            </Text>
            <Text style={styles.targetSub}>Daily energy</Text>
          </View>

          <View style={styles.targetCard}>
            <Text style={styles.targetLabel}>Carbs Goal</Text>
            <Text style={[styles.targetValue, { color: '#1D4ED8' }]}>
              {settings.carbsTarget} <Text style={styles.targetUnit}>g</Text>
            </Text>
            <Text style={styles.targetSub}>Daily stamina</Text>
          </View>

          <View style={styles.targetCard}>
            <Text style={styles.targetLabel}>Fat Goal</Text>
            <Text style={[styles.targetValue, { color: '#6D28D9' }]}>
              {settings.fatTarget} <Text style={styles.targetUnit}>g</Text>
            </Text>
            <Text style={styles.targetSub}>Hormone balance</Text>
          </View>

          <View style={[styles.targetCard, { width: '100%' }]}>
            <Text style={styles.targetLabel}>Water Hydration Goal</Text>
            <Text style={[styles.targetValue, { color: '#0369A1' }]}>
              {settings.waterTarget} <Text style={styles.targetUnit}>ml / day</Text>
            </Text>
            <Text style={styles.targetSub}>
              (~{Math.round(settings.waterTarget / 250)} standard glasses)
            </Text>
          </View>
        </View>
      </View>

      {/* Feature Demos & Utilities */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Tools & Data</Text>

        <Pressable style={styles.toolRow} onPress={onOpenDataModal}>
          <View style={[styles.toolIcon, { backgroundColor: '#E0F2FE' }]}>
            <Ionicons name="server-outline" size={20} color="#0284C7" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.toolTitle}>Data Management & Backups</Text>
            <Text style={styles.toolSub}>
              Export JSON, import backups, replenish Indian foods, or reset data
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
        </Pressable>

        <Pressable style={styles.toolRow} onPress={onTriggerCelebration}>
          <View style={[styles.toolIcon, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="sparkles" size={20} color="#D97706" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.toolTitle}>Preview Celebration Effect</Text>
            <Text style={styles.toolSub}>
              Test the Duolingo-like confetti and goal completion animation
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
        </Pressable>
      </View>

      {/* Privacy Guarantee */}
      <View style={styles.privacyCard}>
        <Ionicons name="shield-checkmark" size={24} color={Colors.primary} />
        <View style={{ flex: 1 }}>
          <Text style={styles.privacyTitle}>100% Private & Local Storage</Text>
          <Text style={styles.privacyText}>
            All your foods, meal plans, logs, and personal goals are stored exclusively inside your phone's SQLite database. No tracking, no external servers, and zero internet required.
          </Text>
        </View>
      </View>

      <Text style={styles.versionText}>Protein Tracker v1.0.0 · Offline Local-First</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 18,
    paddingBottom: 90,
    gap: 16,
  },
  header: {
    paddingTop: 8,
    paddingBottom: 4,
  },
  brandSubtitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: Colors.primary,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.ink,
    letterSpacing: -0.5,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EEF2EC',
    ...Shadows.soft,
  },
  profileAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.ink,
  },
  profileStats: {
    fontSize: 12,
    color: Colors.muted,
    marginTop: 2,
  },
  goalTag: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 6,
  },
  goalTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  calculatorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0FBF5',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#D1F0E0',
  },
  calculatorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  calcIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calcTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  calcSub: {
    fontSize: 11,
    color: Colors.muted,
    marginTop: 2,
    paddingRight: 10,
  },
  section: {
    gap: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.ink,
  },
  editText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  targetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  targetCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EEF2EC',
    ...Shadows.soft,
    gap: 3,
  },
  targetLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.muted,
  },
  targetValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  targetUnit: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.muted,
  },
  targetSub: {
    fontSize: 10,
    color: Colors.muted,
  },
  toolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EEF2EC',
    ...Shadows.soft,
  },
  toolIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.ink,
  },
  toolSub: {
    fontSize: 11,
    color: Colors.muted,
    marginTop: 2,
  },
  privacyCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EEF2EC',
    ...Shadows.soft,
    alignItems: 'flex-start',
  },
  privacyTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.ink,
    marginBottom: 4,
  },
  privacyText: {
    fontSize: 11,
    lineHeight: 16,
    color: Colors.muted,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 11,
    color: Colors.muted,
    marginTop: 4,
  },
});
