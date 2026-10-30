export type FoodCategory =
  | 'All'
  | 'High-Protein'
  | 'Indian Staples'
  | 'Dairy & Veg'
  | 'Poultry & Meat'
  | 'Snacks & Breakfast'
  | 'Fruits & Salads';

export interface Food {
  id: number;
  name: string;
  serving: string;
  protein: number;
  calories: number;
  carbs: number;
  fat: number;
  category: string;
  isCustom?: boolean;
}

export interface MealItem {
  foodId: number;
  name: string;
  serving: string;
  protein: number;
  calories: number;
  carbs: number;
  fat: number;
  quantity: number;
}

export interface Meal {
  id: number;
  name: string;
  items: MealItem[];
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface LogEntry {
  id: number;
  date: string;
  kind: 'food' | 'meal';
  sourceId: number | null;
  name: string;
  serving: string;
  quantity: number;
  protein: number;
  calories: number;
  carbs: number;
  fat: number;
  mealType: MealType;
}

export interface WaterLog {
  id: number;
  date: string;
  amount: number; // in ml
  time: string;
}

export interface UserSettings {
  proteinTarget: number;
  calorieTarget: number;
  carbsTarget: number;
  fatTarget: number;
  waterTarget: number;
  userName: string;
  userAge: number;
  userGender: 'male' | 'female' | 'other';
  userHeightCm: number;
  userWeightKg: number;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'very_active';
  goal: 'lose' | 'maintain' | 'gain';
  streakCount: number;
  lastActiveDate: string;
  lastCelebratedDate: string;
}

export interface DayHistory {
  date: string;
  protein: number;
  calories: number;
  carbs: number;
  fat: number;
  water: number;
  entries: number;
}

export interface ExportData {
  version: number;
  exportedAt: string;
  settings: Record<string, string>;
  foods: Food[];
  meals: Meal[];
  logEntries: LogEntry[];
  waterLogs: WaterLog[];
}
