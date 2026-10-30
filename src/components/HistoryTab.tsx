import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { DayHistory } from '../types';
import { Colors, Shadows } from '../theme';

interface HistoryTabProps {
  history: DayHistory[];
  weekly: DayHistory[];
  proteinTarget: number;
  calorieTarget: number;
  waterTarget: number;
  onSelectDate: (date: string) => void;
}

export const HistoryTab: React.FC<HistoryTabProps> = ({
  history,
  weekly,
  proteinTarget,
  calorieTarget,
  waterTarget,
  onSelectDate,
}) => {
  const insets = useSafeAreaInsets();

  // Weekly averages
  const weeklyAverages = useMemo(() => {
    if (!weekly.length) return { protein: 0, calories: 0, water: 0, count: 0 };
    const daysWithData = weekly.filter(d => d.entries > 0 || d.water > 0);
    const count = Math.max(1, daysWithData.length);
    const totalP = daysWithData.reduce((s, d) => s + d.protein, 0);
    const totalC = daysWithData.reduce((s, d) => s + d.calories, 0);
    const totalW = daysWithData.reduce((s, d) => s + d.water, 0);

    return {
      protein: Math.round((totalP / count) * 10) / 10,
      calories: Math.round(totalC / count),
      water: Math.round(totalW / count),
      count: daysWithData.length,
    };
  }, [weekly]);

  const maxWeeklyProtein = Math.max(proteinTarget * 1.1, ...weekly.map(w => w.protein));

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { paddingBottom: 95 + Math.max(insets.bottom, 10) },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.brandSubtitle}>ANALYTICS & ARCHIVE</Text>
        <Text style={styles.title} numberOfLines={1}>Progress History</Text>
      </View>

      {/* This Week Average Cards (Inspired by Page 4 of PDF) */}
      <View style={styles.summarySection}>
        <Text style={styles.sectionHeading}>This Week Average</Text>

        <View style={styles.kpiGrid}>
          {/* Protein KPI */}
          <View style={styles.kpiCard}>
            <View style={[styles.kpiIcon, { backgroundColor: Colors.primaryLight }]}>
              <Ionicons name="barbell" size={18} color={Colors.primary} />
            </View>
            <Text style={styles.kpiLabel}>Avg Protein</Text>
            <Text style={styles.kpiValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75}>
              {weeklyAverages.protein} g
            </Text>
            <Text style={styles.kpiTarget}>Goal: {proteinTarget} g</Text>
          </View>

          {/* Calories KPI */}
          <View style={styles.kpiCard}>
            <View style={[styles.kpiIcon, { backgroundColor: '#FFF2EB' }]}>
              <Ionicons name="flame" size={18} color="#FF6E2E" />
            </View>
            <Text style={styles.kpiLabel}>Avg Calories</Text>
            <Text style={styles.kpiValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75}>
              {weeklyAverages.calories}
            </Text>
            <Text style={styles.kpiTarget}>Goal: {calorieTarget} kcal</Text>
          </View>

          {/* Water KPI */}
          <View style={styles.kpiCard}>
            <View style={[styles.kpiIcon, { backgroundColor: '#E0F2FE' }]}>
              <Ionicons name="water" size={18} color="#0284C7" />
            </View>
            <Text style={styles.kpiLabel}>Avg Water</Text>
            <Text style={styles.kpiValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75}>
              {weeklyAverages.water} ml
            </Text>
            <Text style={styles.kpiTarget}>Goal: {waterTarget} ml</Text>
          </View>

          {/* Active Days KPI */}
          <View style={styles.kpiCard}>
            <View style={[styles.kpiIcon, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="calendar" size={18} color="#D97706" />
            </View>
            <Text style={styles.kpiLabel}>Active Days</Text>
            <Text style={styles.kpiValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75}>
              {weeklyAverages.count} / 7
            </Text>
            <Text style={styles.kpiTarget}>Consistency</Text>
          </View>
        </View>
      </View>

      {/* 7-Day Protein Bar Chart */}
      <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>7-Day Protein Consistency</Text>
          <Text style={styles.chartSub}>Target: {proteinTarget}g</Text>
        </View>

        <View style={styles.chartBarsContainer}>
          {weekly.map((d, index) => {
            const heightPct = Math.min(100, Math.round((d.protein / Math.max(1, maxWeeklyProtein)) * 100));
            const metTarget = d.protein >= proteinTarget;
            const dateObj = new Date(`${d.date}T12:00:00`);
            const dayLabel = dateObj.toLocaleDateString(undefined, { weekday: 'narrow' });

            return (
              <Pressable
                key={d.date}
                style={styles.barColumn}
                onPress={() => onSelectDate(d.date)}
              >
                <Text style={styles.barValText}>{d.protein > 0 ? Math.round(d.protein) : ''}</Text>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      { height: `${Math.max(6, heightPct)}%` },
                      metTarget ? styles.barFillTargetMet : styles.barFillStandard,
                    ]}
                  />
                </View>
                <Text style={styles.barDayText}>{dayLabel}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Daily Records List */}
      <View style={styles.historyListSection}>
        <Text style={styles.sectionHeading}>Daily Records</Text>
        <Text style={styles.mutedText}>Tap any day to view or edit that date's log</Text>

        {history.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Your tracking journey starts today</Text>
            <Text style={styles.mutedText}>Daily summaries will appear here once you log meals or water.</Text>
          </View>
        ) : (
          history.map(item => {
            const dateObj = new Date(`${item.date}T12:00:00`);
            const formattedDate = dateObj.toLocaleDateString(undefined, {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            });
            const proteinGoalMet = item.protein >= proteinTarget;

            return (
              <Pressable
                key={item.date}
                style={styles.historyRow}
                onPress={() => onSelectDate(item.date)}
              >
                <View style={[styles.rowLeft, { flex: 1, minWidth: 0, marginRight: 8 }]}>
                  <View
                    style={[
                      styles.dateIconCircle,
                      proteinGoalMet && styles.dateIconCircleMet,
                    ]}
                  >
                    <Ionicons
                      name={proteinGoalMet ? 'checkmark' : 'calendar-outline'}
                      size={18}
                      color={proteinGoalMet ? Colors.primary : Colors.muted}
                    />
                  </View>

                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.rowDateTitle} numberOfLines={1}>{formattedDate}</Text>
                    <Text style={styles.rowEntriesSub} numberOfLines={1}>
                      {item.entries} meals · {item.water} ml water
                    </Text>
                  </View>
                </View>

                <View style={[styles.rowRight, { flexShrink: 0 }]}>
                  <View style={styles.metricItem}>
                    <Text
                      style={[
                        styles.metricNumber,
                        proteinGoalMet && { color: Colors.primaryDark },
                      ]}
                      numberOfLines={1}
                    >
                      {item.protein}g
                    </Text>
                    <Text style={styles.metricSub}>Protein</Text>
                  </View>

                  <View style={styles.metricItem}>
                    <Text style={styles.metricNumber} numberOfLines={1}>{Math.round(item.calories)}</Text>
                    <Text style={styles.metricSub}>kcal</Text>
                  </View>

                  <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
                </View>
              </Pressable>
            );
          })
        )}
      </View>
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
  summarySection: {
    gap: 10,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.ink,
  },
  mutedText: {
    fontSize: 12,
    color: Colors.muted,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  kpiCard: {
    flexBasis: '47%',
    flexGrow: 1,
    minWidth: 140,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EEF2EC',
    ...Shadows.soft,
    gap: 4,
  },
  kpiIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  kpiLabel: {
    fontSize: 11,
    color: Colors.muted,
    fontWeight: '600',
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.ink,
  },
  kpiTarget: {
    fontSize: 10,
    color: Colors.muted,
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#EEF2EC',
    ...Shadows.soft,
    gap: 14,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.ink,
  },
  chartSub: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  chartBarsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 140,
    paddingTop: 16,
    paddingBottom: 4,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
    gap: 6,
  },
  barValText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.inkSecondary,
    height: 12,
  },
  barTrack: {
    width: 14,
    height: 90,
    backgroundColor: '#F1F5F0',
    borderRadius: 8,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 8,
  },
  barFillStandard: {
    backgroundColor: '#86B049',
  },
  barFillTargetMet: {
    backgroundColor: Colors.primary,
  },
  barDayText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.muted,
  },
  historyListSection: {
    gap: 10,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEF2EC',
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.ink,
    marginBottom: 4,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EEF2EC',
    ...Shadows.soft,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dateIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: '#F3F6F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateIconCircleMet: {
    backgroundColor: Colors.primaryLight,
  },
  rowDateTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.ink,
  },
  rowEntriesSub: {
    fontSize: 11,
    color: Colors.muted,
    marginTop: 2,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  metricItem: {
    alignItems: 'flex-end',
  },
  metricNumber: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.ink,
  },
  metricSub: {
    fontSize: 10,
    color: Colors.muted,
  },
});
