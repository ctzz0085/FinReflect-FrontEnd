import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTab } from '../../context/TabContext';
import { transactionsAPI } from '../../api/transactions';

const Balance = () => {
  const { refreshKey } = useTab();
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    transactionsAPI.getBalance()
      .then((response) => {
        setBalance(response.data || 0);
      })
      .catch((err) => {
        console.error('Error fetching balance:', err);
        setBalance(0);
      })
      .finally(() => setLoading(false));
  }, [refreshKey]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Your Balance</Text>
      {loading ? (
        <ActivityIndicator size="small" color="#3b82f6" />
      ) : (
        <Text style={styles.amount}>₹{balance}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  label: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 8,
  },
  amount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
  },
});

export default Balance;
