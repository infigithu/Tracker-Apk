import * as SQLite from 'expo-sqlite';
import { Food, Meal, MealItem, LogEntry, WaterLog, UserSettings, DayHistory, ExportData, MealType } from './types';
import { INITIAL_FOOD_SEEDS } from './indianFoods';

let database: SQLite.SQLiteDatabase | null = null;

export function db(): SQLite.SQLiteDatabase {
  if (!database) throw new Error('Database not initialized');
  return database;
}

export const todayKey = (date = new Date()): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const round1 = (n: number): number => Math.round((n + Number.EPSILON) * 10) / 10;

/**
 * Safely migrate existing tables by adding columns if they don't already exist.
 */
async function runMigrations(sqliteDb: SQLite.SQLiteDatabase) {
  // Check and add columns to foods
  const foodCols = await sqliteDb.getAllAsync<{ name: string }>('PRAGMA table_info(foods)');
  const foodColSet = new Set(foodCols.map(c => c.name));
  if (!foodColSet.has('category')) {
    await sqliteDb.execAsync("ALTER TABLE foods ADD COLUMN category TEXT DEFAULT 'General'");
  }
  if (!foodColSet.has('carbs')) {
    await sqliteDb.execAsync('ALTER TABLE foods ADD COLUMN carbs REAL DEFAULT 0');
  }
  if (!foodColSet.has('fat')) {
    await sqliteDb.execAsync('ALTER TABLE foods ADD COLUMN fat REAL DEFAULT 0');
  }

  // Check and add columns to log_entries
  const logCols = await sqliteDb.getAllAsync<{ name: string }>('PRAGMA table_info(log_entries)');
  const logColSet = new Set(logCols.map(c => c.name));
  if (!logColSet.has('meal_type')) {
    await sqliteDb.execAsync("ALTER TABLE log_entries ADD COLUMN meal_type TEXT DEFAULT 'breakfast'");
  }
  if (!logColSet.has('carbs')) {
    await sqliteDb.execAsync('ALTER TABLE log_entries ADD COLUMN carbs REAL DEFAULT 0');
  }
  if (!logColSet.has('fat')) {
    await sqliteDb.execAsync('ALTER TABLE log_entries ADD COLUMN fat REAL DEFAULT 0');
  }

  // Check and add columns to meal_items
  const mealItemCols = await sqliteDb.getAllAsync<{ name: string }>('PRAGMA table_info(meal_items)');
  const mealItemColSet = new Set(mealItemCols.map(c => c.name));
  if (!mealItemColSet.has('carbs_snapshot')) {
    await sqliteDb.execAsync('ALTER TABLE meal_items ADD COLUMN carbs_snapshot REAL DEFAULT 0');
  }
  if (!mealItemColSet.has('fat_snapshot')) {
    await sqliteDb.execAsync('ALTER TABLE meal_items ADD COLUMN fat_snapshot REAL DEFAULT 0');
  }

  // Ensure water_logs table exists
  await sqliteDb.execAsync(`
    CREATE TABLE IF NOT EXISTS water_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      amount INTEGER NOT NULL,
      time TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_water_date ON water_logs(date);
  `);
}

