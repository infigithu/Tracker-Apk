import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Modal,
  TextInput,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LogEntry, Food, Meal, UserSettings, MealType } from '../types';
import { CalorieRadialGauge, MacroCard } from './SvgGauges';
import { Colors, Shadows } from '../theme';
import { todayKey } from '../db';

interface DashboardTabProps {
  date: string;
  logs: LogEntry[];
  waterTotal: number;
  targets: UserSettings;
  foods: Food[];
  meals: Meal[];
  onChangeDate: (delta: number) => void;
  onSetDate: (date: string) => void;
  onAddFoodLog: (food: Food, quantity: number, mealType: MealType) => Promise<void>;
  onAddMealLog: (meal: Meal, mealType: MealType) => Promise<void>;
  onUpdateLogQty: (
    id: number,
    quantity: number,
    proteinPerUnit: number,
    caloriesPerUnit: number,
    carbsPerUnit: number,
    fatPerUnit: number
  ) => Promise<void>;
  onDeleteLog: (id: number) => Promise<void>;
  onOpenProfile: () => void;
  onTriggerCelebrationTest: () => void;
}

const MEAL_SLOTS: { id: MealType; title: string; recCalories: string; icon: any }[] = [
  { id: 'breakfast', title: 'Breakfast', recCalories: '350 - 550 kcal', icon: 'sunny-outline' },
  { id: 'lunch', title: 'Lunch', recCalories: '550 - 750 kcal', icon: 'restaurant-outline' },
  { id: 'dinner', title: 'Dinner', recCalories: '500 - 700 kcal', icon: 'moon-outline' },
  { id: 'snack', title: 'Snacks & Shake', recCalories: '200 - 350 kcal', icon: 'cafe-outline' },
];

