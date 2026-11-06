import { MaterialIcons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors } from '../theme/colors';
import DateField from './DateField';
import TransactionRow from './TransactionRow';

const BankStatementTransactions = ({ transactions, onEditTransaction, reviewOnly, onReviewOnlyChange }) => {
  const [filterType, setFilterType] = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  // null means the field still shows the statement's first or last date.
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  // Get unique categories from transactions
  const categories = useMemo(() => {
    if (!transactions) return [];
    const uniqueCategories = [...new Set(transactions.map(t => t.category).filter(Boolean))];
    return uniqueCategories.sort();
  }, [transactions]);

  // The first and last transaction dates set the default and the allowed range.
  const statementDates = useMemo(
    () => (transactions || []).map((txn) => txn.date?.slice(0, 10)).filter(Boolean).sort(),
    [transactions]
  );
  const firstDate = statementDates[0];
  const lastDate = statementDates[statementDates.length - 1];
  const dateFrom = fromDate ?? firstDate;
  const dateTo = toDate ?? lastDate;
  const dateFilterOn = dateFrom !== firstDate || dateTo !== lastDate;

  const reviewCount = (transactions || []).filter((txn) => txn.needsReview).length;
  // Once everything is reviewed the filter has nothing to show, so it stops applying.
  const reviewFilterOn = reviewOnly && reviewCount > 0;

  // Filter transactions based on selected filters
  const filteredTransactions = useMemo(() => {
    if (!transactions) return [];
    
    return transactions.filter(txn => {
      // Needs review filter
      if (reviewFilterOn && !txn.needsReview) return false;

      // Date filter
      if (dateFilterOn) {
        const date = txn.date?.slice(0, 10);
        if (!date || date < dateFrom || date > dateTo) return false;
      }

      // Type filter
      if (filterType !== 'ALL' && txn.type !== filterType) return false;
      
      // Category filter
      if (filterCategory !== 'ALL' && txn.category !== filterCategory) return false;
      
      // Amount filter
      const amount = Number(txn.amount);
      if (minAmount && amount < Number(minAmount)) return false;
      if (maxAmount && amount > Number(maxAmount)) return false;
      
      return true;
    });
  }, [transactions, reviewFilterOn, dateFilterOn, dateFrom, dateTo, filterType, filterCategory, minAmount, maxAmount]);

  const clearFilters = () => {
    setFilterType('ALL');
    setFilterCategory('ALL');
    setMinAmount('');
    setMaxAmount('');
    setFromDate(null);
    setToDate(null);
    onReviewOnlyChange(false);
  };

  const hasActiveFilters = reviewFilterOn || dateFilterOn || filterType !== 'ALL' || filterCategory !== 'ALL' || minAmount || maxAmount;

  if (!transactions || transactions.length === 0) {
    return (
      <View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No transactions found</Text>
        </View>
      </View>
    );
  }

  return (
    <View>
      {/* Filters Section */}
      <View style={styles.filtersCard}>
        <View style={styles.filtersHeader}>
          <Text style={styles.filtersTitle}>Filters</Text>
          {hasActiveFilters && (
            <TouchableOpacity onPress={clearFilters} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Needs Review Filter */}
        {reviewCount > 0 && (
          <View style={styles.filterRow}>
            <TouchableOpacity
              style={[styles.reviewChip, reviewFilterOn && styles.reviewChipActive]}
              onPress={() => onReviewOnlyChange(!reviewOnly)}
            >
              <MaterialIcons name="warning-amber" size={15} color={colors.amber} />
              <Text style={styles.reviewChipText}>Needs review ({reviewCount})</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Type Filter */}
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Type</Text>
          <View style={styles.filterButtons}>
            <TouchableOpacity
              style={[styles.filterButton, filterType === 'ALL' && styles.filterButtonActive]}
              onPress={() => setFilterType('ALL')}
            >
              <Text style={[styles.filterButtonText, filterType === 'ALL' && styles.filterButtonTextActive]}>All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, filterType === 'EXPENSE' && styles.filterButtonActive]}
              onPress={() => setFilterType('EXPENSE')}
            >
              <Text style={[styles.filterButtonText, filterType === 'EXPENSE' && styles.filterButtonTextActive]}>Expense</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, filterType === 'INCOME' && styles.filterButtonActive]}
              onPress={() => setFilterType('INCOME')}
            >
              <Text style={[styles.filterButtonText, filterType === 'INCOME' && styles.filterButtonTextActive]}>Income</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Category Filter */}
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            <TouchableOpacity
              style={[styles.filterButton, filterCategory === 'ALL' && styles.filterButtonActive]}
              onPress={() => setFilterCategory('ALL')}
            >
              <Text style={[styles.filterButtonText, filterCategory === 'ALL' && styles.filterButtonTextActive]}>All</Text>
            </TouchableOpacity>
            {categories.map(cat => (
              <TouchableOpacity
                key={cat}
                style={[styles.filterButton, filterCategory === cat && styles.filterButtonActive]}
                onPress={() => setFilterCategory(cat)}
              >
                <Text style={[styles.filterButtonText, filterCategory === cat && styles.filterButtonTextActive]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Amount Filter */}
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Amount Range</Text>
          <View style={styles.amountInputs}>
            <TextInput
              style={styles.amountInput}
              placeholder="Min"
              placeholderTextColor={colors.textFaint}
              keyboardType="numeric"
              value={minAmount}
              onChangeText={setMinAmount}
            />
            <Text style={styles.amountSeparator}>-</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="Max"
              placeholderTextColor={colors.textFaint}
              keyboardType="numeric"
              value={maxAmount}
              onChangeText={setMaxAmount}
            />
          </View>
        </View>

        {/* Date Filter */}
        {firstDate && (
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Date Range</Text>
            <View style={styles.amountInputs}>
              <View style={styles.dateField}>
                <Text style={styles.dateCaption}>From</Text>
                <DateField value={dateFrom} min={firstDate} max={dateTo} onChange={setFromDate} label="From date" />
              </View>
              <Text style={[styles.amountSeparator, styles.dateSeparator]}>-</Text>
              <View style={styles.dateField}>
                <Text style={styles.dateCaption}>To</Text>
                <DateField value={dateTo} min={dateFrom} max={lastDate} onChange={setToDate} label="To date" />
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Transactions List */}
      <View style={styles.transactionsCard}>
        <Text style={styles.transactionsTitle}>
          Transactions ({filteredTransactions.length}{filteredTransactions.length !== transactions.length ? ` of ${transactions.length}` : ''})
        </Text>
        <Text style={styles.transactionsHint}>Tap a category to edit it.</Text>
        {filteredTransactions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No transactions match the selected filters</Text>
          </View>
        ) : (
          filteredTransactions.map((txn, idx) => (
            <TransactionRow key={txn.id || idx} txn={txn} onEdit={() => onEditTransaction(txn)} />
          ))
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  reviewChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.amberBorder,
  },
  reviewChipActive: {
    backgroundColor: colors.amberTint,
    borderColor: colors.amber,
  },
  reviewChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.amber,
  },
  filtersCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filtersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  filtersTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.primaryTint,
    borderRadius: 999,
  },
  clearButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primaryLight,
  },
  filterRow: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 8,
  },
  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: colors.surfaceHigh,
    borderRadius: 999,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterButtonActive: {
    backgroundColor: colors.primaryTint,
    borderColor: colors.primary,
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textMuted,
  },
  filterButtonTextActive: {
    color: colors.primaryLight,
  },
  categoryScroll: {
    flexDirection: 'row',
  },
  amountInputs: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountInput: {
    flex: 1,
    minWidth: 0,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.background,
  },
  dateField: {
    flex: 1,
    minWidth: 0,
  },
  dateCaption: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 4,
  },
  dateSeparator: {
    marginTop: 16,
  },
  amountSeparator: {
    marginHorizontal: 8,
    fontSize: 16,
    color: colors.textMuted,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  transactionsCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  transactionsTitle: { fontSize: 18, fontWeight: '600', color: colors.text },
  transactionsHint: { fontSize: 11, color: colors.textMuted, marginTop: 2, marginBottom: 12 },
});

export default BankStatementTransactions;
