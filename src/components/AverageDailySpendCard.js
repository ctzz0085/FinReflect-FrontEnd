import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { transactionsAPI } from '../api/transactions';
import { colors } from '../theme/colors';

const formatCurrency = (amount) => (
  '₹' + Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
);

// Shows nothing until the API returns a usable result. refreshKey reloads the
// figure when the statement's expense total changes.
const AverageDailySpendCard = ({ statementId, refreshKey }) => {
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!statementId) {
      return undefined;
    }

    let cancelled = false;

    transactionsAPI.getAverageDailySpend(statementId)
      .then((res) => {
        if (!cancelled) {
          setResult(res.data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setResult(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [statementId, refreshKey]);

  if (!result?.days) {
    return null;
  }

  return (
    <View style={styles.card}>
      <Text style={styles.label}>Average Daily Spend</Text>
      <Text style={styles.value}>
        {formatCurrency(result.averageDailySpend)}
        <Text style={styles.unit}> / day</Text>
      </Text>
      <Text style={styles.detail}>
        {formatCurrency(result.totalExpense)} over {result.days} {result.days === 1 ? 'day' : 'days'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.amberBorder,
  },
  label: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 4,
  },
  value: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.amber,
  },
  unit: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textMuted,
  },
  detail: {
    fontSize: 12,
    color: colors.textFaint,
    marginTop: 4,
  },
});

export default AverageDailySpendCard;