export async function initDb(): Promise<SQLite.SQLiteDatabase> {
  database = await SQLite.openDatabaseAsync('protein-tracker.db');

  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS foods (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      serving TEXT NOT NULL,
      protein REAL NOT NULL,
      calories REAL NOT NULL,
      carbs REAL DEFAULT 0,
      fat REAL DEFAULT 0,
      category TEXT DEFAULT 'General',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS meals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS meal_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      meal_id INTEGER NOT NULL,
      food_id INTEGER,
      name_snapshot TEXT NOT NULL,
      serving_snapshot TEXT NOT NULL,
      protein_snapshot REAL NOT NULL,
      calories_snapshot REAL NOT NULL,
      carbs_snapshot REAL DEFAULT 0,
      fat_snapshot REAL DEFAULT 0,
      quantity REAL NOT NULL,
      FOREIGN KEY(meal_id) REFERENCES meals(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS log_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      kind TEXT NOT NULL,
      source_id INTEGER,
      name TEXT NOT NULL,
      serving TEXT NOT NULL,
      quantity REAL NOT NULL,
      protein REAL NOT NULL,
      calories REAL NOT NULL,
      carbs REAL DEFAULT 0,
      fat REAL DEFAULT 0,
      meal_type TEXT DEFAULT 'breakfast'
    );
    CREATE INDEX IF NOT EXISTS idx_log_date ON log_entries(date);
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  await runMigrations(database);

  // Seed Indian food library if foods table has very few records
  const countRow = await database.getFirstAsync<{ n: number }>('SELECT COUNT(*) n FROM foods');
  if (!countRow || countRow.n < 10) {
    for (const f of INITIAL_FOOD_SEEDS) {
      const existing = await database.getFirstAsync<{ id: number }>(
        'SELECT id FROM foods WHERE name = ?',
        [f.name]
      );
      if (!existing) {
        await database.runAsync(
          'INSERT INTO foods(name, serving, protein, calories, carbs, fat, category) VALUES(?, ?, ?, ?, ?, ?, ?)',
          [f.name, f.serving, f.protein, f.calories, f.carbs, f.fat, f.category]
        );
      }
    }
  }

  // Default settings
  const defaults: [string, string][] = [
    ['proteinTarget', '130'],
    ['calorieTarget', '2100'],
    ['carbsTarget', '220'],
    ['fatTarget', '65'],
    ['waterTarget', '2500'],
    ['userName', 'You'],
    ['userAge', '26'],
    ['userGender', 'male'],
    ['userHeightCm', '175'],
    ['userWeightKg', '72'],
    ['activityLevel', 'moderate'],
    ['goal', 'maintain'],
    ['streakCount', '1'],
    ['lastActiveDate', todayKey()],
    ['lastCelebratedDate', ''],
  ];

  for (const [key, value] of defaults) {
    await database.runAsync('INSERT OR IGNORE INTO settings(key, value) VALUES(?, ?)', [key, value]);
  }

  return database;
}

// ----------------- SETTINGS & USER PROFILE -----------------

export async function getSettings(): Promise<UserSettings> {
  const rows = await db().getAllAsync<{ key: string; value: string }>('SELECT key, value FROM settings');
  const o: Record<string, string> = {};
  rows.forEach(r => {
    o[r.key] = r.value;
  });

  return {
    proteinTarget: Number(o.proteinTarget || 130),
    calorieTarget: Number(o.calorieTarget || 2100),
    carbsTarget: Number(o.carbsTarget || 220),
    fatTarget: Number(o.fatTarget || 65),
    waterTarget: Number(o.waterTarget || 2500),
    userName: o.userName || 'You',
    userAge: Number(o.userAge || 26),
    userGender: (o.userGender as 'male' | 'female' | 'other') || 'male',
    userHeightCm: Number(o.userHeightCm || 175),
    userWeightKg: Number(o.userWeightKg || 72),
    activityLevel: (o.activityLevel as any) || 'moderate',
    goal: (o.goal as any) || 'maintain',
    streakCount: Number(o.streakCount || 1),
    lastActiveDate: o.lastActiveDate || todayKey(),
    lastCelebratedDate: o.lastCelebratedDate || '',
  };
}

export async function setSetting(key: string, value: string | number): Promise<void> {
  await db().runAsync(
    'INSERT INTO settings(key, value) VALUES(?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
    [key, String(value)]
  );
}

export async function saveUserSettings(s: Partial<UserSettings>): Promise<void> {
  for (const [k, v] of Object.entries(s)) {
    if (v !== undefined) {
      await setSetting(k, String(v));
    }
  }
}

// ----------------- FOODS LIBRARY -----------------

export async function getFoods(search = '', category = 'All'): Promise<Food[]> {
  let query = 'SELECT id, name, serving, protein, calories, carbs, fat, category FROM foods WHERE 1=1';
  const params: any[] = [];

  if (search.trim()) {
    query += ' AND name LIKE ?';
    params.push(`%${search.trim()}%`);
  }

  if (category && category !== 'All') {
    query += ' AND category = ?';
    params.push(category);
  }

  query += ' ORDER BY name COLLATE NOCASE ASC';
  return db().getAllAsync<Food>(query, params);
}

export async function saveFood(f: {
  id?: number;
  name: string;
  serving: string;
  protein: number;
  calories: number;
  carbs?: number;
  fat?: number;
  category?: string;
}): Promise<void> {
  const carbs = f.carbs || 0;
  const fat = f.fat || 0;
  const category = f.category || 'General';

  if (f.id) {
    await db().runAsync(
      'UPDATE foods SET name = ?, serving = ?, protein = ?, calories = ?, carbs = ?, fat = ?, category = ? WHERE id = ?',
      [f.name.trim(), f.serving.trim(), f.protein, f.calories, carbs, fat, category, f.id]
    );
  } else {
    await db().runAsync(
      'INSERT INTO foods(name, serving, protein, calories, carbs, fat, category) VALUES(?, ?, ?, ?, ?, ?, ?)',
      [f.name.trim(), f.serving.trim(), f.protein, f.calories, carbs, fat, category]
    );
  }
}

export async function deleteFood(id: number): Promise<void> {
  await db().runAsync('DELETE FROM foods WHERE id = ?', [id]);
}

export async function restoreDefaultIndianFoods(): Promise<void> {
  for (const f of INITIAL_FOOD_SEEDS) {
    const existing = await db().getFirstAsync<{ id: number }>(
      'SELECT id FROM foods WHERE name = ?',
      [f.name]
    );
    if (!existing) {
      await db().runAsync(
        'INSERT INTO foods(name, serving, protein, calories, carbs, fat, category) VALUES(?, ?, ?, ?, ?, ?, ?)',
        [f.name, f.serving, f.protein, f.calories, f.carbs, f.fat, f.category]
      );
    }
  }
}

// ----------------- SAVED MEAL TEMPLATES -----------------

export async function getMeals(): Promise<Meal[]> {
  const meals = await db().getAllAsync<{ id: number; name: string }>('SELECT id, name FROM meals ORDER BY name COLLATE NOCASE');
  const out: Meal[] = [];
  for (const m of meals) {
    const items = await db().getAllAsync<MealItem>(
      'SELECT food_id foodId, name_snapshot name, serving_snapshot serving, protein_snapshot protein, calories_snapshot calories, carbs_snapshot carbs, fat_snapshot fat, quantity FROM meal_items WHERE meal_id = ? ORDER BY id',
      [m.id]
    );
    out.push({ ...m, items });
  }
  return out;
}

export async function saveMeal(id: number | undefined, name: string, items: MealItem[]): Promise<void> {
  await db().withTransactionAsync(async () => {
    let mealId = id;
    if (mealId) {
      await db().runAsync('UPDATE meals SET name = ? WHERE id = ?', [name.trim(), mealId]);
    } else {
      const r = await db().runAsync('INSERT INTO meals(name) VALUES(?)', [name.trim()]);
      mealId = Number(r.lastInsertRowId);
    }
    await db().runAsync('DELETE FROM meal_items WHERE meal_id = ?', [mealId]);
    for (const i of items) {
      await db().runAsync(
        'INSERT INTO meal_items(meal_id, food_id, name_snapshot, serving_snapshot, protein_snapshot, calories_snapshot, carbs_snapshot, fat_snapshot, quantity) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          mealId,
          i.foodId || null,
          i.name,
          i.serving,
          i.protein,
          i.calories,
          i.carbs || 0,
          i.fat || 0,
          i.quantity,
        ]
      );
    }
  });
}

