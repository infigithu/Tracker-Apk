import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Line, Circle, Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme';

interface CalorieRadialGaugeProps {
  consumed: number;
  target: number;
  size?: number;
  mode?: 'calories' | 'protein';
}

/**
 * Curved radial segmented tick gauge matching Page 1 of the UI reference.
 */
export const CalorieRadialGauge: React.FC<CalorieRadialGaugeProps> = ({
  consumed,
  target,
  size = 280,
  mode = 'calories',
}) => {
  const safeTarget = Math.max(1, target);
  const progress = Math.min(1.15, Math.max(0, consumed / safeTarget));
  const remaining = Math.max(0, safeTarget - consumed);

  // Geometry for arc
  const cx = size / 2;
  const cy = size * 0.58;
  const rInner = size * 0.35;
  const rOuter = size * 0.44;
  const totalTicks = 26;

  // Arc angles from 145deg (bottom-left) to 395deg (bottom-right)
  const startAngleDeg = 145;
  const endAngleDeg = 395;
  const angleRange = endAngleDeg - startAngleDeg;

  const ticks = [];
  const activeTicksCount = Math.round(Math.min(1, progress) * totalTicks);

  for (let i = 0; i < totalTicks; i++) {
    const fraction = i / (totalTicks - 1);
    const angleDeg = startAngleDeg + fraction * angleRange;
    const angleRad = (angleDeg * Math.PI) / 180;

    const x1 = cx + rInner * Math.cos(angleRad);
    const y1 = cy + rInner * Math.sin(angleRad);
    const x2 = cx + rOuter * Math.cos(angleRad);
    const y2 = cy + rOuter * Math.sin(angleRad);

    const isActive = i < activeTicksCount;
    // Active ticks use vibrant purple/violet gradient matching Page 1
    const strokeColor = isActive ? '#7C3AED' : '#E4E7F2';
    const strokeWidth = isActive ? 6 : 5;

    ticks.push(
      <Line
        key={`tick-${i}`}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    );
  }

  const height = size * 0.76;

  return (
    <View style={[styles.gaugeContainer, { width: size, height }]}>
      <Svg width={size} height={height} viewBox={`0 0 ${size} ${height}`}>
        {ticks}
      </Svg>

      <View style={[styles.gaugeCenter, { top: cy - 48 }]}>
        <View style={styles.flameCircle}>
          <Ionicons
            name={mode === 'calories' ? 'flame' : 'barbell'}
            size={18}
            color="#FF6B00"
          />
        </View>

        <Text style={styles.gaugeNumber}>{Math.round(consumed)}</Text>
        <Text style={styles.gaugeUnit}>{mode === 'calories' ? 'kcal' : 'g protein'}</Text>

        <View style={styles.remainingPill}>
          <Text style={styles.remainingPillText}>
            {consumed >= safeTarget ? 'Target reached! 🎉' : `${Math.round(remaining)} ${mode === 'calories' ? 'kcal' : 'g'} left`}
          </Text>
        </View>
      </View>
    </View>
  );
};

interface WaterArcGaugeProps {
  consumed: number;
  goal: number;
  size?: number;
}

/**
 * Oasis Water Tracker circular arc meter matching Page 5 of the UI reference.
 */
export const WaterArcGauge: React.FC<WaterArcGaugeProps> = ({
  consumed,
  goal,
  size = 230,
}) => {
  const safeGoal = Math.max(1, goal);
  const pct = Math.min(1.5, Math.max(0, consumed / safeGoal));
  const pctDisplay = Math.round((consumed / safeGoal) * 100);

  const strokeWidth = 18;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // 270 degree arc (sweep 75% of full circle)
  const arcLength = circumference * 0.75;
  const strokeDashoffset = arcLength - Math.min(1, pct) * arcLength;

  return (
    <View style={[styles.waterGaugeWrap, { width: size, height: size * 0.88 }]}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: '135deg' }] }}>
        <Defs>
          <LinearGradient id="waterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#38BDF8" />
            <Stop offset="100%" stopColor="#0284C7" />
          </LinearGradient>
        </Defs>

        {/* Background track */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E0F2FE"
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeLinecap="round"
          fill="none"
        />

        {/* Progress Fill */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#waterGrad)"
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
        />
      </Svg>

      <View style={styles.waterCenterOverlay}>
        <Text style={styles.waterPct}>{pctDisplay}%</Text>
        <Text style={styles.waterPctSub}>Completed</Text>
        <View style={styles.waterHydrationBadge}>
          <Text style={styles.waterHydrationText}>
            {pctDisplay >= 100 ? '💧 Optimal Hydration!' : `${Math.round(consumed)} / ${Math.round(goal)} ml`}
          </Text>
        </View>
      </View>
    </View>
  );
};

