# Protein Tracker

A local-first Android & iOS nutrition, protein, and calorie tracker built with **React Native**, **Expo (SDK 57)**, **TypeScript**, and **Expo SQLite**. Inspired by modern fitness apps with sleek radial gauges, personalized macro calculations, comprehensive Indian food library, Oasis-style water tracker, and Duolingo-like celebrations.

No accounts, backend, or internet connection are required. 100% of data remains offline on your device in persistent SQLite storage.

---

## 🌟 Key Features

### 1. Modern Dashboard (Inspired by UI Reference Pages 1 & 6)
- **SVG Calorie Radial Gauge**: Curved segmented arc meter displaying active calorie burn/intake, flame badge, and remaining calories.
- **Tri-Macro Cards**: Live progress tracking for Protein, Carbs, and Fats with proportional bars and target milestones.
- **Categorized Daily Meal Slots**: Plan and track meals under **Breakfast**, **Lunch**, **Dinner**, and **Snacks & Shakes** with recommended calorie guidelines.
- **Log Management**: Edit serving quantities with steppers and delete entries with safety confirmation.
- **Hydration Glance**: Quick daily water progress bar directly on the dashboard.

### 2. Comprehensive Food Library with Indian Staples (Page 2)
- **Indian Food Catalog**: Pre-populated starter library of 35+ authentic Indian foods & fitness staples (Paneer Bhurji, Dal Tadka, Chana Masala, Soya Chunks Curry, Roti / Chapati, Besan Chilla, Chicken Tikka, Egg Curry, Whey Protein in Milk, Poha, etc.).
- **Category Filter Chips**: Filter seamlessly by *High-Protein*, *Indian Staples*, *Dairy & Veg*, *Poultry & Meat*, *Snacks & Breakfast*, and *Fruits & Salads*.
- **Quick Logging**: 1-tap food logging to any meal slot with adjustable portions.
- **Custom Foods**: Add, edit, or delete personal foods with customized calories, protein, carbs, and fat per serving.

### 3. Combo Meal Templates (Saved Meals)
- Group frequently eaten foods into single combo meal templates (e.g. "Desi High-Protein Breakfast" = 2 boiled eggs + 1 glass toned milk + oats).
- 1-tap logging of entire meal combinations to your daily tracker.

### 4. Oasis Drink Tracker / Water Tracking (Page 5)
- **Oasis Circular Arc Gauge**: Beautiful large circular gauge displaying hydration percentage completed.
- **Portion Selector**: Quick portion pills for **100 ml**, **200 ml**, **250 ml (1 glass)**, and **500 ml (1 bottle)**, or custom inputs.
- **Visual Glasses Grid**: Visual indicator showing filled vs remaining water cups (250 ml each).
- **Customizable Hydration Goal**: Easily adjust your daily water target.

### 5. Progress History & Trends (Page 4)
- **Weekly KPI Averages**: Average daily protein, average daily calories, average hydration, and active days.
- **7-Day Consistency Chart**: Visual bar chart tracking daily protein intake against your target line.
- **Daily Archive**: Revisit any past day's logs and edit records retrospectively.

### 6. Science-Backed Personalized Goals Calculator
- Calculates BMR (Basal Metabolic Rate) and TDEE using the **Mifflin-St Jeor formula**.
- Takes age, gender, height (cm), weight (kg), activity level (sedentary to very active), and primary goal (fat loss, maintain, muscle build).
- Recommends optimal daily protein (1.8g - 2.1g per kg bodyweight), calories, carbs, fats, and water intake.
- Fully editable: user can apply recommendations or tweak numbers manually anytime.

### 7. Duolingo-Like Celebrations
- Celebrates goal achievement with animated falling confetti particles and a bouncing golden trophy card.
- Tracks daily consistency streak ("🔥 3 Day Streak!").
- Can be previewed anytime from the dashboard or settings.

### 8. Data Management & Backups
- **Export Backup (JSON)**: Generate complete backups shareable via native Share sheet (save to Files, Google Drive, WhatsApp, Email, etc.).
- **Import Backup**: Paste and restore backups safely.
- **Replenish Indian Library**: Restore default Indian foods without deleting custom foods.
- **Clear Date Records**: Clear logs for a specific day.
- **Factory Reset**: Option to reset app back to initial clean state with confirmation.

---

## 🚀 How to Run in Expo Go (Android & iOS)

### Requirements:
- Node.js 20.19.4 or newer and npm.
- **Expo Go** app installed on your Android device (from Google Play Store) or iOS device (from App Store).

### Steps:
1. Open terminal in the project directory:
   ```bash
   cd protein-tracker
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Expo development server:
   ```bash
   npx expo start
   ```
4. Connect your phone:
   - Ensure your computer and mobile phone are connected to the same Wi-Fi network.
   - Scan the QR code shown in terminal using the Expo Go app (on Android) or Camera app (on iOS).
   - If Wi-Fi discovery has network firewall restrictions, run with tunnel mode:
     ```bash
     npx expo start --tunnel
     ```

---

## 📦 Building an Installable Android APK (Free EAS Build)

The project is pre-configured with `eas.json` for generating standalone APKs using Expo's free tier cloud build:

1. Install EAS CLI:
   ```bash
   npm install -g eas-cli
   ```
2. Log in with your free Expo account:
   ```bash
   npx eas-cli login
   ```
3. Build the preview APK:
   ```bash
   npx eas-cli build --platform android --profile preview
   ```
4. When the cloud build finishes, EAS will provide a direct download link for the `.apk` file. Download and install it onto your Android phone!

---

## 🛠 Type-Checking & Verification

Run TypeScript compiler in no-emit mode to verify code integrity:
```bash
npm run typecheck
```