export async function deleteMeal(id: number): Promise<void> {
  await db().runAsync('DELETE FROM meal_items WHERE meal_id = ?', [id]);
  await db().runAsync('DELETE FROM meals WHERE id = ?', [id]);
}

// ----------------- DAILY FOOD & MEAL LOGS -----------------

export async function getLog(date: string): Promise<LogEntry[]> {
  const rows = await db().getAllAsync<any>(
    'SELECT id, date, kind, source_id, name, serving, quantity, protein, calories, carbs, fat, meal_type FROM log_entries WHERE date = ? ORDER BY id DESC',
    [date]
  );
  return rows.map(r => ({
    id: r.id,
    date: r.date,
    kind: r.kind,
    sourceId: r.source_id,
    name: r.name,
    serving: r.serving,
    quantity: r.quantity,
    protein: r.protein,
    calories: r.calories,
    carbs: r.carbs || 0,
    fat: r.fat || 0,
    mealType: (r.meal_type as MealType) || 'breakfast',
  }));
}

export async function addFoodLog(
  date: string,
  food: Food,
  quantity = 1,
  mealType: MealType = 'breakfast'
): Promise<void> {
  const carbs = (food.carbs || 0) * quantity;
  const fat = (food.fat || 0) * quantity;
  await db().runAsync(
    'INSERT INTO log_entries(date, kind, source_id, name, serving, quantity, protein, calories, carbs, fat, meal_type) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      date,
      'food',
      food.id,
      food.name,
      food.serving,
      quantity,
      food.protein * quantity,
      food.calories * quantity,
      carbs,
      fat,
      mealType,
    ]
  );
}

