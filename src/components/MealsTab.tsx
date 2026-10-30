import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Food, Meal, MealItem, MealType } from '../types';
import { Colors, Shadows } from '../theme';

interface MealsTabProps {
  meals: Meal[];
  foods: Food[];
  onSaveMeal: (id: number | undefined, name: string, items: MealItem[]) => Promise<void>;
  onDeleteMeal: (id: number) => Promise<void>;
  onLogMeal: (meal: Meal, mealType: MealType) => Promise<void>;
}

export const MealsTab: React.FC<MealsTabProps> = ({
  meals,
  foods,
  onSaveMeal,
  onDeleteMeal,
  onLogMeal,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [draftId, setDraftId] = useState<number | undefined>(undefined);
  const [draftName, setDraftName] = useState('');
  const [draftItems, setDraftItems] = useState<MealItem[]>([]);
  const [foodSearch, setFoodSearch] = useState('');

  // Log meal selector modal
  const [logMealTarget, setLogMealTarget] = useState<Meal | null>(null);
  const [chosenMealType, setChosenMealType] = useState<MealType>('lunch');

  const openCreateMeal = () => {
    setDraftId(undefined);
    setDraftName('');
    setDraftItems([]);
    setFoodSearch('');
    setModalVisible(true);
  };

  const openEditMeal = (m: Meal) => {
    setDraftId(m.id);
    setDraftName(m.name);
    setDraftItems(m.items.map(i => ({ ...i })));
    setFoodSearch('');
    setModalVisible(true);
  };

  const toggleFoodItem = (f: Food) => {
    const existing = draftItems.find(i => i.foodId === f.id);
    if (existing) {
      setDraftItems(draftItems.filter(i => i.foodId !== f.id));
    } else {
      setDraftItems([
        ...draftItems,
        {
          foodId: f.id,
          name: f.name,
          serving: f.serving,
          protein: f.protein,
          calories: f.calories,
          carbs: f.carbs || 0,
          fat: f.fat || 0,
          quantity: 1,
        },
      ]);
    }
  };

  const updateQuantity = (foodId: number, qtyStr: string) => {
    const q = Math.max(0.1, parseFloat(qtyStr) || 0.1);
    setDraftItems(
      draftItems.map(i => (i.foodId === foodId ? { ...i, quantity: q } : i))
    );
  };

  const handleSave = async () => {
    if (!draftName.trim()) {
      Alert.alert('Meal Name Required', 'Please enter a name for this meal combo.');
      return;
    }
    if (draftItems.length === 0) {
      Alert.alert('No Foods Added', 'Please select at least one food for this meal.');
      return;
    }

    await onSaveMeal(draftId, draftName.trim(), draftItems);
    setModalVisible(false);
  };

  const handleDelete = (m: Meal) => {
    Alert.alert(
      'Delete Meal Template?',
      `Delete "${m.name}"? Past logs containing this meal will remain intact.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await onDeleteMeal(m.id);
          },
        },
      ]
    );
  };

  const handleConfirmLog = async () => {
    if (!logMealTarget) return;
    await onLogMeal(logMealTarget, chosenMealType);
    setLogMealTarget(null);
    Alert.alert('Added to today', `${logMealTarget.name} was logged as ${chosenMealType}.`);
  };

  const draftTotals = draftItems.reduce(
    (acc, i) => ({
      protein: acc.protein + i.protein * i.quantity,
      calories: acc.calories + i.calories * i.quantity,
      carbs: acc.carbs + i.carbs * i.quantity,
      fat: acc.fat + i.fat * i.quantity,
    }),
    { protein: 0, calories: 0, carbs: 0, fat: 0 }
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Saved Meals</Text>
          <Text style={styles.subtitle}>
            {meals.length} multi-item combo templates
          </Text>
        </View>

        <Pressable style={styles.addBtn} onPress={openCreateMeal}>
          <Ionicons name="add" size={18} color="#FFFFFF" />
          <Text style={styles.addBtnText}>Create Meal</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollList} showsVerticalScrollIndicator={false}>
        {meals.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="fast-food-outline" size={44} color="#A2B0A6" />
            <Text style={styles.emptyTitle}>No saved meals yet</Text>
            <Text style={styles.emptySub}>
              Group your go-to breakfasts, lunches, or protein shakes into a single combo for fast 1-tap logging.
            </Text>
            <Pressable style={styles.emptyBtn} onPress={openCreateMeal}>
              <Text style={styles.emptyBtnText}>+ Create Your First Meal</Text>
            </Pressable>
          </View>
        ) : (
          meals.map(m => {
            const p = m.items.reduce((s, i) => s + i.protein * i.quantity, 0);
            const c = m.items.reduce((s, i) => s + i.calories * i.quantity, 0);

            return (
              <View key={m.id} style={styles.mealCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderLeft}>
                    <View style={styles.comboIcon}>
                      <Ionicons name="fast-food" size={18} color={Colors.primary} />
                    </View>
                    <View>
                      <Text style={styles.mealName}>{m.name}</Text>
                      <Text style={styles.mealCount}>
                        {m.items.length} {m.items.length === 1 ? 'ingredient' : 'ingredients'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.cardActions}>
                    <Pressable
                      style={styles.iconBtn}
                      onPress={() => openEditMeal(m)}
                      hitSlop={8}
                    >
                      <Ionicons name="create-outline" size={18} color={Colors.muted} />
                    </Pressable>
                    <Pressable
                      style={styles.iconBtn}
                      onPress={() => handleDelete(m)}
                      hitSlop={8}
                    >
                      <Ionicons name="trash-outline" size={18} color={Colors.muted} />
                    </Pressable>
                  </View>
                </View>

                {/* Items preview */}
                <View style={styles.itemsList}>
                  {m.items.map((item, idx) => (
                    <Text key={idx} style={styles.itemLine}>
                      • {item.name} <Text style={styles.itemQty}>× {item.quantity}</Text>
                    </Text>
                  ))}
                </View>

                {/* Bottom row with nutrition totals & Log button */}
                <View style={styles.cardFooter}>
                  <View style={styles.totalsWrap}>
                    <Text style={styles.totalProtein}>
                      {Math.round(p * 10) / 10}g Protein
                    </Text>
                    <Text style={styles.totalCalories}>{Math.round(c)} kcal</Text>
                  </View>

                  <Pressable
                    style={styles.logNowBtn}
                    onPress={() => {
                      setLogMealTarget(m);
                      setChosenMealType('lunch');
                    }}
                  >
                    <Ionicons name="add" size={16} color="#FFFFFF" />
                    <Text style={styles.logNowBtnText}>Log to Today</Text>
                  </Pressable>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Create / Edit Meal Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.modalContainer}
          >
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{draftId ? 'Edit Meal' : 'Create Meal'}</Text>
                <Pressable onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                  <Ionicons name="close" size={24} color={Colors.ink} />
                </Pressable>
              </View>

              <ScrollView contentContainerStyle={styles.formScroll} keyboardShouldPersistTaps="handled">
                <Text style={styles.inputLabel}>Meal Combo Name</Text>
                <TextInput
                  value={draftName}
                  onChangeText={setDraftName}
                  placeholder="e.g. Post-Workout Shake, Desi Breakfast"
                  placeholderTextColor="#9CA39A"
                  style={styles.input}
                />

                <Text style={styles.inputLabel}>Select Foods from Library</Text>
                <TextInput
                  value={foodSearch}
                  onChangeText={setFoodSearch}
                  placeholder="Filter foods..."
                  placeholderTextColor="#9CA39A"
                  style={[styles.input, { marginBottom: 8 }]}
                />

                <View style={styles.foodPickerContainer}>
                  {foods
                    .filter(f => f.name.toLowerCase().includes(foodSearch.toLowerCase()))
                    .map(f => {
                      const selectedItem = draftItems.find(i => i.foodId === f.id);
                      return (
                        <View key={f.id} style={styles.pickerRow}>
                          <Pressable
                            style={[styles.checkbox, selectedItem && styles.checkboxActive]}
                            onPress={() => toggleFoodItem(f)}
                          >
                            {selectedItem && <Ionicons name="checkmark" size={14} color="#FFF" />}
                          </Pressable>

                          <View style={{ flex: 1 }}>
                            <Text style={styles.pickerFoodName}>{f.name}</Text>
                            <Text style={styles.pickerFoodSub}>
                              {f.protein}g protein · {f.calories} kcal per {f.serving}
                            </Text>
                          </View>

                          {selectedItem && (
                            <View style={styles.qtyContainer}>
                              <Text style={styles.qtyLabel}>Qty:</Text>
                              <TextInput
                                value={String(selectedItem.quantity)}
                                onChangeText={v => updateQuantity(f.id, v)}
                                keyboardType="decimal-pad"
                                style={styles.qtyInput}
                              />
                            </View>
                          )}
                        </View>
                      );
                    })}
                </View>

                {/* Draft Totals */}
                <View style={styles.draftTotalsCard}>
                  <Text style={styles.draftTotalsTitle}>
                    {Math.round(draftTotals.protein * 10) / 10}g Protein · {Math.round(draftTotals.calories)} kcal
                  </Text>
                  <Text style={styles.draftTotalsSub}>
                    Calculated across {draftItems.length} selected items
                  </Text>
                </View>

                <Pressable style={styles.saveSubmitBtn} onPress={handleSave}>
                  <Text style={styles.saveSubmitBtnText}>Save Meal Template</Text>
                </Pressable>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Log Meal Slot Modal */}
      <Modal visible={!!logMealTarget} transparent animationType="fade" onRequestClose={() => setLogMealTarget(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.slotCard}>
            <Text style={styles.slotTitle}>Log "{logMealTarget?.name}"</Text>
            <Text style={styles.slotSub}>Choose which meal slot to log this under:</Text>

            <View style={styles.slotRow}>
              {[
                { id: 'breakfast', label: 'Breakfast' },
                { id: 'lunch', label: 'Lunch' },
                { id: 'dinner', label: 'Dinner' },
                { id: 'snack', label: 'Snack' },
              ].map(m => (
                <Pressable
                  key={m.id}
                  onPress={() => setChosenMealType(m.id as MealType)}
                  style={[
                    styles.slotBtn,
                    chosenMealType === m.id && styles.slotBtnActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.slotBtnText,
                      chosenMealType === m.id && styles.slotBtnTextActive,
                    ]}
                  >
                    {m.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.slotActionBtns}>
              <Pressable style={styles.slotCancel} onPress={() => setLogMealTarget(null)}>
                <Text style={styles.slotCancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.slotConfirm} onPress={handleConfirmLog}>
                <Text style={styles.slotConfirmText}>Add to Today</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 18,
    paddingBottom: 78,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.ink,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 11,
    color: Colors.muted,
    marginTop: 2,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  scrollList: {
    paddingBottom: 24,
    gap: 12,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEF2EC',
    ...Shadows.soft,
    gap: 10,
    marginTop: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.ink,
  },
  emptySub: {
    fontSize: 12,
    color: Colors.muted,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 12,
  },
  emptyBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 6,
  },
  emptyBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  mealCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EEF2EC',
    ...Shadows.soft,
    gap: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  comboIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealName: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.ink,
  },
  mealCount: {
    fontSize: 11,
    color: Colors.muted,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 6,
  },
  iconBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#F8FAF8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemsList: {
    paddingLeft: 6,
    gap: 4,
  },
  itemLine: {
    fontSize: 12,
    color: Colors.inkSecondary,
  },
  itemQty: {
    fontWeight: '700',
    color: Colors.muted,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F6F2',
  },
  totalsWrap: {
    gap: 2,
  },
  totalProtein: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  totalCalories: {
    fontSize: 11,
    color: Colors.muted,
  },
  logNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
  },
  logNowBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 18, 0.45)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    width: '100%',
    maxHeight: '92%',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 20,
    paddingBottom: 28,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2EC',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.ink,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F3F5F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formScroll: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 8,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.ink,
    marginTop: 6,
  },
  input: {
    backgroundColor: '#F8FAF8',
    borderWidth: 1,
    borderColor: '#E6EBE4',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.ink,
  },
  foodPickerContainer: {
    maxHeight: 220,
    borderWidth: 1,
    borderColor: '#E6EBE4',
    borderRadius: 14,
    padding: 10,
    backgroundColor: '#F8FAF8',
    marginBottom: 8,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2EC',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#B4BFB2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  pickerFoodName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.ink,
  },
  pickerFoodSub: {
    fontSize: 10,
    color: Colors.muted,
  },
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  qtyLabel: {
    fontSize: 11,
    color: Colors.muted,
  },
  qtyInput: {
    width: 48,
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    backgroundColor: '#FFF',
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '700',
  },
  draftTotalsCard: {
    backgroundColor: '#F0FBF5',
    padding: 12,
    borderRadius: 14,
    alignItems: 'center',
    marginVertical: 4,
  },
  draftTotalsTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  draftTotalsSub: {
    fontSize: 11,
    color: Colors.muted,
    marginTop: 2,
  },
  saveSubmitBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  saveSubmitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  slotCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    width: '90%',
    maxWidth: 360,
    alignSelf: 'center',
    ...Shadows.floating,
    gap: 12,
  },
  slotTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.ink,
  },
  slotSub: {
    fontSize: 12,
    color: Colors.muted,
  },
  slotRow: {
    flexDirection: 'row',
    gap: 6,
  },
  slotBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F8FAF8',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E6EBE4',
  },
  slotBtnActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  slotBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.inkSecondary,
  },
  slotBtnTextActive: {
    color: Colors.primaryDark,
    fontWeight: '800',
  },
  slotActionBtns: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  slotCancel: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  slotCancelText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  slotConfirm: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  slotConfirmText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
