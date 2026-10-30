import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  Platform,
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import {
  initDb,
  getSettings,
  saveUserSettings,
  getFoods,
  saveFood,
  deleteFood,
  getMeals,
  saveMeal,
  deleteMeal,
  getLog,
  addFoodLog,
  addMealLog,
  updateLogQuantity,
  deleteLog,
  getWaterLogs,
  addWaterLog,
  deleteWaterLog,
  getHistory,
  getWeeklyHistory,
  todayKey,
  setSetting,
} from './src/db';
import {
  Food,
  Meal,
  MealItem,
  LogEntry,
  WaterLog,
  UserSettings,
  DayHistory,
  MealType,
} from './src/types';
import { Colors, Shadows } from './src/theme';

import { DashboardTab } from './src/components/DashboardTab';
import { FoodLibraryTab } from './src/components/FoodLibraryTab';
import { MealsTab } from './src/components/MealsTab';
import { WaterTrackerTab } from './src/components/WaterTrackerTab';
import { HistoryTab } from './src/components/HistoryTab';
import { SettingsTab } from './src/components/SettingsTab';

import { CelebrationModal } from './src/components/CelebrationModal';
import { PersonalizedGoalsModal } from './src/components/PersonalizedGoalsModal';
import { DataManagementModal } from './src/components/DataManagementModal';

type NavTab = 'Today' | 'Food' | 'Meals' | 'Water' | 'History' | 'Settings';

