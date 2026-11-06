import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useTab } from '../../context/TabContext';
import { transactionsAPI } from '../../api/transactions';

const getPercentageStyle = (percentage) => {
  const pct = parseFloat(percentage);
  if (pct >= 25) return { container: styles.itemRed, text: styles.itemTextRed };
  if (pct >= 10) return { container: styles.itemYellow, text: styles.itemTextYellow };
  return { container: styles.itemGreen, text: styles.itemTextGreen };
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const ExpenseHistory = () => {
  const { refreshKey } = useTab();

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortAscending, setSortAscending] = useState(false);
  const [filterMode, setFilterMode] = useState('week');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [customSubmitted, setCustomSubmitted] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState(new Set());

  const cycleFilterMode = () => {
    setFilterMode((prev) => {
      if (prev === 'week') return 'month';
      if (prev === 'month') return 'year';
      if (prev === 'year') return 'custom';
      return 'week';
    });
    if (filterMode === 'custom') setCustomSubmitted(false);
  };

  const getFilterLabel = () => {
    if (filterMode === 'week') return 'Week';
    if (filterMode === 'month') return 'Month';
    if (filterMode === 'year') return 'Year';
    return 'Custom';
  };

  const buildParams = () => {
    if (filterMode === 'custom') {
      if (!customSubmitted || !customStartDate || !customEndDate) return {};
      return { startDate: customStartDate, endDate: customEndDate };
    }
    return { filter: filterMode };
  };

  useEffect(() => {
    setLoading(true);
    setExpandedCategories(new Set());
    transactionsAPI.getExpenseTransactions(buildParams())
      .then((res) => setExpenses(res.data || []))
      .catch((err) => console.error('Error fetching expense history', err))
      .finally(() => setLoading(false));
  }, [refreshKey, filterMode, customSubmitted]);

  const toggleCategory = (categoryId) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) next.delete(categoryId);
      else next.add(categoryId);
      return next;
    });
  };

  const getTransactionsForCategory = (categoryId) => {
    return expenses.filter((e) => e.category?.id === categoryId);
  };

  const aggregatedExpenses = useMemo(() => {
    return Object.values(
      expenses.reduce((acc, curr) => {
        const categoryId = curr.category?.id;
        const categoryName = curr.category?.name;
        if (!categoryId) return acc;
        if (!acc[categoryId]) {
          acc[categoryId] = { id: categoryId, name: categoryName, amount: curr.amount };
        } else {
          acc[categoryId].amount += curr.amount;
        }
        return acc;
      }, {})
    );
  }, [expenses]);

  const totalExpense = useMemo(
    () => aggregatedExpenses.reduce((sum, item) => sum + item.amount, 0),
    [aggregatedExpenses]
  );

  const expensesWithPercentage = useMemo(() => {
    return aggregatedExpenses.map((item) => ({
      ...item,
      percentage: totalExpense > 0 ? ((item.amount / totalExpense) * 100).toFixed(2) : '0.00',
    }));
  }, [aggregatedExpenses, totalExpense]);

  const sortedExpenses = useMemo(() => {
    return [...expensesWithPercentage].sort((a, b) =>
      sortAscending ? a.amount - b.amount : b.amount - a.amount
    );
  }, [expensesWithPercentage, sortAscending]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Expense History</Text>
          <TouchableOpacity style={styles.filterButton} onPress={cycleFilterMode}>
            <View style={styles.filterIcon}>
              <View style={styles.filterLine} />
              <View style={styles.filterLine} />
              <View style={styles.filterLine} />
            </View>
            <Text style={styles.filterLabel}>{getFilterLabel()}</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => setSortAscending(!sortAscending)}>
          <Text style={styles.sortIcon}>{sortAscending ? '⬆️' : '⬇️'}</Text>
        </TouchableOpacity>
      </View>

      {/* Custom Date Range */}
      {filterMode === 'custom' && (
        <View style={styles.customRange}>
          <View style={styles.dateRow}>
            <View style={styles.dateField}>
              <Text style={styles.dateLabel}>Start date</Text>
              <TextInput
                style={styles.dateInput}
                placeholder="YYYY-MM-DD"
                value={customStartDate}
                onChangeText={setCustomStartDate}
              />
            </View>
            <View style={styles.dateField}>
              <Text style={styles.dateLabel}>End date</Text>
              <TextInput
                style={styles.dateInput}
                placeholder="YYYY-MM-DD"
                value={customEndDate}
                onChangeText={setCustomEndDate}
              />
            </View>
          </View>
          <View style={styles.submitRow}>
            <TouchableOpacity
              style={[
                styles.submitButton,
                (!customStartDate || !customEndDate) && styles.submitButtonDisabled,
              ]}
              onPress={() => setCustomSubmitted(true)}
              disabled={!customStartDate || !customEndDate}
            >
              <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
            {(!customStartDate || !customEndDate) && (
              <Text style={styles.submitHint}>Select both dates to enable Submit.</Text>
            )}
          </View>
        </View>
      )}

      {/* List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#60a5fa" />
          <Text style={styles.loadingText}>Loading…</Text>
        </View>
      ) : sortedExpenses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No expense data for this period.</Text>
        </View>
      ) : (
        sortedExpenses.map((item) => {
          const { container, text } = getPercentageStyle(item.percentage);
          const isExpanded = expandedCategories.has(item.id);
          const categoryTransactions = isExpanded ? getTransactionsForCategory(item.id) : [];
          return (
            <View key={item.id}>
              <View style={[styles.expenseItem, container]}>
                <View style={styles.itemLeft}>
                  <TouchableOpacity
                    style={styles.expandButton}
                    onPress={() => toggleCategory(item.id)}
                  >
                    <Text style={styles.expandButtonText}>{isExpanded ? '▼' : '▶'}</Text>
                  </TouchableOpacity>
                  <View>
                    <Text style={[styles.itemName, text]}>{item.name}</Text>
                    <Text style={[styles.itemPercentage, text]}>({item.percentage}%)</Text>
                  </View>
                </View>
                <Text style={[styles.itemAmount, text]}>₹{item.amount.toFixed(2)}</Text>
              </View>
              {isExpanded && categoryTransactions.length > 0 && (
                <View style={styles.transactionsList}>
                  {categoryTransactions.map((txn, idx) => (
                    <View key={txn.id || idx} style={styles.transactionRow}>
                      <View style={styles.transactionInfo}>
                        <Text style={styles.transactionDesc}>
                          {txn.description || 'No description'}
                        </Text>
                        <Text style={styles.transactionDate}>
                          {formatDate(txn.timestamp || txn.date)}
                        </Text>
                      </View>
                      <Text style={styles.transactionAmount}>₹{txn.amount.toFixed(2)}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#000000' },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  filterIcon: { gap: 2 },
  filterLine: { width: 14, height: 2, backgroundColor: '#374151', borderRadius: 1 },
  filterLabel: { fontSize: 12, fontWeight: '500', color: '#374151' },
  sortIcon: { fontSize: 20 },
  customRange: { marginBottom: 12 },
  dateRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  dateField: { flex: 1 },
  dateLabel: { fontSize: 11, color: '#6b7280', marginBottom: 4 },
  dateInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
  },
  submitRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  submitButton: { backgroundColor: '#4ade80', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  submitButtonDisabled: { backgroundColor: '#e5e7eb' },
  submitButtonText: { fontSize: 13, fontWeight: '600', color: '#000000' },
  submitHint: { fontSize: 11, color: '#6b7280', flexShrink: 1 },
  loadingContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 24, gap: 8 },
  loadingText: { color: '#6b7280', fontSize: 13 },
  emptyContainer: { paddingVertical: 24, alignItems: 'center' },
  emptyText: { color: '#6b7280', fontSize: 13 },
  expenseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 8,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  expandButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expandButtonText: {
    color: '#6b7280',
    fontSize: 12,
  },
  itemName: { fontSize: 14, fontWeight: '500', textTransform: 'capitalize' },
  itemPercentage: { fontSize: 11, opacity: 0.75 },
  itemAmount: { fontSize: 14, fontWeight: '600' },
  transactionsList: {
    marginLeft: 20,
    borderLeftWidth: 2,
    borderLeftColor: '#e2e8f0',
    paddingLeft: 12,
    marginTop: 4,
    marginBottom: 4,
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 4,
  },
  transactionInfo: {
    flex: 1,
    marginRight: 8,
  },
  transactionDesc: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '400',
  },
  transactionDate: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  itemRed: { backgroundColor: '#fee2e2' },
  itemTextRed: { color: '#b91c1c' },
  itemYellow: { backgroundColor: '#fef9c3' },
  itemTextYellow: { color: '#854d0e' },
  itemGreen: { backgroundColor: '#dcfce7' },
  itemTextGreen: { color: '#15803d' },
});

export default ExpenseHistory;
