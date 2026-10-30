import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Dimensions,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Shadows } from '../theme';

interface ConfettiPieceProps {
  startX: number;
  color: string;
  size: number;
  delay: number;
}

const CONFETTI_COLORS = ['#1FB267', '#FF6E2E', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899', '#10B981'];

const ConfettiParticle: React.FC<ConfettiPieceProps> = ({ startX, color, size, delay }) => {
  const translateY = useRef(new Animated.Value(-30)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: Dimensions.get('window').height + 40,
          duration: 2400 + Math.random() * 1000,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          useNativeDriver: true,
        }),
        Animated.timing(rotate, {
          toValue: 1,
          duration: 2000 + Math.random() * 1200,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.2,
          duration: 2800,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [delay, opacity, rotate, translateY]);

  const spin = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', `${(Math.random() > 0.5 ? 1 : -1) * 720}deg`],
  });

  return (
    <Animated.View
      style={[
        styles.confetti,
        {
          left: startX,
          width: size,
          height: size * 1.5,
          backgroundColor: color,
          borderRadius: size > 9 ? 2 : size / 2,
          transform: [{ translateY }, { rotate: spin }],
          opacity,
        },
      ]}
    />
  );
};

interface CelebrationModalProps {
  visible: boolean;
  title?: string;
  message?: string;
  streak?: number;
  onClose: () => void;
}

export const CelebrationModal: React.FC<CelebrationModalProps> = ({
  visible,
  title = 'Goal Achieved!',
  message = "You've crushed your daily target! Keep up the momentum.",
  streak = 1,
  onClose,
}) => {
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    if (visible) {
      scaleAnim.setValue(0.3);
      bounceAnim.setValue(0);
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 80,
        useNativeDriver: true,
      }).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: -8,
            duration: 800,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 800,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [bounceAnim, scaleAnim, visible]);

  if (!visible) return null;

  // Generate 32 randomized confetti pieces
  const confettiList = Array.from({ length: 32 }).map((_, i) => ({
    id: i,
    startX: Math.random() * (screenWidth - 20) + 10,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    size: 7 + Math.random() * 8,
    delay: Math.random() * 800,
  }));

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        {/* Confetti raining down */}
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {confettiList.map(c => (
            <ConfettiParticle
              key={c.id}
              startX={c.startX}
              color={c.color}
              size={c.size}
              delay={c.delay}
            />
          ))}
        </View>

        {/* Celebratory Dialog Card */}
        <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
          <Animated.View
            style={[
              styles.trophyWrapper,
              { transform: [{ translateY: bounceAnim }] },
            ]}
          >
            <View style={styles.trophyGlow}>
              <Ionicons name="trophy" size={54} color="#F59E0B" />
            </View>
          </Animated.View>

          <View style={styles.streakBadge}>
            <Ionicons name="flame" size={16} color="#FF6E2E" />
            <Text style={styles.streakText}>{streak} Day Streak!</Text>
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.quoteCard}>
            <Text style={styles.quoteText}>“Small steps lead to massive results.”</Text>
          </View>

          <Pressable style={styles.continueButton} onPress={onClose}>
            <Text style={styles.continueText}>Awesome! Let's Go 🚀</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 20, 14, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  confetti: {
    position: 'absolute',
    top: 0,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 26,
    alignItems: 'center',
    width: '100%',
    maxWidth: 360,
    ...Shadows.floating,
  },
  trophyWrapper: {
    marginBottom: 14,
  },
  trophyGlow: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#FDE68A',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF2EB',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  streakText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FF6E2E',
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.ink,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.inkSecondary,
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  quoteCard: {
    backgroundColor: '#F3F6F2',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 22,
    width: '100%',
  },
  quoteText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: Colors.muted,
    textAlign: 'center',
  },
  continueButton: {
    backgroundColor: Colors.primary,
    width: '100%',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.glow(Colors.primary),
  },
  continueText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
