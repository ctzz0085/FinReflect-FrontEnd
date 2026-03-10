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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../context/AuthContext';
import { useTab } from '../../context/TabContext';
import { transactionsAPI } from '../../api/transactions';

const AddExpense = ({ onRefresh }) => {
  const { user } = useAuth();
  const { refreshKey } = useTab();

  const [expenseCategories, setExpenseCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isSavingCategory, setIsSavingCategory] = useState(false);

  const fetchCategories = () => {
    setCategoriesLoading(true);
    return transactionsAPI.getExpenseCategories()
      .then((res) => {
        const userCategories = res.data.filter(c => c.userId === user?.userId);
        setExpenseCategories(userCategories);
        return userCategories;
      })
      .catch((err) => {
        console.error('Error fetching expense categories', err);
        return [];
      })
      .finally(() => setCategoriesLoading(false));
  };

  useEffect(() => {
    fetchCategories();
    setSelectedCategory(null);
    setAmount('');
    setShowCategoryDropdown(false);
  }, [refreshKey]);

  const handleSaveCategory = () => {
    if (!newCategoryName.trim()) {
      Alert.alert('Error', 'Please enter category name');
      return;
    }

    setIsSavingCategory(true);
    transactionsAPI.addExpenseCategory(newCategoryName.trim())
      .then(() => fetchCategories().then((updated) => {
        const created = updated.find(
          (c) => c.name.toLowerCase() === newCategoryName.trim().toLowerCase()
        );
        if (created) setSelectedCategory(created);
      }))
      .then(() => {
        setIsAddCategoryOpen(false);
        setNewCategoryName('');
      })
      .catch((err) => {
        const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to save category';
        Alert.alert('Error', msg);
      })
      .finally(() => setIsSavingCategory(false));
  };

  const handleSubmit = async () => {
    if (!selectedCategory || !amount) {
      Alert.alert('Error', 'Please select category and enter amount');
      return;
    }

    const payload = {
      amount: Number(amount),
      category: { name: selectedCategory.name },
      description: 'Expense added from mobile',
      timestamp: new Date().toISOString(),
    };

    setLoading(true);
    try {
      await transactionsAPI.addExpense(payload);
      Alert.alert('Success', 'Expense added successfully ✅');
      setAmount('');
      setSelectedCategory(null);
      if (onRefresh) onRefresh();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to add expense';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Add Expense</Text>

        {/* Category */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
          >
            <Text style={styles.dropdownText}>
              {selectedCategory ? selectedCategory.name : 'Select Category'}
            </Text>
            <Icon name={showCategoryDropdown ? 'arrow-drop-up' : 'arrow-drop-down'} size={24} color="#666" />
          </TouchableOpacity>

          {showCategoryDropdown && (
            <View style={styles.categoryList}>
              {categoriesLoading ? (
                <View style={styles.categoryItem}>
                  <ActivityIndicator size="small" color="#666" />
                  <Text style={styles.categoryText}>Loading...</Text>
                </View>
              ) : (
                <ScrollView style={styles.categoryScroll} nestedScrollEnabled>
                  <TouchableOpacity
                    style={styles.categoryItem}
                    onPress={() => { setIsAddCategoryOpen(true); setShowCategoryDropdown(false); }}
                  >
                    <Text style={[styles.categoryText, { color: '#10b981' }]}>➕ Add Category</Text>
                  </TouchableOpacity>
                  {expenseCategories.map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      style={styles.categoryItem}
                      onPress={() => { setSelectedCategory(cat); setShowCategoryDropdown(false); }}
                    >
                      <Text style={styles.categoryText}>{cat.name}</Text>
                    </TouchableOpacity>
                  ))}
                  {expenseCategories.length === 0 && (
                    <View style={styles.categoryItem}>
                      <Text style={styles.categoryText}>No categories found</Text>
                    </View>
                  )}
                </ScrollView>
              )}
            </View>
          )}
        </View>

        {/* Amount */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Amount</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter amount"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />
        </View>

        {/* Add Expense Button */}
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? 'Processing...' : 'Add Expense'}</Text>
        </TouchableOpacity>
      </View>

      {/* Add Category Modal */}
      {isAddCategoryOpen && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Expense Category</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Category Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter category name"
                value={newCategoryName}
                onChangeText={setNewCategoryName}
                autoFocus
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => { setIsAddCategoryOpen(false); setNewCategoryName(''); }}
                disabled={isSavingCategory}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.addButton, isSavingCategory && styles.buttonDisabled]}
                onPress={handleSaveCategory}
                disabled={isSavingCategory}
              >
                <Text style={styles.addButtonText}>{isSavingCategory ? 'Saving...' : 'Add Category'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginHorizontal: 16, marginTop: 16 },
  card: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  title: { fontSize: 20, fontWeight: 'bold', color: '#000000', marginBottom: 20, textAlign: 'center' },
  inputGroup: { marginBottom: 16, position: 'relative', zIndex: 10 },
  label: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 },
  dropdown: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#ffffff',
  },
  dropdownText: { fontSize: 14, color: '#6b7280' },
  categoryList: {
    marginTop: 4, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8,
    backgroundColor: '#ffffff', maxHeight: 200, elevation: 3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4,
  },
  categoryScroll: { maxHeight: 200 },
  categoryItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  categoryText: { fontSize: 14, color: '#1f2937' },
  input: {
    borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, backgroundColor: '#ffffff',
  },
  button: { backgroundColor: '#60a5fa', paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  buttonDisabled: { backgroundColor: '#d1d5db' },
  buttonText: { color: '#000000', fontSize: 16, fontWeight: '600' },
  modalOverlay: {
    position: 'absolute', top: -200, left: -16, right: -16, bottom: -200,
    backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', zIndex: 2000,
  },
  modalContent: { backgroundColor: '#ffffff', borderRadius: 12, padding: 20, width: '90%', maxWidth: 400 },
  modalTitle: { fontSize: 18, fontWeight: '600', color: '#1f2937', marginBottom: 16, textAlign: 'center' },
  modalActions: { flexDirection: 'row', gap: 8, marginTop: 8 },
  modalButton: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  cancelButton: { backgroundColor: '#f3f4f6', borderWidth: 1, borderColor: '#e2e8f0' },
  cancelButtonText: { color: '#000000', fontSize: 14, fontWeight: '600' },
  addButton: { backgroundColor: '#60a5fa' },
  addButtonText: { color: '#000000', fontSize: 14, fontWeight: '600' },
});

export default AddExpense;
