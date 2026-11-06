import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../theme/colors';
import BankStatementTransactions from './BankStatementTransactions';

const TransactionsSection = ({ open, onToggle, transactions, onEditTransaction, reviewOnly, onReviewOnlyChange }) => (
  <View>
    <TouchableOpacity
      style={[styles.button, open && styles.buttonOpen]}
      onPress={onToggle}
      accessibilityRole="button"
      accessibilityState={{ expanded: open }}
    >
      <MaterialIcons name={open ? 'close' : 'receipt-long'} size={18} color={open ? colors.text : colors.onPrimary} />
      <Text style={[styles.buttonText, open && styles.buttonTextOpen]}>
        {open ? 'Close Transactions' : 'View Transactions'}
      </Text>
    </TouchableOpacity>

    {open && (
      <BankStatementTransactions
        transactions={transactions}
        onEditTransaction={onEditTransaction}
        reviewOnly={reviewOnly}
        onReviewOnlyChange={onReviewOnlyChange}
      />
    )}
  </View>
);

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 999,
    marginBottom: 16,
  },
  buttonOpen: {
    backgroundColor: colors.surfaceHigh,
    borderColor: colors.border,
  },
  buttonText: {
    color: colors.onPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  buttonTextOpen: {
    color: colors.text,
  },
});

export default TransactionsSection;
