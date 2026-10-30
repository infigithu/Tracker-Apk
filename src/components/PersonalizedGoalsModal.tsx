import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { UserSettings } from '../types';
import { Colors, Shadows } from '../theme';

interface PersonalizedGoalsModalProps {
  visible: boolean;
  settings: UserSettings;
  onClose: () => void;
  onSave: (updated: Partial<UserSettings>) => Promise<void>;
}

export const PersonalizedGoalsModal: React.FC<PersonalizedGoalsModalProps> = ({
  visible,
  settings,
  onClose,
  onSave,
}) => {
  const insets = useSafeAreaInsets();
  const [gender, setGender] = useState<'male' | 'female' | 'other'>(settings.userGender || 'male');
  const [age, setAge] = useState(String(settings.userAge || 26));
  const [heightCm, setHeightCm] = useState(String(settings.userHeightCm || 175));
  const [weightKg, setWeightKg] = useState(String(settings.userWeightKg || 72));
  const [activity, setActivity] = useState<'sedentary' | 'light' | 'moderate' | 'very_active'>(
    settings.activityLevel || 'moderate'
  );
  const [goal, setGoal] = useState<'lose' | 'maintain' | 'gain'>(settings.goal || 'maintain');

  // Manual editable targets
  const [customCalories, setCustomCalories] = useState(String(settings.calorieTarget));
  const [customProtein, setCustomProtein] = useState(String(settings.proteinTarget));
  const [customCarbs, setCustomCarbs] = useState(String(settings.carbsTarget));
  const [customFat, setCustomFat] = useState(String(settings.fatTarget));
  const [customWater, setCustomWater] = useState(String(settings.waterTarget));

  // Calculate live suggestions whenever parameters change
  const calcSuggestions = () => {
    const w = parseFloat(weightKg) || 70;
    const h = parseFloat(heightCm) || 175;
    const a = parseFloat(age) || 25;

    // Mifflin - St Jeor
    let bmr = 10 * w + 6.25 * h - 5 * a;
    bmr += gender === 'female' ? -161 : 5;

    const activityMults = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      very_active: 1.725,
    };
    const tdee = bmr * (activityMults[activity] || 1.4);

    let cal = tdee;
    let proteinPerKg = 1.8;

    if (goal === 'lose') {
      cal = tdee - 400;
      proteinPerKg = 2.1; // higher protein for satiety & sparing muscle
    } else if (goal === 'gain') {
      cal = tdee + 350;
      proteinPerKg = 2.0; // muscle building surplus
    }

    const calculatedCalories = Math.round(Math.max(1200, cal));
    const calculatedProtein = Math.round(w * proteinPerKg);
    const calculatedFat = Math.round((calculatedCalories * 0.25) / 9);
    const calculatedCarbs = Math.round(
      Math.max(50, (calculatedCalories - (calculatedProtein * 4 + calculatedFat * 9)) / 4)
    );
    const calculatedWater = Math.round(w * 35); // 35ml per kg

    return {
      calories: calculatedCalories,
      protein: calculatedProtein,
      carbs: calculatedCarbs,
      fat: calculatedFat,
      water: calculatedWater,
    };
  };

  const suggestions = calcSuggestions();

  const handleApplyCalculated = () => {
    setCustomCalories(String(suggestions.calories));
    setCustomProtein(String(suggestions.protein));
    setCustomCarbs(String(suggestions.carbs));
    setCustomFat(String(suggestions.fat));
    setCustomWater(String(suggestions.water));
    Alert.alert('Suggested targets applied', 'You can review or adjust them before saving.');
  };

  const handleSave = async () => {
    const cal = parseInt(customCalories, 10);
    const pro = parseInt(customProtein, 10);
    const carb = parseInt(customCarbs, 10);
    const fat = parseInt(customFat, 10);
    const wat = parseInt(customWater, 10);

    if (isNaN(cal) || cal <= 0 || isNaN(pro) || pro <= 0) {
      Alert.alert('Invalid Targets', 'Please provide valid positive numbers for calories and protein.');
      return;
    }

    await onSave({
      userGender: gender,
      userAge: parseInt(age, 10) || 26,
      userHeightCm: parseFloat(heightCm) || 175,
      userWeightKg: parseFloat(weightKg) || 72,
      activityLevel: activity,
      goal,
      calorieTarget: cal,
      proteinTarget: pro,
      carbsTarget: isNaN(carb) ? 200 : carb,
      fatTarget: isNaN(fat) ? 65 : fat,
      waterTarget: isNaN(wat) ? 2500 : wat,
    });

    onClose();
    Alert.alert('Goals Updated', 'Your personalized targets have been saved successfully.');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardContainer}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1, minWidth: 0, marginRight: 8 }}>
                <Text style={styles.modalTitle} numberOfLines={1}>Personalized Goals</Text>
                <Text style={styles.modalSub} numberOfLines={1}>Science-backed macro calculation</Text>
              </View>
              <Pressable onPress={onClose} hitSlop={12} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color={Colors.ink} />
              </Pressable>
            </View>

            <ScrollView
              contentContainerStyle={[styles.scrollContent, { paddingBottom: 40 + insets.bottom }]}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Gender */}
              <Text style={styles.sectionLabel}>Biological Sex</Text>
              <View style={styles.rowSelector}>
                {(['male', 'female'] as const).map(g => (
                  <Pressable
                    key={g}
                    onPress={() => setGender(g)}
                    style={[styles.selectorBtn, gender === g && styles.selectorBtnActive]}
                  >
                    <Ionicons
                      name={g === 'male' ? 'male' : 'female'}
                      size={16}
                      color={gender === g ? Colors.primary : Colors.muted}
                    />
                    <Text
                      style={[styles.selectorBtnText, gender === g && styles.selectorBtnTextActive]}
                    >
                      {g === 'male' ? 'Male' : 'Female'}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* Age, Height, Weight */}
              <View style={styles.threeCols}>
                <View style={styles.inputCol}>
                  <Text style={styles.inputLabel}>Age</Text>
                  <TextInput
                    value={age}
                    onChangeText={setAge}
                    keyboardType="numeric"
                    style={styles.textInput}
                    placeholder="26"
                  />
                </View>
                <View style={styles.inputCol}>
                  <Text style={styles.inputLabel}>Height (cm)</Text>
                  <TextInput
                    value={heightCm}
                    onChangeText={setHeightCm}
                    keyboardType="numeric"
                    style={styles.textInput}
                    placeholder="175"
                  />
                </View>
                <View style={styles.inputCol}>
                  <Text style={styles.inputLabel}>Weight (kg)</Text>
                  <TextInput
                    value={weightKg}
                    onChangeText={setWeightKg}
                    keyboardType="decimal-pad"
                    style={styles.textInput}
                    placeholder="72"
                  />
                </View>
              </View>

              {/* Goal */}
              <Text style={styles.sectionLabel}>Your Primary Goal</Text>
              <View style={styles.rowSelector}>
                {[
                  { id: 'lose', label: 'Lose Fat' },
                  { id: 'maintain', label: 'Maintain' },
                  { id: 'gain', label: 'Build Muscle' },
                ].map(item => (
                  <Pressable
                    key={item.id}
                    onPress={() => setGoal(item.id as any)}
                    style={[styles.selectorBtn, goal === item.id && styles.selectorBtnActive]}
                  >
                    <Text
                      style={[
                        styles.selectorBtnText,
                        goal === item.id && styles.selectorBtnTextActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* Activity Level */}
              <Text style={styles.sectionLabel}>Weekly Activity Level</Text>
              <View style={styles.activityList}>
                {[
                  { id: 'sedentary', label: 'Sedentary', desc: 'Desk job, little workout' },
                  { id: 'light', label: 'Lightly Active', desc: '1-3 workout days/wk' },
                  { id: 'moderate', label: 'Moderately Active', desc: '3-5 workout days/wk' },
                  { id: 'very_active', label: 'Very Active', desc: '6-7 intense sessions/wk' },
                ].map(act => (
                  <Pressable
                    key={act.id}
                    onPress={() => setActivity(act.id as any)}
                    style={[
                      styles.activityRow,
                      activity === act.id && styles.activityRowActive,
                    ]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.activityTitle,
                          activity === act.id && styles.activityTitleActive,
                        ]}
                      >
                        {act.label}
                      </Text>
                      <Text style={styles.activityDesc}>{act.desc}</Text>
                    </View>
                    <Ionicons
                      name={activity === act.id ? 'radio-button-on' : 'radio-button-off'}
                      size={20}
                      color={activity === act.id ? Colors.primary : Colors.muted}
                    />
                  </Pressable>
                ))}
              </View>

              {/* Suggested Banner */}
              <View style={styles.suggestedBanner}>
                <View style={styles.suggestedHeader}>
                  <View style={styles.sparkleWrap}>
                    <Ionicons name="sparkles" size={16} color={Colors.primary} />
                  </View>
                  <Text style={styles.suggestedTitle}>Scientifically Calculated</Text>
                </View>
                <View style={styles.suggestedGrid}>
                  <View style={styles.suggestedItem}>
                    <Text style={styles.suggestedValue}>{suggestions.calories} kcal</Text>
                    <Text style={styles.suggestedSub}>Daily Calories</Text>
                  </View>
                  <View style={styles.suggestedItem}>
                    <Text style={styles.suggestedValue}>{suggestions.protein} g</Text>
                    <Text style={styles.suggestedSub}>Daily Protein</Text>
                  </View>
                  <View style={styles.suggestedItem}>
                    <Text style={styles.suggestedValue}>{suggestions.carbs} g</Text>
                    <Text style={styles.suggestedSub}>Carbs</Text>
                  </View>
                  <View style={styles.suggestedItem}>
                    <Text style={styles.suggestedValue}>{suggestions.fat} g</Text>
                    <Text style={styles.suggestedSub}>Fats</Text>
                  </View>
                </View>
                <Pressable
                  style={styles.applyBtn}
                  onPress={handleApplyCalculated}
                >
                  <Ionicons name="checkmark-done" size={16} color="#FFFFFF" />
                  <Text style={styles.applyBtnText}>Use These Suggested Values</Text>
                </Pressable>
              </View>

              {/* Manual Editing */}
              <Text style={styles.sectionLabel}>Active Daily Targets</Text>
              <View style={styles.manualGrid}>
                <View style={styles.manualCol}>
                  <Text style={styles.inputLabel}>Calories (kcal)</Text>
                  <TextInput
                    value={customCalories}
                    onChangeText={setCustomCalories}
                    keyboardType="numeric"
                    style={styles.textInput}
                  />
                </View>
                <View style={styles.manualCol}>
                  <Text style={styles.inputLabel}>Protein (g)</Text>
                  <TextInput
                    value={customProtein}
                    onChangeText={setCustomProtein}
                    keyboardType="numeric"
                    style={styles.textInput}
                  />
                </View>
                <View style={styles.manualCol}>
                  <Text style={styles.inputLabel}>Carbs (g)</Text>
                  <TextInput
                    value={customCarbs}
                    onChangeText={setCustomCarbs}
                    keyboardType="numeric"
                    style={styles.textInput}
                  />
                </View>
                <View style={styles.manualCol}>
                  <Text style={styles.inputLabel}>Fats (g)</Text>
                  <TextInput
                    value={customFat}
                    onChangeText={setCustomFat}
                    keyboardType="numeric"
                    style={styles.textInput}
                  />
                </View>
                <View style={[styles.manualCol, { width: '100%' }]}>
                  <Text style={styles.inputLabel}>Water Goal (ml)</Text>
                  <TextInput
                    value={customWater}
                    onChangeText={setCustomWater}
                    keyboardType="numeric"
                    style={styles.textInput}
                  />
                </View>
              </View>

              <Pressable style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveBtnText}>Save Targets</Text>
              </Pressable>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 18, 0.45)',
    justifyContent: 'flex-end',
  },
  keyboardContainer: {
    width: '100%',
    maxHeight: '92%',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 20,
    paddingBottom: 28,
    maxHeight: '100%',
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
    fontSize: 20,
    fontWeight: '800',
    color: Colors.ink,
  },
  modalSub: {
    fontSize: 12,
    color: Colors.muted,
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F5F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.ink,
    marginTop: 8,
  },
  rowSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  selectorBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    backgroundColor: '#F8FAF8',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6EBE4',
  },
  selectorBtnActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  selectorBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.inkSecondary,
  },
  selectorBtnTextActive: {
    color: Colors.primaryDark,
    fontWeight: '800',
  },
  threeCols: {
    flexDirection: 'row',
    gap: 8,
  },
  inputCol: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.muted,
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: '#F8FAF8',
    borderWidth: 1,
    borderColor: '#E6EBE4',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.ink,
  },
  activityList: {
    gap: 8,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6EBE4',
    backgroundColor: '#F8FAF8',
  },
  activityRowActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  activityTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.ink,
  },
  activityTitleActive: {
    color: Colors.primaryDark,
  },
  activityDesc: {
    fontSize: 11,
    color: Colors.muted,
    marginTop: 2,
  },
  suggestedBanner: {
    backgroundColor: '#F0FBF5',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#D1F0E0',
    marginTop: 6,
  },
  suggestedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  sparkleWrap: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestedTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  suggestedGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  suggestedItem: {
    alignItems: 'center',
  },
  suggestedValue: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.ink,
  },
  suggestedSub: {
    fontSize: 10,
    color: Colors.muted,
    marginTop: 2,
  },
  applyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    borderRadius: 12,
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  manualGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  manualCol: {
    width: '48%',
  },
  saveBtn: {
    backgroundColor: Colors.ink,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