export async function addMealLog(
  date: string,
  meal: Meal,
  mealType: MealType = 'lunch'
): Promise<void> {
  const protein = meal.items.reduce((s, i) => s + i.protein * i.quantity, 0);
  const calories = meal.items.reduce((s, i) => s + i.calories * i.quantity, 0);
  const carbs = meal.items.reduce((s, i) => s + (i.carbs || 0) * i.quantity, 0);
  const fat = meal.items.reduce((s, i) => s + (i.fat || 0) * i.quantity, 0);

  await db().runAsync(
    'INSERT INTO log_entries(date, kind, source_id, name, serving, quantity, protein, calories, carbs, fat, meal_type) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      date,
      'meal',
      meal.id,
      meal.name,
      '1 meal combo',
      1,
      protein,
      calories,
      carbs,
      fat,
      mealType,
    ]
  );
}

export async function updateLogQuantity(
  id: number,
  quantity: number,
  proteinPerUnit: number,
  caloriesPerUnit: number,
  carbsPerUnit = 0,
  fatPerUnit = 0
): Promise<void> {
  await db().runAsync(
    'UPDATE log_entries SET quantity = ?, protein = ?, calories = ?, carbs = ?, fat = ? WHERE id = ?',
    [
      quantity,
      proteinPerUnit * quantity,
      caloriesPerUnit * quantity,
      carbsPerUnit * quantity,
      fatPerUnit * quantity,
      id,
    ]
  );
}

export async function deleteLog(id: number): Promise<void> {
  await db().runAsync('DELETE FROM log_entries WHERE id = ?', [id]);
}

export async function clearDayLogs(date: string): Promise<void> {
  await db().runAsync('DELETE FROM log_entries WHERE date = ?', [date]);
}

// ----------------- WATER TRACKING -----------------

export async function getWaterLogs(date: string): Promise<WaterLog[]> {
  return db().getAllAsync<WaterLog>(
    'SELECT id, date, amount, time FROM water_logs WHERE date = ? ORDER BY id DESC',
    [date]
  );
}

export async function addWaterLog(date: string, amount: number): Promise<void> {
  const now = new Date();
  const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  await db().runAsync(
    'INSERT INTO water_logs(date, amount, time) VALUES(?, ?, ?)',
    [date, amount, time]
  );
}

export async function deleteWaterLog(id: number): Promise<void> {
  await db().runAsync('DELETE FROM water_logs WHERE id = ?', [id]);
}

export async function clearDayWater(date: string): Promise<void> {
  await db().runAsync('DELETE FROM water_logs WHERE date = ?', [date]);
}

// ----------------- HISTORY & TRENDS -----------------

export async function getHistory(): Promise<DayHistory[]> {
  const foodTotals = await db().getAllAsync<{
    date: string;
    protein: number;
    calories: number;
    carbs: number;
    fat: number;
    entries: number;
  }>(`
    SELECT date,
      ROUND(SUM(protein), 1) as protein,
      ROUND(SUM(calories), 1) as calories,
      ROUND(SUM(carbs), 1) as carbs,
      ROUND(SUM(fat), 1) as fat,
      COUNT(*) as entries
    FROM log_entries
    GROUP BY date
    ORDER BY date DESC
  `);

  const waterTotals = await db().getAllAsync<{ date: string; water: number }>(`
    SELECT date, SUM(amount) as water
    FROM water_logs
    GROUP BY date
  `);

  const waterMap = new Map<string, number>();
  waterTotals.forEach(w => waterMap.set(w.date, w.water));

  const allDates = new Set<string>();
  foodTotals.forEach(f => allDates.add(f.date));
  waterTotals.forEach(w => allDates.add(w.date));

  const foodMap = new Map(foodTotals.map(f => [f.date, f]));

  const result: DayHistory[] = [];
  Array.from(allDates)
    .sort((a, b) => b.localeCompare(a))
    .forEach(d => {
      const f = foodMap.get(d);
      result.push({
        date: d,
        protein: f ? f.protein : 0,
        calories: f ? f.calories : 0,
        carbs: f ? f.carbs : 0,
        fat: f ? f.fat : 0,
        water: waterMap.get(d) || 0,
        entries: f ? f.entries : 0,
      });
    });

  return result;
}