export default function App() {
  const [ready, setReady] = useState(false);
  const [activeTab, setActiveTab] = useState<NavTab>('Today');
  const [activeDate, setActiveDate] = useState<string>(todayKey());

  // Database state
  const [settings, setSettings] = useState<UserSettings>({
    proteinTarget: 130,
    calorieTarget: 2100,
    carbsTarget: 220,
    fatTarget: 65,
    waterTarget: 2500,
    userName: 'You',
    userAge: 26,
    userGender: 'male',
    userHeightCm: 175,
    userWeightKg: 72,
    activityLevel: 'moderate',
    goal: 'maintain',
    streakCount: 1,
    lastActiveDate: todayKey(),
    lastCelebratedDate: '',
  });

  const [foods, setFoods] = useState<Food[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [waterLogs, setWaterLogs] = useState<WaterLog[]>([]);
  const [history, setHistory] = useState<DayHistory[]>([]);
  const [weeklyHistory, setWeeklyHistory] = useState<DayHistory[]>([]);

  // Modals state
  const [goalsModalOpen, setGoalsModalOpen] = useState(false);
  const [dataModalOpen, setDataModalOpen] = useState(false);
  const [celebrationOpen, setCelebrationOpen] = useState(false);
  const [celebrationInfo, setCelebrationInfo] = useState({
    title: 'Goal Achieved!',
    message: 'Awesome work today! Keep the momentum going.',
    streak: 1,
  });

  const refreshData = useCallback(async (targetDate = activeDate) => {
    try {
      const [s, f, m, l, w, h, wk] = await Promise.all([
        getSettings(),
        getFoods(),
        getMeals(),
        getLog(targetDate),
        getWaterLogs(targetDate),
        getHistory(),
        getWeeklyHistory(targetDate),
      ]);

      setSettings(s);
      setFoods(f);
      setMeals(m);
      setLogs(l);
      setWaterLogs(w);
      setHistory(h);
      setWeeklyHistory(wk);
    } catch (err: any) {
      Alert.alert('Database sync error', err.message);
    }
  }, [activeDate]);

  useEffect(() => {
    initDb()
      .then(async () => {
        await refreshData(activeDate);
        setReady(true);
      })
      .catch(err => {
        Alert.alert('Database Initialization Error', String(err));
      });
  }, [activeDate, refreshData]);

  // Check goal celebration on log updates
  const checkGoalCompletion = useCallback(
    async (currentLogs: LogEntry[], currentWater: WaterLog[], currentSettings: UserSettings) => {
      const totalProtein = currentLogs.reduce((s, l) => s + l.protein, 0);
      const today = todayKey();

      if (
        activeDate === today &&
        totalProtein >= currentSettings.proteinTarget &&
        currentSettings.lastCelebratedDate !== today
      ) {
        // Trigger Duolingo celebratory animation!
        const newStreak = (currentSettings.streakCount || 1) + 1;
        await setSetting('streakCount', newStreak);
        await setSetting('lastCelebratedDate', today);

        setCelebrationInfo({
          title: 'Protein Goal Smashed! 🎉',
          message: `You hit your daily target of ${currentSettings.proteinTarget}g protein! Your body thanks you.`,
          streak: newStreak,
        });
        setCelebrationOpen(true);
        setSettings(prev => ({
          ...prev,
          streakCount: newStreak,
          lastCelebratedDate: today,
        }));
      }
    },
    [activeDate]
  );

  // Date Navigation
  const changeDateByDelta = (delta: number) => {
    const d = new Date(`${activeDate}T12:00:00`);
    d.setDate(d.getDate() + delta);
    setActiveDate(todayKey(d));
  };

  // Actions: Food Logs
  const handleAddFoodLog = async (food: Food, quantity: number, mealType: MealType) => {
    await addFoodLog(activeDate, food, quantity, mealType);
    const updated = await getLog(activeDate);
    setLogs(updated);
    await checkGoalCompletion(updated, waterLogs, settings);
    const [h, wk] = await Promise.all([getHistory(), getWeeklyHistory(activeDate)]);
    setHistory(h);
    setWeeklyHistory(wk);
  };

  const handleAddMealLog = async (meal: Meal, mealType: MealType) => {
    await addMealLog(activeDate, meal, mealType);
    const updated = await getLog(activeDate);
    setLogs(updated);
    await checkGoalCompletion(updated, waterLogs, settings);
    const [h, wk] = await Promise.all([getHistory(), getWeeklyHistory(activeDate)]);
    setHistory(h);
    setWeeklyHistory(wk);
  };

  const handleUpdateLogQty = async (
    id: number,
    quantity: number,
    pPerUnit: number,
    cPerUnit: number,
    carbPerUnit: number,
    fatPerUnit: number
  ) => {
    await updateLogQuantity(id, quantity, pPerUnit, cPerUnit, carbPerUnit, fatPerUnit);
    const updated = await getLog(activeDate);
    setLogs(updated);
    await checkGoalCompletion(updated, waterLogs, settings);
    const [h, wk] = await Promise.all([getHistory(), getWeeklyHistory(activeDate)]);
    setHistory(h);
    setWeeklyHistory(wk);
  };

  const handleDeleteLog = async (id: number) => {
    await deleteLog(id);
    const updated = await getLog(activeDate);
    setLogs(updated);
    const [h, wk] = await Promise.all([getHistory(), getWeeklyHistory(activeDate)]);
    setHistory(h);
    setWeeklyHistory(wk);
  };

  // Actions: Water Logs
  const handleAddWater = async (amount: number) => {
    await addWaterLog(activeDate, amount);
    const updatedWater = await getWaterLogs(activeDate);
    setWaterLogs(updatedWater);
    const currentWaterTotal = updatedWater.reduce((s, w) => s + w.amount, 0);

    if (
      activeDate === todayKey() &&
      currentWaterTotal >= settings.waterTarget &&
      currentWaterTotal - amount < settings.waterTarget
    ) {
      setCelebrationInfo({
        title: 'Hydration Target Met! 💧',
        message: `You drank ${currentWaterTotal} ml today. Fantastic job staying hydrated!`,
        streak: settings.streakCount || 1,
      });
      setCelebrationOpen(true);
    }

    const [h, wk] = await Promise.all([getHistory(), getWeeklyHistory(activeDate)]);
    setHistory(h);
    setWeeklyHistory(wk);
  };

  const handleDeleteWater = async (id: number) => {
    await deleteWaterLog(id);
    const updatedWater = await getWaterLogs(activeDate);
    setWaterLogs(updatedWater);
    const [h, wk] = await Promise.all([getHistory(), getWeeklyHistory(activeDate)]);
    setHistory(h);
    setWeeklyHistory(wk);
  };

  const handleUpdateWaterGoal = async (newGoal: number) => {
    await saveUserSettings({ waterTarget: newGoal });
    setSettings(prev => ({ ...prev, waterTarget: newGoal }));
  };

  // Actions: Food Library
  const handleSaveFood = async (f: any) => {
    await saveFood(f);
    const updated = await getFoods();
    setFoods(updated);
  };

  const handleDeleteFood = async (id: number) => {
    await deleteFood(id);
    const updated = await getFoods();
    setFoods(updated);
  };

  // Actions: Saved Meals
  const handleSaveMeal = async (id: number | undefined, name: string, items: MealItem[]) => {
    await saveMeal(id, name, items);
    const updated = await getMeals();
    setMeals(updated);
  };

  const handleDeleteMeal = async (id: number) => {
    await deleteMeal(id);
    const updated = await getMeals();
    setMeals(updated);
  };

  // Actions: User Profile / Personalized Goals
  const handleSaveSettings = async (updated: Partial<UserSettings>) => {
    await saveUserSettings(updated);
    const fresh = await getSettings();
    setSettings(fresh);
  };

  const waterTotal = useMemo(
    () => waterLogs.reduce((s, w) => s + w.amount, 0),
    [waterLogs]
  );

  if (!ready) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ExpoStatusBar style="dark" />
        <View style={styles.loadingIconWrap}>
          <Ionicons name="barbell" size={40} color={Colors.primary} />
        </View>
        <Text style={styles.loadingTitle}>Protein Tracker</Text>
        <Text style={styles.loadingSub}>Loading local SQLite database & Indian food catalog…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ExpoStatusBar style="dark" />

      {/* Main Tab View */}
      <View style={styles.screenContainer}>
        {activeTab === 'Today' && (
          <DashboardTab
            date={activeDate}
            logs={logs}
            waterTotal={waterTotal}
            targets={settings}
            foods={foods}
            meals={meals}
            onChangeDate={changeDateByDelta}
            onSetDate={setActiveDate}
            onAddFoodLog={handleAddFoodLog}
            onAddMealLog={handleAddMealLog}
            onUpdateLogQty={handleUpdateLogQty}
            onDeleteLog={handleDeleteLog}
            onOpenProfile={() => setGoalsModalOpen(true)}
            onTriggerCelebrationTest={() => {
              setCelebrationInfo({
                title: 'Daily Goal Smashed! 🎉',
                message: `You achieved 100% of your targets! High-fives all around!`,
                streak: (settings.streakCount || 1) + 1,
              });
              setCelebrationOpen(true);
            }}
          />
        )}

        {activeTab === 'Food' && (
          <FoodLibraryTab
            foods={foods}
            onSaveFood={handleSaveFood}
            onDeleteFood={handleDeleteFood}
            onQuickLog={handleAddFoodLog}
          />
        )}

        {activeTab === 'Meals' && (
          <MealsTab
            meals={meals}
            foods={foods}
            onSaveMeal={handleSaveMeal}
            onDeleteMeal={handleDeleteMeal}
            onLogMeal={handleAddMealLog}
          />
        )}

        {activeTab === 'Water' && (
          <WaterTrackerTab
            date={activeDate}
            waterLogs={waterLogs}
            waterGoal={settings.waterTarget}
            onAddWater={handleAddWater}
            onDeleteWater={handleDeleteWater}
            onUpdateGoal={handleUpdateWaterGoal}
          />
        )}

        {activeTab === 'History' && (
          <HistoryTab
            history={history}
            weekly={weeklyHistory}
            proteinTarget={settings.proteinTarget}
            calorieTarget={settings.calorieTarget}
            waterTarget={settings.waterTarget}
            onSelectDate={d => {
              setActiveDate(d);
              setActiveTab('Today');
            }}
          />
        )}

        {activeTab === 'Settings' && (
          <SettingsTab
            settings={settings}
            onOpenGoalsModal={() => setGoalsModalOpen(true)}
            onOpenDataModal={() => setDataModalOpen(true)}
            onTriggerCelebration={() => {
              setCelebrationInfo({
                title: 'Duolingo Celebration 🎉',
                message: 'Goal achieved! You smashed your targets like a true champion.',
                streak: settings.streakCount || 3,
              });
              setCelebrationOpen(true);
            }}
          />
        )}
      </View>

      {/* Floating Pill Bottom Navigation Bar (Matching Page 1, 2, 3) */}
      <View style={styles.floatingNavWrapper}>
        <View style={styles.floatingNavBar}>
          {[
            { id: 'Today', icon: 'grid', label: 'Diary' },
            { id: 'Food', icon: 'nutrition', label: 'Foods' },
            { id: 'Meals', icon: 'fast-food', label: 'Meals' },
            { id: 'Water', icon: 'water', label: 'Water' },
            { id: 'History', icon: 'bar-chart', label: 'History' },
            { id: 'Settings', icon: 'settings', label: 'Profile' },
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <Pressable
                key={tab.id}
                onPress={() => setActiveTab(tab.id as NavTab)}
                style={[styles.navItem, isActive && styles.navItemActive]}
              >
                <Ionicons
                  name={tab.icon as any}
                  size={19}
                  color={isActive ? '#FFFFFF' : '#8A9990'}
                />
                {isActive && (
                  <Text style={styles.navLabelActive}>{tab.label}</Text>
                )}
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Duolingo Celebrations Modal */}
      <CelebrationModal
        visible={celebrationOpen}
        title={celebrationInfo.title}
        message={celebrationInfo.message}
        streak={celebrationInfo.streak}
        onClose={() => setCelebrationOpen(false)}
      />

      {/* Personalized Goals & BMR Calculator Modal */}
      <PersonalizedGoalsModal
        visible={goalsModalOpen}
        settings={settings}
        onClose={() => setGoalsModalOpen(false)}
        onSave={handleSaveSettings}
      />

      {/* Data Management & Backup Modal */}
      <DataManagementModal
        visible={dataModalOpen}
        activeDate={activeDate}
        onClose={() => setDataModalOpen(false)}
        onReload={() => refreshData(activeDate)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  screenContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 24,
  },
  loadingIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.ink,
  },
  loadingSub: {
    fontSize: 12,
    color: Colors.muted,
    textAlign: 'center',
  },
  floatingNavWrapper: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 16 : 10,
    left: 14,
    right: 14,
    alignItems: 'center',
  },
  floatingNavBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#131916',
    borderRadius: 36,
    paddingHorizontal: 8,
    paddingVertical: 7,
    width: '100%',
    ...Shadows.floating,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 24,
  },
  navItemActive: {
    backgroundColor: Colors.primary,
  },
  navLabelActive: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
});
