import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getCategoryStyle } from '../theme/categories';
import { colors } from '../theme/colors';

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatCurrency = (amount) => {
  if (amount == null) return '₹0.00';
  return '₹' + Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const REVIEW_HINT_MS = 2500;

const SOURCE_LABELS = { AI: 'AI', USER_CORRECTED: 'Edited by you' };

const formatMeta = (txn) => {
  const titleCase = (text) => text.charAt(0) + text.slice(1).toLowerCase();
  return [
    formatDate(txn.date),
    txn.type && titleCase(txn.type),
    txn.source && (SOURCE_LABELS[txn.source] || titleCase(txn.source)),
    txn.confidenceScore != null && `${Math.round(txn.confidenceScore * 100)}%`,
  ].filter(Boolean).join(' • ');
};

const TransactionRow = ({ txn, onEdit }) => {
  const category = getCategoryStyle(txn.category);
  const isIncome = txn.type === 'INCOME';
  const [hovered, setHovered] = useState(false);
  const [tapped, setTapped] = useState(false);
  const hintTimer = useRef(null);
  const showHint = hovered || tapped;

  useEffect(() => () => clearTimeout(hintTimer.current), []);

  // Touch screens have no hover, so a tap shows the hint for a moment.
  const handleHintTap = () => {
    setTapped(true);
    clearTimeout(hintTimer.current);
    hintTimer.current = setTimeout(() => setTapped(false), REVIEW_HINT_MS);
  };

  return (
    <View style={[styles.row, showHint && styles.raised]}>
      <View style={[styles.left, showHint && styles.raised]}>
        <View style={[styles.icon, { backgroundColor: category.tint }]}>
          <MaterialIcons name={category.icon} size={18} color={category.color} />
        </View>
        <View style={styles.info}>
          <View style={styles.descRow}>
            <Text style={styles.desc} numberOfLines={2}>{txn.description}</Text>
            {txn.needsReview ? (
              <Pressable
                style={styles.reviewIcon}
                onPress={handleHintTap}
                onHoverIn={() => setHovered(true)}
                onHoverOut={() => setHovered(false)}
                accessibilityRole="button"
                accessibilityLabel="Needs review"
              >
                <MaterialIcons name="warning-amber" size={15} color={colors.amber} />
                {showHint ? (
                  <View style={styles.hint} pointerEvents="none">
                    <Text style={styles.hintText}>Needs review</Text>
                  </View>
                ) : null}
              </Pressable>
            ) : null}
            {txn.merchant ? <Text style={styles.merchant}>{txn.merchant}</Text> : null}
          </View>
          <Text style={styles.meta}>{formatMeta(txn)}</Text>
        </View>
      </View>
      <View style={styles.right}>
        <Text style={[styles.amount, { color: isIncome ? colors.income : colors.expense }]}>
          {isIncome ? '+' : '-'}{formatCurrency(txn.amount)}
        </Text>
        <TouchableOpacity
          onPress={onEdit}
          style={[styles.pill, { backgroundColor: category.tint, borderColor: category.border }]}
          accessibilityRole="button"
          accessibilityLabel={`Edit ${txn.description}`}
        >
          <Text style={[styles.pillText, { color: category.color }]}>{txn.category || 'Uncategorized'}</Text>
          <MaterialIcons name="edit" size={13} color={category.color} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    marginBottom: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.divider,
    backgroundColor: colors.surfaceRow,
  },
  // Keeps the open hint above the rows and amount next to it.
  raised: {
    zIndex: 10,
  },
  reviewIcon: {
    padding: 4,
    margin: -4,
  },
  hint: {
    position: 'absolute',
    bottom: '100%',
    left: -29,
    width: 88,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.amberBorder,
    backgroundColor: colors.surfaceHighest,
  },
  hintText: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    color: colors.text,
  },
  left: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 260,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
  },
  descRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
  },
  desc: {
    flexShrink: 1,
    fontSize: 13,
    color: colors.text,
    fontWeight: '600',
  },
  merchant: {
    fontSize: 11,
    color: colors.violet,
    fontWeight: '600',
    backgroundColor: colors.violetTint,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
    overflow: 'hidden',
  },
  meta: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 3,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginLeft: 'auto',
  },
  amount: {
    fontSize: 14,
    fontWeight: '600',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '500',
  },
});

export default TransactionRow;