export const DashboardTab: React.FC<DashboardTabProps> = ({
  date,
  logs,
  waterTotal,
  targets,
  foods,
  meals,
  onChangeDate,
  onSetDate,
  onAddFoodLog,
  onAddMealLog,
  onUpdateLogQty,
  onDeleteLog,
  onOpenProfile,
  onTriggerCelebrationTest,
}) => {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const gaugeSize = Math.min(270, Math.max(210, windowWidth - 72));

  const isToday = date === todayKey();
  const [activeSlotForAdd, setActiveSlotForAdd] = useState<MealType | null>(null);
  const [modalSearch, setModalSearch] = useState('');

  // Quantity editing modal
  const [editingLog, setEditingLog] = useState<LogEntry | null>(null);
  const [editQtyValue, setEditQtyValue] = useState('1');

  // Compute daily totals
  const totals = logs.reduce(
    (acc, l) => ({
      protein: acc.protein + l.protein,
      calories: acc.calories + l.calories,
      carbs: acc.carbs + (l.carbs || 0),
      fat: acc.fat + (l.fat || 0),
    }),
    { protein: 0, calories: 0, carbs: 0, fat: 0 }
  );

  const openAddForSlot = (slot: MealType) => {
    setActiveSlotForAdd(slot);
    setModalSearch('');
  };

  const handleSelectFood = async (food: Food) => {
    if (!activeSlotForAdd) return;
    await onAddFoodLog(food, 1, activeSlotForAdd);
    setActiveSlotForAdd(null);
  };

  const handleSelectMeal = async (meal: Meal) => {
    if (!activeSlotForAdd) return;
    await onAddMealLog(meal, activeSlotForAdd);
    setActiveSlotForAdd(null);
  };

  const openEditQty = (log: LogEntry) => {
    setEditingLog(log);
    setEditQtyValue(String(log.quantity));
  };

  const handleSaveQty = async () => {
    if (!editingLog) return;
    const q = parseFloat(editQtyValue);
    if (isNaN(q) || q <= 0) {
      Alert.alert('Invalid quantity', 'Please enter a positive quantity.');
      return;
    }

    const baseQty = Math.max(0.001, editingLog.quantity);
    const pPerUnit = editingLog.protein / baseQty;
    const cPerUnit = editingLog.calories / baseQty;
    const carbPerUnit = (editingLog.carbs || 0) / baseQty;
    const fatPerUnit = (editingLog.fat || 0) / baseQty;

    await onUpdateLogQty(editingLog.id, q, pPerUnit, cPerUnit, carbPerUnit, fatPerUnit);
    setEditingLog(null);
  };

  const confirmDeleteEntry = (log: LogEntry) => {
    Alert.alert(
      'Remove Food Entry?',
      `Remove "${log.name}" from today's log?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await onDeleteLog(log.id);
          },
        },
      ]
    );
  };

  const dateObj = new Date(`${date}T12:00:00`);
  const dateFormatted = isToday
    ? 'Today'
    : dateObj.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { paddingBottom: 95 + Math.max(insets.bottom, 10) }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Bar matching Page 1 */}
      <View style={styles.topBar}>
        <Pressable style={styles.userProfileBtn} onPress={onOpenProfile}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={18} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.helloText} numberOfLines={1} ellipsizeMode="tail">
              Hello, {targets.userName || 'Champion'}
            </Text>
            <Text style={styles.streakSub} numberOfLines={1}>
              🔥 {targets.streakCount || 1} day streak
            </Text>
          </View>
        </Pressable>

        <View style={styles.topActions}>
          <Pressable
            style={styles.celebrationTestBtn}
            onPress={onTriggerCelebrationTest}
            hitSlop={8}
          >
            <Ionicons name="sparkles" size={16} color="#F59E0B" />
          </Pressable>

          <Pressable
            style={styles.calendarPill}
            onPress={() => isToday ? null : onSetDate(todayKey())}
          >
            <Ionicons name="calendar-outline" size={14} color={Colors.primary} />
            <Text style={styles.calendarPillText}>{dateFormatted}</Text>
          </Pressable>
        </View>
      </View>

      {/* Date Navigator Bar */}
      <View style={styles.dateNavigator}>
        <Pressable style={styles.dateNavBtn} onPress={() => onChangeDate(-1)}>
          <Ionicons name="chevron-back" size={20} color={Colors.ink} />
        </Pressable>

        <Text style={styles.dateNavText} numberOfLines={1} ellipsizeMode="tail">
          {dateObj.toLocaleDateString(undefined, {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        </Text>

        <Pressable
          style={[styles.dateNavBtn, isToday && { opacity: 0.3 }]}
          onPress={() => onChangeDate(1)}
          disabled={isToday}
        >
          <Ionicons name="chevron-forward" size={20} color={Colors.ink} />
        </Pressable>
      </View>

      {/* Main Energy / Calorie Gauge Card (Page 1 reference) */}
      <View style={styles.gaugeCard}>
        <View style={styles.gaugeHeader}>
          <Text style={styles.gaugeTitle}>Calorie & Protein Summary</Text>
          <Text style={styles.gaugeSub}>Goal: {targets.calorieTarget} kcal</Text>
        </View>

        <CalorieRadialGauge
          consumed={totals.calories}
          target={targets.calorieTarget}
          size={gaugeSize}
          mode="calories"
        />

        {/* 3 Macro indicator cards row */}
        <View style={styles.macrosRow}>
          <MacroCard
            label="Carbs"
            consumed={totals.carbs}
            target={targets.carbsTarget}
            color={Colors.carbs}
            lightColor={Colors.carbsLight}
          />
          <MacroCard
            label="Protein"
            consumed={totals.protein}
            target={targets.proteinTarget}
            color={Colors.protein}
            lightColor={Colors.proteinLight}
          />
          <MacroCard
            label="Fat"
            consumed={totals.fat}
            target={targets.fatTarget}
            color={Colors.fat}
            lightColor={Colors.fatLight}
          />
        </View>
      </View>

      {/* Quick Hydration Glance */}
      <View style={styles.waterGlance}>
        <View style={styles.waterGlanceLeft}>
          <View style={styles.waterDropIcon}>
            <Ionicons name="water" size={18} color="#0284C7" />
          </View>
          <View>
            <Text style={styles.waterGlanceTitle}>Daily Hydration</Text>
            <Text style={styles.waterGlanceSub}>
              {waterTotal} of {targets.waterTarget} ml completed ({Math.round((waterTotal / targets.waterTarget) * 100)}%)
            </Text>
          </View>
        </View>
        <View style={styles.waterBarBg}>
          <View
            style={[
              styles.waterBarFill,
              { width: `${Math.min(100, Math.round((waterTotal / targets.waterTarget) * 100))}%` },
            ]}
          />
        </View>
      </View>

      {/* Today's Meal Plan Section (Matching Page 1 & Page 6) */}
      <View style={styles.mealPlanSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Meal Plan</Text>
          <Text style={styles.sectionSub}>{logs.length} logged items</Text>
        </View>

        {MEAL_SLOTS.map(slot => {
          const slotLogs = logs.filter(l => (l.mealType || 'breakfast') === slot.id);
          const slotProtein = slotLogs.reduce((s, l) => s + l.protein, 0);
          const slotCalories = slotLogs.reduce((s, l) => s + l.calories, 0);

          return (
            <View key={slot.id} style={styles.slotCard}>
              {/* Slot Header */}
              <View style={styles.slotHeader}>
                <View style={[styles.slotHeaderLeft, { flex: 1, minWidth: 0, marginRight: 8 }]}>
                  <View style={styles.slotIconWrap}>
                    <Ionicons name={slot.icon} size={18} color={Colors.primaryDark} />
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.slotTitle} numberOfLines={1}>{slot.title}</Text>
                    <Text style={styles.slotSub} numberOfLines={1}>
                      {slotLogs.length > 0
                        ? `${Math.round(slotProtein * 10) / 10}g protein · ${Math.round(slotCalories)} kcal`
                        : `Recommended ${slot.recCalories}`}
                    </Text>
                  </View>
                </View>

                <Pressable
                  style={styles.addSlotItemBtn}
                  onPress={() => openAddForSlot(slot.id)}
                >
                  <Ionicons name="add" size={18} color={Colors.primary} />
                </Pressable>
              </View>

              {/* Logged Foods for this slot */}
              {slotLogs.length > 0 && (
                <View style={styles.slotItemsList}>
                  {slotLogs.map(item => (
                    <View key={item.id} style={styles.slotItemRow}>
                      <View style={styles.itemBullet} />

                      <Pressable
                        style={{ flex: 1, minWidth: 0 }}
                        onPress={() => openEditQty(item)}
                      >
                        <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                        <Text style={styles.itemServing} numberOfLines={1}>
                          {item.quantity} × {item.serving} ·{' '}
                          <Text style={styles.itemNutrition}>
                            {Math.round(item.protein * 10) / 10}g protein · {Math.round(item.calories)} kcal
                          </Text>
                        </Text>
                      </Pressable>

                      <View style={styles.itemActions}>
                        <Pressable
                          style={styles.editBtn}
                          onPress={() => openEditQty(item)}
                          hitSlop={6}
                        >
                          <Ionicons name="create-outline" size={16} color={Colors.muted} />
                        </Pressable>
                        <Pressable
                          style={styles.deleteBtn}
                          onPress={() => confirmDeleteEntry(item)}
                          hitSlop={6}
                        >
                          <Ionicons name="close-circle-outline" size={18} color="#94A3B8" />
                        </Pressable>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })}
      </View>

      {/* Add Food / Meal Modal */}
      <Modal
        visible={!!activeSlotForAdd}
        animationType="slide"
        transparent
        onRequestClose={() => setActiveSlotForAdd(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.addModalCard}>
            <View style={styles.addModalHeader}>
              <View>
                <Text style={styles.addModalTitle}>Add to {activeSlotForAdd}</Text>
                <Text style={styles.addModalSub}>Select food or saved meal combo</Text>
              </View>
              <Pressable onPress={() => setActiveSlotForAdd(null)} style={styles.closeBtn}>
                <Ionicons name="close" size={22} color={Colors.ink} />
              </Pressable>
            </View>

            <TextInput
              value={modalSearch}
              onChangeText={setModalSearch}
              placeholder="Search foods, dal, chicken, paneer..."
              placeholderTextColor="#94A3B8"
              style={styles.modalSearchInput}
            />

            <ScrollView
              contentContainerStyle={[styles.addModalScroll, { paddingBottom: 35 + insets.bottom }]}
              keyboardShouldPersistTaps="handled"
            >
              {/* Saved Meals quick section */}
              {meals.length > 0 && !modalSearch && (
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionLabel}>Saved Combos</Text>
                  {meals.map(m => {
                    const p = m.items.reduce((s, i) => s + i.protein * i.quantity, 0);
                    const c = m.items.reduce((s, i) => s + i.calories * i.quantity, 0);
                    return (
                      <Pressable
                        key={m.id}
                        style={styles.pickerRow}
                        onPress={() => handleSelectMeal(m)}
                      >
                        <View style={styles.pickerRowIcon}>
                          <Ionicons name="fast-food" size={16} color={Colors.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.pickerName}>{m.name}</Text>
                          <Text style={styles.pickerSub}>
                            {Math.round(p * 10) / 10}g protein · {Math.round(c)} kcal
                          </Text>
                        </View>
                        <Ionicons name="add-circle" size={24} color={Colors.primary} />
                      </Pressable>
                    );
                  })}
                </View>
              )}

              {/* Foods list */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionLabel}>Food Library</Text>
                {foods
                  .filter(f => f.name.toLowerCase().includes(modalSearch.toLowerCase()))
                  .map(f => (
                    <Pressable
                      key={f.id}
                      style={styles.pickerRow}
                      onPress={() => handleSelectFood(f)}
                    >
                      <View style={[styles.pickerRowIcon, { backgroundColor: '#F0F9F3' }]}>
                        <Ionicons name="nutrition" size={16} color={Colors.primary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.pickerName}>{f.name}</Text>
                        <Text style={styles.pickerSub}>
                          {f.protein}g protein · {f.calories} kcal per {f.serving}
                        </Text>
                      </View>
                      <Ionicons name="add-circle" size={24} color={Colors.primary} />
                    </Pressable>
                  ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Adjust Quantity Modal */}
      <Modal
        visible={!!editingLog}
        transparent
        animationType="fade"
        onRequestClose={() => setEditingLog(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.editQtyCard}>
            <Text style={styles.editQtyTitle}>Adjust Serving</Text>
            {editingLog && (
              <>
                <Text style={styles.editQtyName}>{editingLog.name}</Text>
                <Text style={styles.editQtySub}>Serving size: {editingLog.serving}</Text>

                <View style={styles.stepperWrap}>
                  <Pressable
                    style={styles.stepperBtn}
                    onPress={() => {
                      const cur = parseFloat(editQtyValue) || 1;
                      setEditQtyValue(String(Math.max(0.25, Math.round((cur - 0.25) * 100) / 100)));
                    }}
                  >
                    <Ionicons name="remove" size={18} color={Colors.ink} />
                  </Pressable>

                  <TextInput
                    value={editQtyValue}
                    onChangeText={setEditQtyValue}
                    keyboardType="decimal-pad"
                    style={styles.stepperInput}
                  />

                  <Pressable
                    style={styles.stepperBtn}
                    onPress={() => {
                      const cur = parseFloat(editQtyValue) || 1;
                      setEditQtyValue(String(Math.round((cur + 0.25) * 100) / 100));
                    }}
                  >
                    <Ionicons name="add" size={18} color={Colors.ink} />
                  </Pressable>
                </View>

                <View style={styles.qtyModalActions}>
                  <Pressable style={styles.qtyCancelBtn} onPress={() => setEditingLog(null)}>
                    <Text style={styles.qtyCancelText}>Cancel</Text>
                  </Pressable>
                  <Pressable style={styles.qtySaveBtn} onPress={handleSaveQty}>
                    <Text style={styles.qtySaveText}>Save Quantity</Text>
                  </Pressable>
                </View>
              </>
            )}
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
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 4,
  },
  userProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helloText: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.ink,
  },
  streakSub: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF6E2E',
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  celebrationTestBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6EAE4',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  calendarPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  dateNavigator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#EEF2EC',
  },
  dateNavBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#F8FAF8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateNavText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.ink,
  },
  gaugeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EEF2EC',
    ...Shadows.soft,
    alignItems: 'center',
  },
  gaugeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 4,
  },
  gaugeTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.ink,
  },
  gaugeSub: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.muted,
  },
  macrosRow: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
    marginTop: 12,
  },
  waterGlance: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EEF2EC',
    ...Shadows.soft,
    gap: 10,
  },
  waterGlanceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  waterDropIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  waterGlanceTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.ink,
  },
  waterGlanceSub: {
    fontSize: 11,
    color: Colors.muted,
  },
  waterBarBg: {
    height: 6,
    backgroundColor: '#F0F9FF',
    borderRadius: 6,
    overflow: 'hidden',
  },
  waterBarFill: {
    height: '100%',
    backgroundColor: '#0284C7',
    borderRadius: 6,
  },
  mealPlanSection: {
    gap: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.ink,
  },
  sectionSub: {
    fontSize: 11,
    color: Colors.muted,
  },
  slotCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EEF2EC',
    ...Shadows.soft,
    gap: 10,
  },
  slotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  slotHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  slotIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.ink,
  },
  slotSub: {
    fontSize: 11,
    color: Colors.muted,
  },
  addSlotItemBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F6F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotItemsList: {
    borderTopWidth: 1,
    borderTopColor: '#F3F6F2',
    paddingTop: 8,
    gap: 8,
  },
  slotItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
  },
  itemBullet: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.primary,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.ink,
  },
  itemServing: {
    fontSize: 11,
    color: Colors.muted,
  },
  itemNutrition: {
    color: Colors.primaryDark,
    fontWeight: '700',
  },
  itemActions: {
    flexDirection: 'row',
    gap: 6,
  },
  editBtn: {
    padding: 4,
  },
  deleteBtn: {
    padding: 4,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 18, 0.45)',
    justifyContent: 'flex-end',
  },
  addModalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 20,
    paddingBottom: 28,
    maxHeight: '85%',
  },
  addModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  addModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.ink,
    textTransform: 'capitalize',
  },
  addModalSub: {
    fontSize: 11,
    color: Colors.muted,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F5F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSearchInput: {
    backgroundColor: '#F8FAF8',
    borderWidth: 1,
    borderColor: '#E6EAE4',
    borderRadius: 14,
    marginHorizontal: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.ink,
    marginBottom: 10,
  },
  addModalScroll: {
    paddingHorizontal: 20,
    gap: 14,
  },
  modalSection: {
    gap: 6,
  },
  modalSectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.ink,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F6F2',
  },
  pickerRowIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.ink,
  },
  pickerSub: {
    fontSize: 10,
    color: Colors.muted,
  },
  editQtyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '88%',
    maxWidth: 340,
    alignSelf: 'center',
    ...Shadows.floating,
    gap: 8,
  },
  editQtyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.ink,
  },
  editQtyName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  editQtySub: {
    fontSize: 12,
    color: Colors.muted,
  },
  stepperWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    marginVertical: 14,
  },
  stepperBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#F3F6F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperInput: {
    width: 72,
    height: 40,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    color: Colors.ink,
  },
  qtyModalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  qtyCancelBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  qtyCancelText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  qtySaveBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  qtySaveText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