export async function getWeeklyHistory(endDateKey = todayKey()): Promise<DayHistory[]> {
  const result: DayHistory[] = [];
  const curr = new Date(`${endDateKey}T12:00:00`);

  for (let i = 6; i >= 0; i--) {
    const d = new Date(curr);
    d.setDate(d.getDate() - i);
    const key = todayKey(d);

    const f = await db().getFirstAsync<{
      protein: number;
      calories: number;
      carbs: number;
      fat: number;
      entries: number;
    }>(
      `SELECT ROUND(SUM(protein), 1) as protein, ROUND(SUM(calories), 1) as calories,
              ROUND(SUM(carbs), 1) as carbs, ROUND(SUM(fat), 1) as fat, COUNT(*) as entries
       FROM log_entries WHERE date = ?`,
      [key]
    );

    const w = await db().getFirstAsync<{ water: number }>(
      'SELECT SUM(amount) as water FROM water_logs WHERE date = ?',
      [key]
    );

    result.push({
      date: key,
      protein: f?.protein || 0,
      calories: f?.calories || 0,
      carbs: f?.carbs || 0,
      fat: f?.fat || 0,
      water: w?.water || 0,
      entries: f?.entries || 0,
    });
  }

  return result;
}

// ----------------- BACKUP, EXPORT & IMPORT -----------------

export async function exportAllData(): Promise<ExportData> {
  const settingsRows = await db().getAllAsync<{ key: string; value: string }>('SELECT key, value FROM settings');
  const settings: Record<string, string> = {};
  settingsRows.forEach(r => { settings[r.key] = r.value; });

  const foods = await db().getAllAsync<Food>('SELECT * FROM foods ORDER BY id ASC');
  const meals = await getMeals();
  const logEntries = await db().getAllAsync<LogEntry>('SELECT * FROM log_entries ORDER BY id ASC');
  const waterLogs = await db().getAllAsync<WaterLog>('SELECT * FROM water_logs ORDER BY id ASC');

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    settings,
    foods,
    meals,
    logEntries,
    waterLogs,
  };
}

