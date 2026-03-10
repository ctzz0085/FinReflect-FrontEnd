import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTab } from '../../context/TabContext';
import Balance from '../../components/dashboard/Balance';
import AddIncome from '../../components/dashboard/AddIncome';
import AddExpense from '../../components/dashboard/AddExpense';
import IncomeHistory from '../../components/dashboard/IncomeHistory';
import ExpenseHistory from '../../components/dashboard/ExpenseHistory';

const DashboardScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { activeTab, switchTab, triggerRefresh } = useTab();

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

        {/* Toggle Buttons - like ToggleTabs.jsx */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleButton, activeTab === 'income' ? styles.toggleButtonIncomeActive : styles.toggleButtonIncomeInactive]}
            onPress={() => switchTab('income')}
          >
            <Text style={styles.toggleText}>Income</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, activeTab === 'expense' ? styles.toggleButtonExpenseActive : styles.toggleButtonExpenseInactive]}
            onPress={() => switchTab('expense')}
          >
            <Text style={styles.toggleText}>Expense</Text>
          </TouchableOpacity>
        </View>

        {/* Balance - always visible when a tab is active */}
        <Balance />

        {/* AddIncome or AddExpense - conditionally rendered like ToggleTabs.jsx */}
        {activeTab === 'income' && (
          <AddIncome onRefresh={triggerRefresh} />
        )}
        {activeTab === 'expense' && (
          <AddExpense onRefresh={triggerRefresh} />
        )}

        {/* History - switches with toggle, re-fetches on refreshKey change */}
        {activeTab === 'income' && <IncomeHistory />}
        {activeTab === 'expense' && <ExpenseHistory />}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scrollView: { flex: 1 },
  toggleContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    gap: 2,
    padding: 5,
    backgroundColor: '#f1f5f9',
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  toggleButtonIncomeActive: { backgroundColor: '#4ade80' },
  toggleButtonIncomeInactive: { backgroundColor: '#bbf7d0' },
  toggleButtonExpenseActive: { backgroundColor: '#60a5fa' },
  toggleButtonExpenseInactive: { backgroundColor: '#bfdbfe' },
  toggleText: { fontSize: 16, fontWeight: '600', color: '#000000' },
  bottomPadding: { height: 32 },
});

export default DashboardScreen;
