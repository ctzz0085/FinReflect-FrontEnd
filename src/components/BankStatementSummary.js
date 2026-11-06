import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors } from '../theme/colors';
import CategoryDonut from './CategoryDonut';
import NeedsReviewNotice from './NeedsReviewNotice';

const formatCurrency = (amount) => {
  if (amount == null) return '₹0.00';
  return '₹' + Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const BankStatementSummary = ({ reportData, onReviewPress }) => {
  const [chartTab, setChartTab] = useState('expense');

  if (!reportData) return null;

  const expenseCategories = (reportData.categorySummary || []).filter((c) => c.type === 'EXPENSE');
  const incomeCategories = (reportData.categorySummary || []).filter((c) => c.type === 'INCOME');

  return (
    <View style={styles.container}>
      <NeedsReviewNotice
        count={(reportData.transactions || []).filter((txn) => txn.needsReview).length}
        onPress={onReviewPress}
      />

      {/* Chart Toggle */}
      <View style={styles.chartToggle}>
        <TouchableOpacity
          style={[styles.toggleBtn, chartTab === 'expense' && styles.toggleBtnActiveExpense]}
          onPress={() => setChartTab('expense')}
        >
          <Text style={[styles.toggleText, chartTab === 'expense' && styles.toggleTextActive]}>
            Expense
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, chartTab === 'income' && styles.toggleBtnActiveIncome]}
          onPress={() => setChartTab('income')}
        >
          <Text style={[styles.toggleText, chartTab === 'income' && styles.toggleTextActive]}>
            Income
          </Text>
        </TouchableOpacity>
      </View>

      {/* Charts */}
      {chartTab === 'expense' && expenseCategories.length > 0 && (
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Expense by Category</Text>
          <CategoryDonut key="expense" data={expenseCategories} />
        </View>
      )}

      {chartTab === 'income' && incomeCategories.length > 0 && (
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Income by Category</Text>
          <CategoryDonut key="income" data={incomeCategories} />
        </View>
      )}

      {/* Summary Cards */}
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, styles.expenseCard]}>
          <Text style={styles.summaryLabel}>Total Expense</Text>
          <Text style={[styles.summaryValue, { color: colors.expense }]}>{formatCurrency(reportData.totalExpense)}</Text>
        </View>
        <View style={[styles.summaryCard, styles.incomeCard]}>
          <Text style={styles.summaryLabel}>Total Income</Text>
          <Text style={[styles.summaryValue, { color: colors.income }]}>{formatCurrency(reportData.totalIncome)}</Text>
        </View>
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  chartToggle: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceHigh,
    borderRadius: 999,
    padding: 3,
    marginBottom: 16,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  toggleBtnActiveExpense: { backgroundColor: colors.expenseTint, borderColor: colors.expense },
  toggleBtnActiveIncome: { backgroundColor: colors.incomeTint, borderColor: colors.income },
  toggleText: { fontSize: 14, fontWeight: '600', color: colors.textFaint },
  toggleTextActive: { color: colors.text },
  chartCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chartTitle: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 12 },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
  },
  expenseCard: { borderColor: colors.expenseTint },
  incomeCard: { borderColor: colors.incomeTint },
  summaryLabel: { fontSize: 12, color: colors.textMuted, marginBottom: 4 },
  summaryValue: { fontSize: 18, fontWeight: '700' },
});

export default BankStatementSummary;