export async function importAllData(jsonStr: string): Promise<{ success: boolean; message: string }> {
  try {
    const data: ExportData = JSON.parse(jsonStr);
    if (!data || !Array.isArray(data.foods)) {
      return { success: false, message: 'Invalid backup file structure.' };
    }

    await db().withTransactionAsync(async () => {
      // 1. Restore settings
      if (data.settings && typeof data.settings === 'object') {
        for (const [k, v] of Object.entries(data.settings)) {
          await db().runAsync(
            'INSERT INTO settings(key, value) VALUES(?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
            [k, String(v)]
          );
        }
      }

      // 2. Restore foods (skip duplicates by name)
      for (const f of data.foods) {
        if (!f.name || !f.serving) continue;
        const existing = await db().getFirstAsync<{ id: number }>('SELECT id FROM foods WHERE name = ?', [f.name]);
        if (!existing) {
          await db().runAsync(
            'INSERT INTO foods(name, serving, protein, calories, carbs, fat, category) VALUES(?, ?, ?, ?, ?, ?, ?)',
            [f.name, f.serving, f.protein || 0, f.calories || 0, f.carbs || 0, f.fat || 0, f.category || 'General']
          );
        }
      }

      // 3. Restore meals (skip duplicates by name)
      if (Array.isArray(data.meals)) {
        for (const m of data.meals) {
          if (!m.name) continue;
          let existingMeal = await db().getFirstAsync<{ id: number }>('SELECT id FROM meals WHERE name = ?', [m.name]);
          let mealId: number;
          if (!existingMeal) {
            const r = await db().runAsync('INSERT INTO meals(name) VALUES(?)', [m.name]);
            mealId = Number(r.lastInsertRowId);
            if (Array.isArray(m.items)) {
              for (const item of m.items) {
                await db().runAsync(
                  'INSERT INTO meal_items(meal_id, food_id, name_snapshot, serving_snapshot, protein_snapshot, calories_snapshot, carbs_snapshot, fat_snapshot, quantity) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)',
                  [
                    mealId,
                    item.foodId || null,
                    item.name,
                    item.serving,
                    item.protein || 0,
                    item.calories || 0,
                    item.carbs || 0,
                    item.fat || 0,
                    item.quantity || 1,
                  ]
                );
              }
            }
          }
        }
      }

      // 4. Restore log entries (skip exact duplicates on date, name, quantity, mealType)
      if (Array.isArray(data.logEntries)) {
        for (const l of data.logEntries) {
          if (!l.date || !l.name) continue;
          const mealType = l.mealType || 'breakfast';
          const existingLog = await db().getFirstAsync<{ id: number }>(
            'SELECT id FROM log_entries WHERE date = ? AND name = ? AND quantity = ? AND meal_type = ?',
            [l.date, l.name, l.quantity, mealType]
          );
          if (!existingLog) {
            await db().runAsync(
              'INSERT INTO log_entries(date, kind, source_id, name, serving, quantity, protein, calories, carbs, fat, meal_type) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
              [
                l.date,
                l.kind || 'food',
                l.sourceId || null,
                l.name,
                l.serving || '1 portion',
                l.quantity || 1,
                l.protein || 0,
                l.calories || 0,
                l.carbs || 0,
                l.fat || 0,
                mealType,
              ]
            );
          }
        }
      }

      // 5. Restore water logs (skip exact duplicates on date, amount, time)
      if (Array.isArray(data.waterLogs)) {
        for (const w of data.waterLogs) {
          if (!w.date || !w.amount) continue;
          const time = w.time || '12:00';
          const existingWater = await db().getFirstAsync<{ id: number }>(
            'SELECT id FROM water_logs WHERE date = ? AND amount = ? AND time = ?',
            [w.date, w.amount, time]
          );
          if (!existingWater) {
            await db().runAsync(
              'INSERT INTO water_logs(date, amount, time) VALUES(?, ?, ?)',
              [w.date, w.amount, time]
            );
          }
        }
      }
    });

    return { success: true, message: 'Data imported and deduplicated successfully!' };
  } catch (err: any) {
    return { success: false, message: `Import failed: ${err.message}` };
  }
}

export async function resetAllData(): Promise<void> {
  await db().withTransactionAsync(async () => {
    await db().runAsync('DELETE FROM log_entries');
    await db().runAsync('DELETE FROM water_logs');
    await db().runAsync('DELETE FROM meal_items');
    await db().runAsync('DELETE FROM meals');
    await db().runAsync('DELETE FROM foods');
    await db().runAsync('DELETE FROM settings');

    // Re-seed initial data
    for (const f of INITIAL_FOOD_SEEDS) {
      await db().runAsync(
        'INSERT INTO foods(name, serving, protein, calories, carbs, fat, category) VALUES(?, ?, ?, ?, ?, ?, ?)',
        [f.name, f.serving, f.protein, f.calories, f.carbs, f.fat, f.category]
      );
    }

    const defaults: [string, string][] = [
      ['proteinTarget', '130'],
      ['calorieTarget', '2100'],
      ['carbsTarget', '220'],
      ['fatTarget', '65'],
      ['waterTarget', '2500'],
      ['userName', 'You'],
      ['userAge', '26'],
      ['userGender', 'male'],
      ['userHeightCm', '175'],
      ['userWeightKg', '72'],
      ['activityLevel', 'moderate'],
      ['goal', 'maintain'],
      ['streakCount', '1'],
      ['lastActiveDate', todayKey()],
      ['lastCelebratedDate', ''],
    ];

    for (const [key, value] of defaults) {
      await db().runAsync('INSERT INTO settings(key, value) VALUES(?, ?)', [key, value]);
    }
  });
}
