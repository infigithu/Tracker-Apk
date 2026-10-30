import { Food } from './types';

export interface SeedFood {
  name: string;
  serving: string;
  protein: number;
  calories: number;
  carbs: number;
  fat: number;
  category: string;
}

export const INITIAL_FOOD_SEEDS: SeedFood[] = [
  // High Protein & Fitness Staples
  { name: 'Chicken Breast, cooked', serving: '100 g', protein: 31, calories: 165, carbs: 0, fat: 3.6, category: 'Poultry & Meat' },
  { name: 'Whey Protein (Water)', serving: '1 scoop (30 g)', protein: 24, calories: 120, carbs: 2, fat: 1.5, category: 'High-Protein' },
  { name: 'Whey Protein (Milk)', serving: '1 scoop + 200ml milk', protein: 30.5, calories: 235, carbs: 11, fat: 6.5, category: 'High-Protein' },
  { name: 'Boiled Eggs', serving: '2 eggs (100 g)', protein: 12.6, calories: 156, carbs: 1.1, fat: 10.6, category: 'Poultry & Meat' },
  { name: 'Egg Whites, boiled', serving: '3 whites (100 g)', protein: 10.8, calories: 51, carbs: 0.7, fat: 0.2, category: 'Poultry & Meat' },
  { name: 'Paneer, raw', serving: '100 g', protein: 18.3, calories: 265, carbs: 1.2, fat: 20.8, category: 'Dairy & Veg' },
  { name: 'Soya Chunks Curry', serving: '100 g cooked', protein: 24, calories: 175, carbs: 13, fat: 3, category: 'High-Protein' },
  { name: 'Greek Yogurt / Hung Curd', serving: '100 g', protein: 10, calories: 59, carbs: 3.6, fat: 0.4, category: 'Dairy & Veg' },
  { name: 'Tofu, firm', serving: '100 g', protein: 10, calories: 85, carbs: 2, fat: 4.5, category: 'Dairy & Veg' },

  // Indian Staples & Curries
  { name: 'Paneer Bhurji', serving: '1 bowl (150 g)', protein: 20.5, calories: 290, carbs: 6, fat: 21, category: 'Indian Staples' },
  { name: 'Dal Tadka (Yellow Lentils)', serving: '1 bowl (150 g)', protein: 8.5, calories: 140, carbs: 18, fat: 4, category: 'Indian Staples' },
  { name: 'Dal Makhani', serving: '1 bowl (150 g)', protein: 8, calories: 230, carbs: 22, fat: 12, category: 'Indian Staples' },
  { name: 'Chana Masala (Chickpeas)', serving: '1 bowl (150 g)', protein: 10, calories: 210, carbs: 30, fat: 5, category: 'Indian Staples' },
  { name: 'Rajma Curry (Kidney Beans)', serving: '1 bowl (150 g)', protein: 10.5, calories: 195, carbs: 28, fat: 4.5, category: 'Indian Staples' },
  { name: 'Palak Paneer', serving: '1 bowl (150 g)', protein: 14, calories: 235, carbs: 6.5, fat: 17, category: 'Indian Staples' },
  { name: 'Moong Dal Khichdi', serving: '1 bowl (200 g)', protein: 9, calories: 220, carbs: 38, fat: 4.5, category: 'Indian Staples' },
  { name: 'Roti / Chapati (Whole Wheat)', serving: '1 roti (35 g)', protein: 3.2, calories: 85, carbs: 17, fat: 0.6, category: 'Indian Staples' },
  { name: 'Plain Paratha', serving: '1 medium (60 g)', protein: 4.5, calories: 190, carbs: 25, fat: 8.5, category: 'Indian Staples' },
  { name: 'Cooked Basmati Rice', serving: '1 bowl (150 g)', protein: 3.8, calories: 195, carbs: 44, fat: 0.5, category: 'Indian Staples' },

  // Poultry & Fish Curries
  { name: 'Chicken Tikka (Tandoori)', serving: '150 g', protein: 36, calories: 220, carbs: 3, fat: 7, category: 'Poultry & Meat' },
  { name: 'Homestyle Chicken Curry', serving: '150 g', protein: 26, calories: 240, carbs: 5, fat: 13, category: 'Poultry & Meat' },
  { name: 'Egg Curry', serving: '2 eggs in gravy (150 g)', protein: 14, calories: 240, carbs: 7, fat: 17, category: 'Poultry & Meat' },
  { name: 'Masala Omelette', serving: '2 eggs (120 g)', protein: 13.5, calories: 210, carbs: 3.5, fat: 16, category: 'Poultry & Meat' },
  { name: 'Fish Curry', serving: '150 g', protein: 22, calories: 210, carbs: 4, fat: 11, category: 'Poultry & Meat' },

  // Breakfast, Snacks & Salads
  { name: 'Besan Chilla (Pancake)', serving: '2 chillas (100 g)', protein: 11, calories: 190, carbs: 21, fat: 6.5, category: 'Snacks & Breakfast' },
  { name: 'Sprouted Moong Salad', serving: '1 bowl (120 g)', protein: 8.5, calories: 125, carbs: 22, fat: 0.8, category: 'Fruits & Salads' },
  { name: 'Poha with Peanuts', serving: '1 plate (150 g)', protein: 5.5, calories: 240, carbs: 40, fat: 7, category: 'Snacks & Breakfast' },
  { name: 'Idli with Sambar', serving: '2 idlis + sambar', protein: 7.5, calories: 175, carbs: 34, fat: 1.5, category: 'Snacks & Breakfast' },
  { name: 'Masala Dosa', serving: '1 dosa (150 g)', protein: 6, calories: 280, carbs: 42, fat: 10, category: 'Snacks & Breakfast' },
  { name: 'Oats with Milk', serving: '40g oats + 150ml milk', protein: 10, calories: 240, carbs: 35, fat: 6.5, category: 'Snacks & Breakfast' },
  { name: 'Curd / Plain Dahi', serving: '1 bowl (150 g)', protein: 6.5, calories: 98, carbs: 7, fat: 5, category: 'Dairy & Veg' },
  { name: 'Milk, toned', serving: '1 glass (200 ml)', protein: 6.4, calories: 116, carbs: 10, fat: 6, category: 'Dairy & Veg' },
  { name: 'Roasted Chana', serving: '50 g', protein: 9.5, calories: 185, carbs: 29, fat: 3.2, category: 'Snacks & Breakfast' },
  { name: 'Roasted Almonds (Badam)', serving: '20 g (~15 nuts)', protein: 4.2, calories: 116, carbs: 4.3, fat: 10, category: 'Snacks & Breakfast' },
  { name: 'Walnuts (Akhrot)', serving: '20 g (~7 halves)', protein: 3, calories: 130, carbs: 2.7, fat: 13, category: 'Snacks & Breakfast' },
  { name: 'Banana', serving: '1 medium (118 g)', protein: 1.3, calories: 105, carbs: 27, fat: 0.3, category: 'Fruits & Salads' },
  { name: 'Apple', serving: '1 medium (150 g)', protein: 0.5, calories: 80, carbs: 21, fat: 0.3, category: 'Fruits & Salads' },
];
