import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  Modal,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { WaterLog } from '../types';
import { WaterArcGauge, WaterGlassesGrid } from './SvgGauges';
import { Colors, Shadows } from '../theme';

interface WaterTrackerTabProps {
  date: string;
  waterLogs: WaterLog[];
  waterGoal: number;
  onAddWater: (amount: number) => Promise<void>;
  onDeleteWater: (id: number) => Promise<void>;
  onUpdateGoal: (newGoal: number) => Promise<void>;
}

export const WaterTrackerTab: React.FC<WaterTrackerTabProps> = ({
  date,
  waterLogs,
  waterGoal,
  onAddWater,
  onDeleteWater,
  onUpdateGoal,
}) => {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const gaugeSize = Math.min(250, Math.max(190, windowWidth - 90));

  const [selectedQuick, setSelectedQuick] = useState<number>(250);
  const [customModal, setCustomModal] = useState(false);
  const [customAmount, setCustomAmount] = useState('250');
  const [goalModal, setGoalModal] = useState(false);
  const [goalAmount, setGoalAmount] = useState(String(waterGoal));

  const totalWater = waterLogs.reduce((acc, log) => acc + log.amount, 0);
  const percent = Math.round((totalWater / Math.max(1, waterGoal)) * 100);

  const handleQuickAdd = async (amount: number) => {
    await onAddWater(amount);
  };

  const handleCustomSubmit = async () => {
    const val = parseInt(customAmount, 10);
    if (isNaN(val) || val <= 0) {
      Alert.alert('Invalid amount', 'Enter a positive water amount in ml.');
      return;
    }
    await onAddWater(val);
    setCustomModal(false);
  };

  const handleGoalSubmit = async () => {
    const val = parseInt(goalAmount, 10);
    if (isNaN(val) || val <= 500) {
      Alert.alert('Invalid goal', 'Please enter a daily goal of at least 500 ml.');
      return;
    }
    await onUpdateGoal(val);
    setGoalModal(false);
  };

  const getHydrationEmoji = () => {
    if (percent >= 100) return '💧';
    if (percent >= 70) return '😊';
    if (percent >= 40) return '😐';
    return '🥱';
  };

  const getHydrationStatus = () => {
    if (percent >= 100) return 'Fully Hydrated';
    if (percent >= 70) return 'Great Progress';
    if (percent >= 40) return 'Halfway There';
    return 'Needs Water';
  };

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { paddingBottom: 95 + Math.max(insets.bottom, 10) }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Header matching Oasis Reference */}
      <View style={styles.topHeader}>
        <View style={{ flex: 1, minWidth: 0, marginRight: 8 }}>
          <Text style={styles.brandSubtitle}>OASIS HYDRATION</Text>
          <Text style={styles.title} numberOfLines={1}>Drink Tracker</Text>
        </View>

        <Pressable
          style={[styles.editGoalBtn, { flexShrink: 0 }]}
          onPress={() => {
            setGoalAmount(String(waterGoal));
            setGoalModal(true);
          }}
        >
          <Ionicons name="options-outline" size={16} color={Colors.water} />
          <Text style={styles.editGoalText}>Goal: {waterGoal} ml</Text>
        </Pressable>
      </View>

      {/* Large Oasis-style Circular Arc Gauge */}
      <View style={styles.gaugeCard}>
        <WaterArcGauge consumed={totalWater} goal={waterGoal} size={gaugeSize} />

        {/* Stats summary row */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Today</Text>
            <Text
              style={styles.statValue}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.75}
            >
              {totalWater} ml
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Daily Goal</Text>
            <Text
              style={styles.statValue}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.75}
            >
              {waterGoal} ml
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Status</Text>
            <Text
              style={styles.statValue}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.75}
            >
              {getHydrationEmoji()} {getHydrationStatus()}
            </Text>
          </View>
        </View>
      </View>

      {/* Visual Glasses Progress */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Daily Glasses (250 ml)</Text>
          <Text style={styles.sectionSub}>
            {Math.floor(totalWater / 250)} of {Math.ceil(waterGoal / 250)} glasses
          </Text>
        </View>
        <WaterGlassesGrid consumedMl={totalWater} goalMl={waterGoal} glassSizeMl={250} />
      </View>

      {/* Quick Add Selector matching Page 5 Reference */}
      <View style={styles.quickSelectorSection}>
        <Text style={styles.quickLabel}>Select Portion Size</Text>
        <View style={styles.quickRow}>
          {[100, 200, 250, 500].map(amount => {
            const isSelected = selectedQuick === amount;
            return (
              <Pressable
                key={amount}
                style={[styles.quickPill, isSelected && styles.quickPillSelected]}
                onPress={() => setSelectedQuick(amount)}
              >
                <Text
                  style={[styles.quickPillAmount, isSelected && styles.quickPillAmountSelected]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.7}
                >
                  {amount}
                </Text>
                <Text style={[styles.quickPillUnit, isSelected && styles.quickPillUnitSelected]}>
                  ml
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Main Action Buttons */}
        <View style={styles.actionButtonsRow}>
          <Pressable
            style={styles.customAddBtn}
            onPress={() => {
              setCustomAmount(String(selectedQuick));
              setCustomModal(true);
            }}
          >
            <Ionicons name="create-outline" size={18} color="#0284C7" />
            <Text style={styles.customAddText} numberOfLines={1}>Custom</Text>
          </Pressable>

          <Pressable
            style={styles.mainDrinkBtn}
            onPress={() => handleQuickAdd(selectedQuick)}
          >
            <Ionicons name="add" size={22} color="#FFFFFF" />
            <Text style={styles.mainDrinkText} numberOfLines={1}>+ Log {selectedQuick} ml</Text>
          </Pressable>
        </View>
      </View>

      {/* Log History */}
      <View style={styles.logsCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Water Entries</Text>
          <Text style={styles.sectionSub}>{waterLogs.length} logs</Text>
        </View>

        {waterLogs.length === 0 ? (
          <View style={styles.emptyLogs}>
            <Ionicons name="water-outline" size={32} color="#94A3B8" />
            <Text style={styles.emptyText}>No water logged yet for today.</Text>
            <Text style={styles.emptySub}>Tap a button above to track your first glass.</Text>
          </View>
        ) : (
          waterLogs.map(log => (
            <View key={log.id} style={styles.logRow}>
              <View style={styles.logLeft}>
                <View style={styles.logIcon}>
                  <Ionicons name="water" size={16} color="#0284C7" />
                </View>
                <View>
                  <Text style={styles.logAmount}>+{log.amount} ml</Text>
                  <Text style={styles.logTime}>{log.time || 'Logged'}</Text>
                </View>
              </View>

              <Pressable
                style={styles.deleteBtn}
                onPress={() => onDeleteWater(log.id)}
                hitSlop={10}
              >
                <Ionicons name="trash-outline" size={18} color="#94A3B8" />
              </Pressable>
            </View>
          ))
        )}
      </View>

      {/* Custom Amount Modal */}
      <Modal visible={customModal} transparent animationType="fade" onRequestClose={() => setCustomModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.simpleModalCard}>
            <Text style={styles.simpleModalTitle}>Log Custom Water</Text>
            <Text style={styles.simpleModalSub}>Enter exact amount in milliliters (ml)</Text>
            <TextInput
              value={customAmount}
              onChangeText={setCustomAmount}
              keyboardType="numeric"
              style={styles.simpleInput}
              autoFocus
            />
            <View style={styles.modalBtnsRow}>
              <Pressable style={styles.cancelBtn} onPress={() => setCustomModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.confirmBtn} onPress={handleCustomSubmit}>
                <Text style={styles.confirmBtnText}>Add Water</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Daily Goal Modal */}
      <Modal visible={goalModal} transparent animationType="fade" onRequestClose={() => setGoalModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.simpleModalCard}>
            <Text style={styles.simpleModalTitle}>Daily Water Goal</Text>
            <Text style={styles.simpleModalSub}>Standard recommendation: 2000 - 3500 ml</Text>
            <TextInput
              value={goalAmount}
              onChangeText={setGoalAmount}
              keyboardType="numeric"
              style={styles.simpleInput}
              autoFocus
            />
            <View style={styles.modalBtnsRow}>
              <Pressable style={styles.cancelBtn} onPress={() => setGoalModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.confirmBtn} onPress={handleGoalSubmit}>
                <Text style={styles.confirmBtnText}>Save Goal</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 18,
    paddingBottom: 90,
    gap: 14,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 4,
  },
  brandSubtitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: '#0284C7',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.ink,
    letterSpacing: -0.5,
  },
  editGoalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  editGoalText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0369A1',
  },
  gaugeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E6EFF5',
    ...Shadows.soft,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F6FA',
    marginTop: 8,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.ink,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E6EFF5',
    ...Shadows.soft,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.ink,
  },
  sectionSub: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  quickSelectorSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E6EFF5',
    ...Shadows.soft,
    gap: 12,
  },
  quickLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  quickRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  quickPill: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  quickPillSelected: {
    backgroundColor: '#E0F2FE',
    borderColor: '#0284C7',
  },
  quickPillAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.ink,
  },
  quickPillAmountSelected: {
    color: '#0284C7',
  },
  quickPillUnit: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: 2,
  },
  quickPillUnitSelected: {
    color: '#0369A1',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  customAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F0F9FF',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  customAddText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0284C7',
  },
  mainDrinkBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#0284C7',
    paddingVertical: 14,
    borderRadius: 16,
    ...Shadows.glow('#0284C7'),
  },
  mainDrinkText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  logsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E6EFF5',
    ...Shadows.soft,
    gap: 10,
  },
  emptyLogs: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 6,
  },
  emptyText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.ink,
  },
  emptySub: {
    fontSize: 11,
    color: Colors.muted,
  },
  logRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  logLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logAmount: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.ink,
  },
  logTime: {
    fontSize: 11,
    color: '#94A3B8',
  },
  deleteBtn: {
    padding: 6,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  simpleModalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    ...Shadows.floating,
  },
  simpleModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.ink,
  },
  simpleModalSub: {
    fontSize: 12,
    color: Colors.muted,
    marginTop: 4,
    marginBottom: 16,
  },
  simpleInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 18,
    fontWeight: '700',
    color: Colors.ink,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalBtnsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: '#0284C7',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  confirmBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
