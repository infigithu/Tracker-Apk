import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  FlatList,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Food, MealType } from '../types';
import { Colors, Shadows } from '../theme';

interface FoodLibraryTabProps {
  foods: Food[];
  onSaveFood: (food: {
    id?: number;
    name: string;
    serving: string;
    protein: number;
    calories: number;
    carbs?: number;
    fat?: number;
    category?: string;
  }) => Promise<void>;
  onDeleteFood: (id: number) => Promise<void>;
  onQuickLog: (food: Food, quantity: number, mealType: MealType) => Promise<void>;
}

const CATEGORIES = [
  'All',
  'High-Protein',
  'Indian Staples',
  'Dairy & Veg',
  'Poultry & Meat',
  'Snacks & Breakfast',
  'Fruits & Salads',
];

export const FoodLibraryTab: React.FC<FoodLibraryTabProps> = ({
  foods,
  onSaveFood,
  onDeleteFood,
  onQuickLog,
}) => {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  // Food Form Modal state
  const [formModal, setFormModal] = useState(false);
  const [draftId, setDraftId] = useState<number | undefined>(undefined);
  const [draftName, setDraftName] = useState('');
  const [draftServing, setDraftServing] = useState('');
  const [draftProtein, setDraftProtein] = useState('');
  const [draftCalories, setDraftCalories] = useState('');
  const [draftCarbs, setDraftCarbs] = useState('');
  const [draftFat, setDraftFat] = useState('');
  const [draftCategory, setDraftCategory] = useState('General');

  // Quick Log Modal state
  const [logModal, setLogModal] = useState(false);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [logQuantity, setLogQuantity] = useState('1');
  const [logMealType, setLogMealType] = useState<MealType>('breakfast');

  const filteredFoods = foods.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      activeCategory === 'All' ||
      f.category.toLowerCase() === activeCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const openAddModal = () => {
    setDraftId(undefined);
    setDraftName('');
    setDraftServing('100 g');
    setDraftProtein('');
    setDraftCalories('');
    setDraftCarbs('');
    setDraftFat('');
    setDraftCategory(activeCategory === 'All' ? 'Indian Staples' : activeCategory);
    setFormModal(true);
  };

  const openEditModal = (f: Food) => {
    setDraftId(f.id);
    setDraftName(f.name);
    setDraftServing(f.serving);
    setDraftProtein(String(f.protein));
    setDraftCalories(String(f.calories));
    setDraftCarbs(String(f.carbs || ''));
    setDraftFat(String(f.fat || ''));
    setDraftCategory(f.category || 'General');
    setFormModal(true);
  };

  const handleSaveFood = async () => {
    if (!draftName.trim() || !draftServing.trim()) {
      Alert.alert('Incomplete Food', 'Please enter a food name and serving size.');
      return;
    }
    const p = parseFloat(draftProtein);
    const c = parseFloat(draftCalories);
    if (isNaN(p) || isNaN(c) || p < 0 || c < 0) {
      Alert.alert('Invalid Nutrition', 'Please enter valid non-negative numbers for protein and calories.');
      return;
    }

    await onSaveFood({
      id: draftId,
      name: draftName.trim(),
      serving: draftServing.trim(),
      protein: p,
      calories: c,
      carbs: parseFloat(draftCarbs) || 0,
      fat: parseFloat(draftFat) || 0,
      category: draftCategory,
    });

    setFormModal(false);
  };

  const handleDeletePrompt = (f: Food) => {
    Alert.alert(
      'Delete Food?',
      `Are you sure you want to remove "${f.name}" from your food library? Historical logs are preserved.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await onDeleteFood(f.id);
          },
        },
      ]
    );
  };

  const openLogDialog = (f: Food) => {
    setSelectedFood(f);
    setLogQuantity('1');
    setLogMealType('breakfast');
    setLogModal(true);
  };

  const handleConfirmLog = async () => {
    if (!selectedFood) return;
    const q = parseFloat(logQuantity);
    if (isNaN(q) || q <= 0) {
      Alert.alert('Invalid quantity', 'Please enter a positive serving quantity.');
      return;
    }

    await onQuickLog(selectedFood, q, logMealType);
    setLogModal(false);
    Alert.alert('Added to today', `${selectedFood.name} logged under ${logMealType}.`);
  };

  return (
    <View style={styles.container}>
      {/* Header matching Page 2 */}
      <View style={styles.header}>
        <View style={{ flex: 1, minWidth: 0, marginRight: 10 }}>
          <Text style={styles.title}>Food Library</Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {foods.length} items · Indian staples & fitness foods
          </Text>
        </View>

        <Pressable style={styles.addBtn} onPress={openAddModal}>
          <Ionicons name="add" size={18} color="#FFFFFF" />
          <Text style={styles.addBtnText}>Add Food</Text>
        </Pressable>
      </View>

      {/* Search Bar matching Page 2 */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={20} color="#94A3B8" />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search healthy food, dal, paneer..."
          placeholderTextColor="#94A3B8"
          style={styles.searchInput}
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color="#94A3B8" />
          </Pressable>
        )}
      </View>

      {/* Horizontal Category Pills */}
      <View style={styles.categoriesWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScroll}
        >
          {CATEGORIES.map(cat => {
            const isSelected = activeCategory === cat;
            return (
              <Pressable
                key={cat}
                onPress={() => setActiveCategory(cat)}
                style={[styles.categoryPill, isSelected && styles.categoryPillActive]}
              >
                <Text
                  style={[
                    styles.categoryPillText,
                    isSelected && styles.categoryPillTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Foods List */}
      <FlatList
        data={filteredFoods}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: 95 + Math.max(insets.bottom, 10) },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="nutrition-outline" size={40} color="#A2B0A6" />
            <Text style={styles.emptyTitle}>No foods found</Text>
            <Text style={styles.emptySub}>
              {search ? 'Try adjusting your search terms' : 'Add custom foods to your library'}
            </Text>
          </View>
        }
        renderItem={({ item: f }) => (
          <View style={styles.foodCard}>
            <View style={styles.cardTop}>
              <View style={[styles.foodInfo, { flex: 1, minWidth: 0, marginRight: 8 }]}>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>{f.category || 'Food'}</Text>
                </View>
                <Text style={styles.foodName} numberOfLines={1}>{f.name}</Text>
                <Text style={styles.servingText} numberOfLines={1}>Serving: {f.serving}</Text>
              </View>

              <View style={[styles.cardActions, { flexShrink: 0 }]}>
                <Pressable
                  style={styles.iconBtn}
                  onPress={() => openEditModal(f)}
                  hitSlop={8}
                >
                  <Ionicons name="create-outline" size={18} color={Colors.muted} />
                </Pressable>
                <Pressable
                  style={styles.iconBtn}
                  onPress={() => handleDeletePrompt(f)}
                  hitSlop={8}
                >
                  <Ionicons name="trash-outline" size={18} color={Colors.muted} />
                </Pressable>
              </View>
            </View>

            {/* Nutrition Badges */}
            <View style={styles.cardBottom}>
              <View style={[styles.macroPills, { marginRight: 8 }]}>
                <View style={[styles.macroBadge, { backgroundColor: '#E8F7EE' }]}>
                  <Text style={[styles.macroBadgeText, { color: Colors.primaryDark }]}>
                    {Math.round(f.protein * 10) / 10}g Protein
                  </Text>
                </View>

                <View style={[styles.macroBadge, { backgroundColor: '#FFF2EB' }]}>
                  <Text style={[styles.macroBadgeText, { color: '#C2410C' }]}>
                    {Math.round(f.calories)} kcal
                  </Text>
                </View>

                {f.carbs > 0 && (
                  <View style={[styles.macroBadge, { backgroundColor: '#EFF6FF' }]}>
                    <Text style={[styles.macroBadgeText, { color: '#1D4ED8' }]}>
                      {Math.round(f.carbs)}g C
                    </Text>
                  </View>
                )}

                {f.fat > 0 && (
                  <View style={[styles.macroBadge, { backgroundColor: '#F5F3FF' }]}>
                    <Text style={[styles.macroBadgeText, { color: '#6D28D9' }]}>
                      {Math.round(f.fat)}g F
                    </Text>
                  </View>
                )}
              </View>

              <Pressable
                style={[styles.quickLogBtn, { flexShrink: 0 }]}
                onPress={() => openLogDialog(f)}
              >
                <Ionicons name="add" size={16} color="#FFFFFF" />
                <Text style={styles.quickLogBtnText}>Log</Text>
              </Pressable>
            </View>
          </View>
        )}
      />

      {/* Add / Edit Food Modal */}
      <Modal visible={formModal} animationType="slide" transparent onRequestClose={() => setFormModal(false)}>
        <View style={styles.modalBackdrop}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.modalContainer}
          >
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{draftId ? 'Edit Food' : 'Add New Food'}</Text>
                <Pressable onPress={() => setFormModal(false)} style={styles.closeBtn}>
                  <Ionicons name="close" size={24} color={Colors.ink} />
                </Pressable>
              </View>

              <ScrollView
                contentContainerStyle={[styles.formScroll, { paddingBottom: 35 + insets.bottom }]}
                keyboardShouldPersistTaps="handled"
              >
                <Text style={styles.inputLabel}>Food Name</Text>
                <TextInput
                  value={draftName}
                  onChangeText={setDraftName}
                  placeholder="e.g. Paneer Bhurji, Soya Curry"
                  placeholderTextColor="#9CA39A"
                  style={styles.input}
                />

                <Text style={styles.inputLabel}>Serving Size</Text>
                <TextInput
                  value={draftServing}
                  onChangeText={setDraftServing}
                  placeholder="e.g. 1 bowl (150 g) or 1 roti"
                  placeholderTextColor="#9CA39A"
                  style={styles.input}
                />

                <View style={styles.macroInputsRow}>
                  <View style={styles.macroCol}>
                    <Text style={styles.inputLabel}>Protein (g)*</Text>
                    <TextInput
                      value={draftProtein}
                      onChangeText={setDraftProtein}
                      keyboardType="decimal-pad"
                      placeholder="18"
                      placeholderTextColor="#9CA39A"
                      style={styles.input}
                    />
                  </View>

                  <View style={styles.macroCol}>
                    <Text style={styles.inputLabel}>Calories (kcal)*</Text>
                    <TextInput
                      value={draftCalories}
                      onChangeText={setDraftCalories}
                      keyboardType="numeric"
                      placeholder="210"
                      placeholderTextColor="#9CA39A"
                      style={styles.input}
                    />
                  </View>
                </View>

                <View style={styles.macroInputsRow}>
                  <View style={styles.macroCol}>
                    <Text style={styles.inputLabel}>Carbs (g)</Text>
                    <TextInput
                      value={draftCarbs}
                      onChangeText={setDraftCarbs}
                      keyboardType="decimal-pad"
                      placeholder="12"
                      placeholderTextColor="#9CA39A"
                      style={styles.input}
                    />
                  </View>

                  <View style={styles.macroCol}>
                    <Text style={styles.inputLabel}>Fat (g)</Text>
                    <TextInput
                      value={draftFat}
                      onChangeText={setDraftFat}
                      keyboardType="decimal-pad"
                      placeholder="6"
                      placeholderTextColor="#9CA39A"
                      style={styles.input}
                    />
                  </View>
                </View>

                <Text style={styles.inputLabel}>Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                  {CATEGORIES.filter(c => c !== 'All').map(c => (
                    <Pressable
                      key={c}
                      onPress={() => setDraftCategory(c)}
                      style={[
                        styles.catChoice,
                        draftCategory === c && styles.catChoiceActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.catChoiceText,
                          draftCategory === c && styles.catChoiceTextActive,
                        ]}
                      >
                        {c}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>

                <Pressable style={styles.saveSubmitBtn} onPress={handleSaveFood}>
                  <Text style={styles.saveSubmitBtnText}>
                    {draftId ? 'Save Changes' : 'Add to Food Library'}
                  </Text>
                </Pressable>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Quick Log Modal */}
      <Modal visible={logModal} transparent animationType="fade" onRequestClose={() => setLogModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.logDialogCard}>
            <View style={styles.dialogHeader}>
              <Text style={styles.dialogTitle}>Log to Daily Tracker</Text>
              <Pressable onPress={() => setLogModal(false)}>
                <Ionicons name="close" size={22} color={Colors.ink} />
              </Pressable>
            </View>

            {selectedFood && (
              <View style={styles.dialogContent}>
                <Text style={styles.dialogFoodName}>{selectedFood.name}</Text>
                <Text style={styles.dialogFoodServing}>
                  Standard: {selectedFood.serving} ({selectedFood.protein}g protein, {selectedFood.calories} kcal)
                </Text>

                <Text style={styles.dialogLabel}>Meal Category</Text>
                <View style={styles.mealTypeRow}>
                  {[
                    { id: 'breakfast', label: 'Breakfast' },
                    { id: 'lunch', label: 'Lunch' },
                    { id: 'dinner', label: 'Dinner' },
                    { id: 'snack', label: 'Snack' },
                  ].map(m => (
                    <Pressable
                      key={m.id}
                      onPress={() => setLogMealType(m.id as MealType)}
                      style={[
                        styles.mealTypeBtn,
                        logMealType === m.id && styles.mealTypeBtnActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.mealTypeBtnText,
                          logMealType === m.id && styles.mealTypeBtnTextActive,
                        ]}
                      >
                        {m.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <Text style={styles.dialogLabel}>Servings / Quantity</Text>
                <View style={styles.quantityStepper}>
                  <Pressable
                    style={styles.stepBtn}
                    onPress={() => {
                      const cur = parseFloat(logQuantity) || 1;
                      setLogQuantity(String(Math.max(0.25, Math.round((cur - 0.25) * 100) / 100)));
                    }}
                  >
                    <Ionicons name="remove" size={18} color={Colors.ink} />
                  </Pressable>

                  <TextInput
                    value={logQuantity}
                    onChangeText={setLogQuantity}
                    keyboardType="decimal-pad"
                    style={styles.stepInput}
                  />

                  <Pressable
                    style={styles.stepBtn}
                    onPress={() => {
                      const cur = parseFloat(logQuantity) || 1;
                      setLogQuantity(String(Math.round((cur + 0.25) * 100) / 100));
                    }}
                  >
                    <Ionicons name="add" size={18} color={Colors.ink} />
                  </Pressable>
                </View>

                {/* Live calculated totals */}
                <View style={styles.liveCalculated}>
                  <Text style={styles.liveCalculatedText}>
                    Total: {Math.round(selectedFood.protein * (parseFloat(logQuantity) || 1) * 10) / 10}g Protein ·{' '}
                    {Math.round(selectedFood.calories * (parseFloat(logQuantity) || 1))} kcal
                  </Text>
                </View>

                <Pressable style={styles.confirmLogBtn} onPress={handleConfirmLog}>
                  <Text style={styles.confirmLogBtnText}>Confirm Log Entry</Text>
                </Pressable>
              </View>
            )}
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 10,
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E6EAE4',
    gap: 8,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.ink,
    padding: 0,
  },
  categoriesWrap: {
    marginBottom: 12,
  },
  categoriesScroll: {
    gap: 8,
    paddingRight: 10,
  },
  categoryPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E6EAE4',
  },
  categoryPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.inkSecondary,
  },
  categoryPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  listContent: {
    paddingBottom: 24,
    gap: 10,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.ink,
  },
  emptySub: {
    fontSize: 12,
    color: Colors.muted,
  },
  foodCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EEF2EC',
    ...Shadows.soft,
    gap: 10,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  foodInfo: {
    flex: 1,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F3F6F2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 4,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.muted,
  },
  foodName: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.ink,
  },
  servingText: {
    fontSize: 11,
    color: Colors.muted,
    marginTop: 2,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#F8FAF8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F6F2',
  },
  macroPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    flex: 1,
  },
  macroBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  macroBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  quickLogBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
  },
  quickLogBtnText: {
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
  macroInputsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  macroCol: {
    flex: 1,
  },
  catChoice: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: '#F8FAF8',
    borderRadius: 10,
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#E6EBE4',
  },
  catChoiceActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  catChoiceText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.inkSecondary,
  },
  catChoiceTextActive: {
    color: Colors.primaryDark,
    fontWeight: '800',
  },
  saveSubmitBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  saveSubmitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  logDialogCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    width: '90%',
    maxWidth: 360,
    alignSelf: 'center',
    ...Shadows.floating,
  },
  dialogHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dialogTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.ink,
  },
  dialogContent: {
    gap: 10,
  },
  dialogFoodName: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.ink,
  },
  dialogFoodServing: {
    fontSize: 12,
    color: Colors.muted,
  },
  dialogLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.ink,
    marginTop: 6,
  },
  mealTypeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  mealTypeBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F8FAF8',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E6EBE4',
  },
  mealTypeBtnActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  mealTypeBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.inkSecondary,
  },
  mealTypeBtnTextActive: {
    color: Colors.primaryDark,
    fontWeight: '800',
  },
  quantityStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginVertical: 4,
  },
  stepBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F3F6F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepInput: {
    width: 70,
    height: 38,
    backgroundColor: '#F8FAF8',
    borderWidth: 1,
    borderColor: '#E6EBE4',
    borderRadius: 12,
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
    color: Colors.ink,
  },
  liveCalculated: {
    backgroundColor: '#F0FBF5',
    padding: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  liveCalculatedText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  confirmLogBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  confirmLogBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
