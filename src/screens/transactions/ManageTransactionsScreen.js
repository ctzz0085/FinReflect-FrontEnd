import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { transactionsAPI } from '../../api/transactions';

const ManageTransactionsScreen = () => {
  const [incomeTransactions, setIncomeTransactions] = useState([]);
  const [expenseTransactions, setExpenseTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('income');
  const [loading, setLoading] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [editAmount, setEditAmount] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDate, setEditDate] = useState('');
  const [showEditDatePicker, setShowEditDatePicker] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [addAmount, setAddAmount] = useState('');
  const [addDescription, setAddDescription] = useState('');
  const [addDate, setAddDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAddDatePicker, setShowAddDatePicker] = useState(false);
  const [addCategory, setAddCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [savingAdd, setSavingAdd] = useState(false);
  const [showExpenseCategoryDropdown, setShowExpenseCategoryDropdown] = useState(false);
  
  const [showAddIncome, setShowAddIncome] = useState(false);
  const [addIncomeAmount, setAddIncomeAmount] = useState('');
  const [addIncomeDescription, setAddIncomeDescription] = useState('');
  const [addIncomeDate, setAddIncomeDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAddIncomeDatePicker, setShowAddIncomeDatePicker] = useState(false);
  const [addIncomeCategory, setAddIncomeCategory] = useState(null);
  const [incomeCategories, setIncomeCategories] = useState([]);
  const [savingAddIncome, setSavingAddIncome] = useState(false);
  const [showIncomeCategoryDropdown, setShowIncomeCategoryDropdown] = useState(false);

  useEffect(() => {
    fetchData();
    fetchCategories();
    fetchIncomeCategories();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = activeTab === 'income'
        ? await transactionsAPI.getIncomeTransactions()
        : await transactionsAPI.getExpenseTransactions();
      
      if (activeTab === 'income') {
        setIncomeTransactions(response.data || []);
      } else {
        setExpenseTransactions(response.data || []);
      }
    } catch (err) {
      console.error('Error fetching data', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to fetch data';
      Alert.alert('Error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await transactionsAPI.getExpenseCategories();
      setCategories(response.data || []);
    } catch (err) {
      console.error('Error fetching categories', err);
    }
  };

  const fetchIncomeCategories = async () => {
    try {
      const response = await transactionsAPI.getIncomeCategories();
      setIncomeCategories(response.data || []);
    } catch (err) {
      console.error('Error fetching income categories', err);
    }
  };

  const handleDeleteIncome = (transaction) => {
    if (!transaction?.id) {
      Alert.alert('Error', 'Missing transaction id');
      return;
    }

    Alert.alert(
      'Delete Income',
      `Delete this income of ₹${transaction.amount}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await transactionsAPI.deleteIncome(transaction.id);
              await fetchData();
              Alert.alert('Success', 'Income deleted successfully');
            } catch (err) {
              console.error('Error deleting income', err);
              const errorMsg = err.response?.data?.message || err.response?.data || err.message || 'Failed to delete income';
              Alert.alert('Error', errorMsg);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleDeleteExpense = (transaction) => {
    if (!transaction?.id) {
      Alert.alert('Error', 'Missing transaction id');
      return;
    }

    Alert.alert(
      'Delete Expense',
      `Delete this expense of ₹${transaction.amount}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await transactionsAPI.deleteExpense(transaction.id);
              await fetchData();
              Alert.alert('Success', 'Expense deleted successfully');
            } catch (err) {
              console.error('Error deleting expense', err);
              const errorMsg = err.response?.data?.message || err.response?.data || err.message || 'Failed to delete expense';
              Alert.alert('Error', errorMsg);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleOpenEdit = (transaction) => {
    if (!transaction?.id) {
      Alert.alert('Error', 'Missing transaction id');
      return;
    }

    setEditingTransaction(transaction);
    setEditAmount(String(transaction.amount ?? ''));
    setEditDescription(String(transaction.description ?? ''));
    const dt = activeTab === 'income' ? transaction.date : (transaction.timestamp || transaction.date);
    setEditDate(dt ? new Date(dt).toISOString().split('T')[0] : '');
  };

  const handleSaveEdit = async () => {
    if (!editingTransaction?.id) {
      Alert.alert('Error', 'Missing transaction id');
      return;
    }

    if (!editAmount || Number.isNaN(Number(editAmount))) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (!editDate) {
      Alert.alert('Error', 'Please select a date');
      return;
    }

    setSavingEdit(true);

    const categoryPayload = editingTransaction.category
      ? {
          id: editingTransaction.category.id,
          name: editingTransaction.category.name,
          userId: editingTransaction.category.userId,
        }
      : undefined;

    const payload = activeTab === 'income'
      ? {
          id: editingTransaction.id,
          amount: Number(editAmount),
          description: editDescription,
          date: new Date(editDate).toISOString().replace('Z', ''),
          userId: editingTransaction.userId,
          category: categoryPayload,
        }
      : {
          id: editingTransaction.id,
          amount: Number(editAmount),
          description: editDescription,
          timestamp: new Date(editDate).toISOString().replace('Z', ''),
          userId: editingTransaction.userId,
          category: categoryPayload,
        };

    try {
      if (activeTab === 'income') {
        await transactionsAPI.updateIncome(editingTransaction.id, payload);
      } else {
        await transactionsAPI.updateExpense(editingTransaction.id, payload);
      }
      setEditingTransaction(null);
      await fetchData();
      Alert.alert('Success', 'Transaction updated successfully');
    } catch (err) {
      console.error('Error updating transaction', err);
      const errorMsg = err.response?.data?.message || err.response?.data || err.message || 'Failed to update transaction';
      Alert.alert('Error', errorMsg);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleAddIncome = async () => {
    if (!addIncomeAmount || Number.isNaN(Number(addIncomeAmount))) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (!addIncomeDescription.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }

    if (!addIncomeCategory) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    setSavingAddIncome(true);

    const payload = {
      amount: Number(addIncomeAmount),
      description: addIncomeDescription.trim(),
      date: new Date(addIncomeDate).toISOString().replace('Z', ''),
      category: {
        name: addIncomeCategory.name,
      },
    };

    try {
      await transactionsAPI.addIncome(payload);
      setAddIncomeAmount('');
      setAddIncomeDescription('');
      setAddIncomeDate(new Date().toISOString().split('T')[0]);
      setAddIncomeCategory(null);
      setShowAddIncome(false);
      
      if (activeTab === 'income') {
        await fetchData();
      }
      Alert.alert('Success', 'Income added successfully');
    } catch (err) {
      console.error('Error adding income', err);
      const errorMsg = err.response?.data?.message || err.response?.data || err.message || 'Failed to add income';
      Alert.alert('Error', errorMsg);
    } finally {
      setSavingAddIncome(false);
    }
  };

  const handleAddExpense = async () => {
    if (!addAmount || Number.isNaN(Number(addAmount))) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (!addDescription.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }

    if (!addCategory) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    setSavingAdd(true);

    const payload = {
      amount: Number(addAmount),
      category: {
        name: addCategory.name,
      },
      description: addDescription.trim(),
      timestamp: new Date(addDate).toISOString(),
    };

    try {
      await transactionsAPI.addExpense(payload);
      setAddAmount('');
      setAddDescription('');
      setAddDate(new Date().toISOString().split('T')[0]);
      setAddCategory(null);
      setShowAddExpense(false);
      
      if (activeTab === 'expense') {
        await fetchData();
      }
      Alert.alert('Success', 'Expense added successfully');
    } catch (err) {
      console.error('Error adding expense', err);
      const errorMsg = err.response?.data?.message || err.response?.data || err.message || 'Failed to add expense';
      Alert.alert('Error', errorMsg);
    } finally {
      setSavingAdd(false);
    }
  };

  const transactions = activeTab === 'income' ? incomeTransactions : expenseTransactions;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.title}>Manage Transactions</Text>

          {/* Tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'income' && styles.tabActiveIncome,
              ]}
              onPress={() => setActiveTab('income')}
            >
              <Text style={[
                styles.tabText,
                activeTab === 'income' && styles.tabTextActive,
              ]}>
                💰 Income Transactions
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'expense' && styles.tabActiveExpense,
              ]}
              onPress={() => setActiveTab('expense')}
            >
              <Text style={[
                styles.tabText,
                activeTab === 'expense' && styles.tabTextActive,
              ]}>
                💳 Expense Transactions
              </Text>
            </TouchableOpacity>
          </View>

          {/* Add Transaction Button */}
          <TouchableOpacity
            style={[
              styles.addButton,
              activeTab === 'income' ? styles.addButtonIncome : styles.addButtonExpense,
            ]}
            onPress={() => activeTab === 'income' ? setShowAddIncome(true) : setShowAddExpense(true)}
          >
            <Text style={styles.addButtonText}>
              {activeTab === 'income' ? '➕ Add Income' : '➕ Add Expense'}
            </Text>
          </TouchableOpacity>

          {/* Transactions List */}
          <View style={styles.listContainer}>
            <Text style={styles.listTitle}>
              {activeTab === 'income' ? 'Income' : 'Expense'} Transactions
            </Text>
            {loading ? (
              <ActivityIndicator size="large" color="#10b981" style={styles.loader} />
            ) : transactions.length === 0 ? (
              <Text style={styles.emptyText}>No transactions found</Text>
            ) : (
              transactions.map((transaction) => (
                <View key={transaction.id} style={styles.transactionItem}>
                  <View style={styles.transactionInfo}>
                    <Text style={styles.transactionAmount}>
                      ₹{transaction.amount} - {transaction.category?.name || 'Unknown'}
                    </Text>
                    <Text style={styles.transactionDetails}>
                      {transaction.description} • {new Date(transaction.date || transaction.timestamp).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={[styles.editButton, loading && styles.buttonDisabled]}
                      onPress={() => handleOpenEdit(transaction)}
                      disabled={loading}
                    >
                      <Text style={styles.editButtonText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.deleteButton, loading && styles.buttonDisabled]}
                      onPress={() => activeTab === 'income' ? handleDeleteIncome(transaction) : handleDeleteExpense(transaction)}
                      disabled={loading}
                    >
                      <Text style={styles.deleteButtonText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>

          {/* Note */}
          <View style={styles.noteContainer}>
            <Text style={styles.noteText}>
              <Text style={styles.noteBold}>Note:</Text> Income delete, Expense delete and Edit are enabled.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Edit Modal */}
      <Modal
        visible={editingTransaction !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setEditingTransaction(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Transaction</Text>
              <TouchableOpacity onPress={() => setEditingTransaction(null)}>
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Amount</Text>
                <TextInput
                  style={styles.input}
                  value={editAmount}
                  onChangeText={setEditAmount}
                  keyboardType="numeric"
                  placeholder="0.00"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Description</Text>
                <TextInput
                  style={styles.input}
                  value={editDescription}
                  onChangeText={setEditDescription}
                  placeholder="Enter description"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Date</Text>
                <TouchableOpacity
                  style={styles.datePickerButton}
                  onPress={() => setShowEditDatePicker(true)}
                >
                  <Icon name="calendar-today" size={20} color="#666" />
                  <Text style={styles.datePickerText}>
                    {editDate ? new Date(editDate).toLocaleDateString() : 'Select date'}
                  </Text>
                </TouchableOpacity>
                {showEditDatePicker && (
                  <DateTimePicker
                    value={editDate ? new Date(editDate) : new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(event, selectedDate) => {
                      setShowEditDatePicker(Platform.OS === 'ios');
                      if (selectedDate) {
                        setEditDate(selectedDate.toISOString().split('T')[0]);
                      }
                    }}
                  />
                )}
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setEditingTransaction(null)}
                disabled={savingEdit}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton, savingEdit && styles.buttonDisabled]}
                onPress={handleSaveEdit}
                disabled={savingEdit}
              >
                {savingEdit ? (
                  <ActivityIndicator size="small" color="#000" />
                ) : (
                  <Text style={styles.saveButtonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Expense Modal */}
      <Modal
        visible={showAddExpense}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAddExpense(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Expense Transaction</Text>
              <TouchableOpacity onPress={() => setShowAddExpense(false)}>
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Amount *</Text>
                <TextInput
                  style={styles.input}
                  value={addAmount}
                  onChangeText={setAddAmount}
                  keyboardType="numeric"
                  placeholder="0.00"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Description *</Text>
                <TextInput
                  style={styles.input}
                  value={addDescription}
                  onChangeText={setAddDescription}
                  placeholder="Enter description"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Category *</Text>
                <TouchableOpacity 
                  style={styles.dropdownButton} 
                  onPress={() => setShowExpenseCategoryDropdown(!showExpenseCategoryDropdown)}
                >
                  <Text style={styles.dropdownButtonText}>
                    {addCategory ? addCategory.name : 'Select category'}
                  </Text>
                  <Icon name={showExpenseCategoryDropdown ? "arrow-drop-up" : "arrow-drop-down"} size={24} color="#666" />
                </TouchableOpacity>
                
                {showExpenseCategoryDropdown && (
                  <View style={styles.dropdownList}>
                    <ScrollView style={styles.dropdownScroll} nestedScrollEnabled={true}>
                      {categories.map((cat) => (
                        <TouchableOpacity
                          key={cat.id}
                          style={styles.dropdownItem}
                          onPress={() => {
                            setAddCategory(cat);
                            setShowExpenseCategoryDropdown(false);
                          }}
                        >
                          <Text style={styles.dropdownItemText}>{cat.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Date *</Text>
                <TouchableOpacity
                  style={styles.datePickerButton}
                  onPress={() => setShowAddDatePicker(true)}
                >
                  <Icon name="calendar-today" size={20} color="#666" />
                  <Text style={styles.datePickerText}>
                    {addDate ? new Date(addDate).toLocaleDateString() : 'Select date'}
                  </Text>
                </TouchableOpacity>
                {showAddDatePicker && (
                  <DateTimePicker
                    value={addDate ? new Date(addDate) : new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(event, selectedDate) => {
                      setShowAddDatePicker(Platform.OS === 'ios');
                      if (selectedDate) {
                        setAddDate(selectedDate.toISOString().split('T')[0]);
                      }
                    }}
                  />
                )}
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowAddExpense(false)}
                disabled={savingAdd}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.addButtonExpenseModal, savingAdd && styles.buttonDisabled]}
                onPress={handleAddExpense}
                disabled={savingAdd}
              >
                {savingAdd ? (
                  <ActivityIndicator size="small" color="#000" />
                ) : (
                  <Text style={styles.addButtonExpenseText}>Add Expense</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Income Modal */}
      <Modal
        visible={showAddIncome}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAddIncome(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Income Transaction</Text>
              <TouchableOpacity onPress={() => setShowAddIncome(false)}>
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Amount *</Text>
                <TextInput
                  style={styles.input}
                  value={addIncomeAmount}
                  onChangeText={setAddIncomeAmount}
                  keyboardType="numeric"
                  placeholder="0.00"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Description *</Text>
                <TextInput
                  style={styles.input}
                  value={addIncomeDescription}
                  onChangeText={setAddIncomeDescription}
                  placeholder="Enter description"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Category *</Text>
                <TouchableOpacity 
                  style={styles.dropdownButton} 
                  onPress={() => setShowIncomeCategoryDropdown(!showIncomeCategoryDropdown)}
                >
                  <Text style={styles.dropdownButtonText}>
                    {addIncomeCategory ? addIncomeCategory.name : 'Select category'}
                  </Text>
                  <Icon name={showIncomeCategoryDropdown ? "arrow-drop-up" : "arrow-drop-down"} size={24} color="#666" />
                </TouchableOpacity>
                
                {showIncomeCategoryDropdown && (
                  <View style={styles.dropdownList}>
                    <ScrollView style={styles.dropdownScroll} nestedScrollEnabled={true}>
                      {incomeCategories.map((cat) => (
                        <TouchableOpacity
                          key={cat.id}
                          style={styles.dropdownItem}
                          onPress={() => {
                            setAddIncomeCategory(cat);
                            setShowIncomeCategoryDropdown(false);
                          }}
                        >
                          <Text style={styles.dropdownItemText}>{cat.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Date *</Text>
                <TouchableOpacity
                  style={styles.datePickerButton}
                  onPress={() => setShowAddIncomeDatePicker(true)}
                >
                  <Icon name="calendar-today" size={20} color="#666" />
                  <Text style={styles.datePickerText}>
                    {addIncomeDate ? new Date(addIncomeDate).toLocaleDateString() : 'Select date'}
                  </Text>
                </TouchableOpacity>
                {showAddIncomeDatePicker && (
                  <DateTimePicker
                    value={addIncomeDate ? new Date(addIncomeDate) : new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(event, selectedDate) => {
                      setShowAddIncomeDatePicker(Platform.OS === 'ios');
                      if (selectedDate) {
                        setAddIncomeDate(selectedDate.toISOString().split('T')[0]);
                      }
                    }}
                  />
                )}
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowAddIncome(false)}
                disabled={savingAddIncome}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.addButtonIncomeModal, savingAddIncome && styles.buttonDisabled]}
                onPress={handleAddIncome}
                disabled={savingAddIncome}
              >
                {savingAddIncome ? (
                  <ActivityIndicator size="small" color="#000" />
                ) : (
                  <Text style={styles.addButtonIncomeText}>Add Income</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    padding: 4,
    borderRadius: 8,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  tabActiveIncome: {
    backgroundColor: '#10b981',
  },
  tabActiveExpense: {
    backgroundColor: '#60a5fa',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  tabTextActive: {
    color: '#000000',
  },
  addButton: {
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  addButtonIncome: {
    backgroundColor: '#10b981',
  },
  addButtonExpense: {
    backgroundColor: '#60a5fa',
  },
  addButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    marginTop: 8,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  loader: {
    marginVertical: 20,
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginVertical: 20,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginBottom: 8,
  },
  transactionInfo: {
    flex: 1,
    marginRight: 8,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 4,
  },
  transactionDetails: {
    fontSize: 12,
    color: '#6b7280',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#fcd34d',
    borderRadius: 6,
  },
  editButtonText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '500',
  },
  deleteButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f87171',
    borderRadius: 6,
  },
  deleteButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  noteContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#fef3c7',
    borderWidth: 1,
    borderColor: '#fde68a',
    borderRadius: 8,
  },
  noteText: {
    fontSize: 12,
    color: '#92400e',
  },
  noteBold: {
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  modalBody: {
    maxHeight: 400,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: '#ffffff',
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
  },
  dropdownButtonText: {
    fontSize: 14,
    color: '#1f2937',
  },
  dropdownList: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dropdownScroll: {
    maxHeight: 200,
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#1f2937',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
  },
  cancelButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#10b981',
  },
  saveButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '600',
  },
  addButtonExpenseModal: {
    backgroundColor: '#60a5fa',
  },
  addButtonExpenseText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '600',
  },
  addButtonIncomeModal: {
    backgroundColor: '#10b981',
  },
  addButtonIncomeText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '600',
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    gap: 8,
  },
  datePickerText: {
    fontSize: 14,
    color: '#1f2937',
    flex: 1,
  },
});

export default ManageTransactionsScreen;