interface MacroCardProps {
  label: string;
  consumed: number;
  target: number;
  color: string;
  lightColor: string;
  unit?: string;
}

/**
 * Macro indicator card matching Page 1 & Page 6 of the UI reference.
 */
export const MacroCard: React.FC<MacroCardProps> = ({
  label,
  consumed,
  target,
  color,
  lightColor,
  unit = 'g',
}) => {
  const safeTarget = Math.max(1, target);
  const pct = Math.min(1, Math.max(0, consumed / safeTarget));

  return (
    <View style={styles.macroCard}>
      <View style={styles.macroHeader}>
        <Text style={styles.macroLabel}>{label}</Text>
        <View style={[styles.macroDot, { backgroundColor: color }]} />
      </View>

      <View style={styles.macroValues}>
        <Text style={styles.macroCurrent}>
          {Math.round(consumed)}
          <Text style={styles.macroTarget}> / {Math.round(target)}{unit}</Text>
        </Text>
      </View>

      <View style={[styles.macroTrack, { backgroundColor: lightColor }]}>
        <View
          style={[
            styles.macroFill,
            { width: `${pct * 100}%`, backgroundColor: color },
          ]}
        />
      </View>
    </View>
  );
};

interface WaterGlassesGridProps {
  consumedMl: number;
  goalMl: number;
  glassSizeMl?: number;
}

/**
 * Water glasses visualization matching Page 4 & Page 5.
 */
export const WaterGlassesGrid: React.FC<WaterGlassesGridProps> = ({
  consumedMl,
  goalMl,
  glassSizeMl = 250,
}) => {
  const totalGlasses = Math.max(8, Math.round(goalMl / glassSizeMl));
  const filledGlasses = Math.min(totalGlasses, Math.floor(consumedMl / glassSizeMl));
  const partialGlassPct = ((consumedMl % glassSizeMl) / glassSizeMl);

  return (
    <View style={styles.glassesWrap}>
      {Array.from({ length: totalGlasses }).map((_, index) => {
        const isFull = index < filledGlasses;
        const isPartial = index === filledGlasses && partialGlassPct > 0;

        return (
          <View
            key={`glass-${index}`}
            style={[
              styles.glassItem,
              isFull && styles.glassItemFilled,
              isPartial && styles.glassItemPartial,
            ]}
          >
            <Ionicons
              name={isFull ? 'water' : 'water-outline'}
              size={18}
              color={isFull ? '#0284C7' : '#94A3B8'}
            />
            <Text
              style={[
                styles.glassIndexText,
                isFull && { color: '#0369A1', fontWeight: '700' },
              ]}
            >
              {(index + 1) * glassSizeMl}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  gaugeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    position: 'relative',
    marginVertical: 4,
  },
  gaugeCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flameCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF4EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  gaugeNumber: {
    fontSize: 40,
    fontWeight: '800',
    color: Colors.ink,
    letterSpacing: -1,
  },
  gaugeUnit: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.muted,
    marginTop: -2,
  },
  remainingPill: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 6,
  },
  remainingPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.inkSecondary,
  },
  waterGaugeWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    position: 'relative',
  },
  waterCenterOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  waterPct: {
    fontSize: 42,
    fontWeight: '800',
    color: '#0369A1',
    letterSpacing: -1,
  },
  waterPctSub: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
  waterHydrationBadge: {
    marginTop: 8,
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  waterHydrationText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284C7',
  },
  macroCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EFF2EE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  macroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  macroLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.muted,
  },
  macroDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  macroValues: {
    marginBottom: 8,
  },
  macroCurrent: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.ink,
  },
  macroTarget: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.muted,
  },
  macroTrack: {
    height: 6,
    borderRadius: 6,
    overflow: 'hidden',
  },
  macroFill: {
    height: '100%',
    borderRadius: 6,
  },
  glassesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  glassItem: {
    width: '22%',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  glassItemFilled: {
    backgroundColor: '#E0F2FE',
    borderColor: '#7DD3FC',
  },
  glassItemPartial: {
    backgroundColor: '#F0F9FF',
    borderColor: '#BAE6FD',
  },
  glassIndexText: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 4,
  },
});
