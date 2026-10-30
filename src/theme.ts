export const Colors = {
  bg: '#F8FAF8',
  card: '#FFFFFF',
  cardAlt: '#F3F6F2',
  cardBorder: '#E6EAE4',
  
  // Brand colors
  primary: '#1FB267',      // Duolingo/modern health vibrant green
  primaryLight: '#E8F7EE',
  primaryDark: '#158046',
  
  // Macro & Metric colors (matching reference PDF)
  calories: '#FF6E2E',     // Flame orange for calories
  caloriesLight: '#FFF2EB',
  caloriesDark: '#D94F12',
  
  protein: '#1FB267',      // Emerald green for protein
  proteinLight: '#E8F7EE',
  
  carbs: '#3B82F6',        // Clean sky/azure blue for carbs
  carbsLight: '#EFF6FF',
  
  fat: '#8B5CF6',          // Purple/violet for fat
  fatLight: '#F5F3FF',
  
  water: '#0EA5E9',        // Ocean blue/cyan for water
  waterLight: '#E0F2FE',
  waterDark: '#0284C7',
  
  // Neutral typography
  ink: '#141A16',          // Dark obsidian text
  inkSecondary: '#4A554E',
  muted: '#7A877E',
  subtle: '#A2B0A6',
  border: '#E8ECE6',
  borderLight: '#F0F3EE',
  
  // Status & accents
  gold: '#F59E0B',
  goldLight: '#FEF3C7',
  danger: '#EF4444',
  dangerLight: '#FEE2E2',
  
  // Floating bottom bar
  tabBarBg: '#131916',
  tabBarActiveBg: '#1FB267',
  tabBarInactive: '#8A9990',
  tabBarActiveText: '#FFFFFF',
};

export const Shadows = {
  soft: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  card: {
    shadowColor: '#0B2014',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 3,
  },
  floating: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 20,
    elevation: 8,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  }),
};
