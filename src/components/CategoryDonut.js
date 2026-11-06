import React, { useEffect, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { colors } from '../theme/colors';

const CHART_COLORS = [
  '#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6',
  '#ec4899', '#06b6d4', '#f97316', '#6366f1', '#14b8a6',
];

const SIZE = 220;
const CENTER = SIZE / 2;
const RADIUS = 84;
const STROKE = 26;
const STROKE_ACTIVE = 36;
const GAP_DEGREES = 1.5;

const formatCurrency = (amount) =>
  '₹' + Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const pointAt = (degrees) => {
  const radians = ((degrees - 90) * Math.PI) / 180;
  return `${CENTER + RADIUS * Math.cos(radians)} ${CENTER + RADIUS * Math.sin(radians)}`;
};

const arcPath = (startDegrees, endDegrees) => {
  // A full circle has no arc between identical points, so stop just short of it.
  const end = Math.min(endDegrees, startDegrees + 359.99);
  const largeArc = end - startDegrees > 180 ? 1 : 0;
  return `M ${pointAt(startDegrees)} A ${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${pointAt(end)}`;
};

// Sweeps from 0 to 1 once on mount, or jumps to 1 for people who reduce motion.
const useRevealProgress = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let mounted = true;
    const value = new Animated.Value(0);
    value.addListener((state) => setProgress(state.value));

    AccessibilityInfo.isReduceMotionEnabled()
      .catch(() => false)
      .then((reduceMotion) => {
        if (!mounted) return;
        if (reduceMotion) {
          setProgress(1);
          return;
        }
        Animated.timing(value, {
          toValue: 1,
          duration: 900,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }).start();
      });

    return () => {
      mounted = false;
      value.stopAnimation();
      value.removeAllListeners();
    };
  }, []);

  return progress;
};

const CategoryDonut = ({ data }) => {
  const progress = useRevealProgress();
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(null);

  const total = data.reduce((sum, item) => sum + Math.max(0, item.totalAmount || 0), 0);
  if (total <= 0) return null;

  let cursor = 0;
  const slices = data.map((item, index) => {
    const share = Math.max(0, item.totalAmount || 0) / total;
    const start = cursor;
    cursor += share * 360;
    return {
      name: item.category,
      amount: item.totalAmount,
      percent: share * 100,
      color: CHART_COLORS[index % CHART_COLORS.length],
      start,
      end: cursor,
    };
  });

  const gap = slices.length > 1 ? GAP_DEGREES : 0;
  const activeName = hovered ?? selected;
  const active = slices.find((slice) => slice.name === activeName);
  const toggle = (name) => setSelected((current) => (current === name ? null : name));

  return (
    <View style={styles.container}>
      <View style={styles.chart}>
        <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
          <Circle cx={CENTER} cy={CENTER} r={RADIUS} stroke={colors.surfaceHigh} strokeWidth={STROKE} fill="none" />
          {slices.map((slice) => {
            const start = slice.start * progress;
            const end = slice.end * progress;
            if (end - start <= gap) return null;
            const isActive = slice.name === activeName;
            return (
              <Path
                key={slice.name}
                d={arcPath(start + gap / 2, end - gap / 2)}
                stroke={slice.color}
                strokeWidth={isActive ? STROKE_ACTIVE : STROKE}
                strokeOpacity={active && !isActive ? 0.3 : 1}
                fill="none"
                onPress={() => toggle(slice.name)}
                onMouseEnter={() => setHovered(slice.name)}
                onMouseLeave={() => setHovered(null)}
              />
            );
          })}
        </Svg>
        <View style={styles.center} pointerEvents="none">
          <Text style={styles.centerLabel} numberOfLines={1}>{active ? active.name : 'Total'}</Text>
          <Text style={styles.centerValue} numberOfLines={1} adjustsFontSizeToFit>
            {formatCurrency(active ? active.amount : total * progress)}
          </Text>
          <Text style={styles.centerHint} numberOfLines={1}>
            {active ? `${active.percent.toFixed(1)}%` : 'Tap a slice'}
          </Text>
        </View>
      </View>

      <View style={styles.legend}>
        {slices.map((slice) => {
          const isActive = slice.name === activeName;
          return (
            <Pressable
              key={slice.name}
              onPress={() => toggle(slice.name)}
              onHoverIn={() => setHovered(slice.name)}
              onHoverOut={() => setHovered(null)}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={`${slice.name}, ${formatCurrency(slice.amount)}, ${slice.percent.toFixed(1)} percent`}
              style={[styles.legendRow, isActive && styles.legendRowActive]}
            >
              <View style={styles.legendTop}>
                <View style={[styles.legendDot, { backgroundColor: slice.color }]} />
                <Text style={styles.legendName} numberOfLines={1}>{slice.name}</Text>
                <Text style={styles.legendAmount}>{formatCurrency(slice.amount)}</Text>
                <Text style={styles.legendPercent}>{slice.percent.toFixed(1)}%</Text>
              </View>
              <View style={styles.legendTrack}>
                <View style={[styles.legendFill, { backgroundColor: slice.color, width: `${slice.percent * progress}%` }]} />
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  chart: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    position: 'absolute',
    width: 124,
    alignItems: 'center',
  },
  centerLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  centerValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginVertical: 2,
  },
  centerHint: {
    fontSize: 11,
    color: colors.textFaint,
  },
  legend: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 280,
    gap: 4,
  },
  legendRow: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  legendRowActive: {
    backgroundColor: colors.surfaceHigh,
    borderColor: colors.border,
  },
  legendTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendName: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
  },
  legendAmount: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  legendPercent: {
    width: 48,
    textAlign: 'right',
    fontSize: 12,
    color: colors.textMuted,
  },
  legendTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.surfaceHigh,
    overflow: 'hidden',
  },
  legendFill: {
    height: 4,
    borderRadius: 2,
  },
});

export default CategoryDonut;
