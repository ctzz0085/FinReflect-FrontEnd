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
  Linking,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
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
  const [description, setDescription] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isSavingCategory, setIsSavingCategory] = useState(false);

  const [showUpiSheet, setShowUpiSheet] = useState(false);
  const [savedAmount, setSavedAmount] = useState('');
  const [upiId, setUpiId] = useState('');

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
    setDescription('');
    setSelectedDate(new Date());
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
      description: description.trim() || selectedCategory.name,
      timestamp: selectedDate.toISOString(),
    };

    setLoading(true);
    try {
      await transactionsAPI.addExpense(payload);
      setSavedAmount(amount);
      setShowUpiSheet(true);
      setAmount('');
      setDescription('');
      setSelectedDate(new Date());
      setSelectedCategory(null);
      if (onRefresh) onRefresh();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to add expense';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenUpi = () => {
    const params = new URLSearchParams({ cu: 'INR' });
    if (savedAmount) params.append('am', savedAmount);
    if (upiId.trim()) params.append('pa', upiId.trim());
    const url = `upi://pay?${params.toString()}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('No UPI App', 'No UPI app found on this device.');
    });
  };

  const handleDismissUpi = () => {
    setShowUpiSheet(false);
    setSavedAmount('');
    setUpiId('');
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

        {/* Description */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter description"
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* Date Picker */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Date</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={[styles.dropdownText, { color: '#1f2937' }]}>
              {selectedDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </Text>
            <Icon name="calendar-today" size={20} color="#6b7280" />
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              maximumDate={new Date()}
              onChange={(event, date) => {
                setShowDatePicker(Platform.OS === 'ios');
                if (date) setSelectedDate(date);
              }}
            />
          )}
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
      {/* UPI Bottom Sheet */}
      <Modal
        visible={showUpiSheet}
        transparent
        animationType="slide"
        onRequestClose={handleDismissUpi}
      >
        <TouchableOpacity
          style={upiStyles.overlay}
          activeOpacity={1}
          onPress={handleDismissUpi}
        >
          <View onStartShouldSetResponder={() => true} style={upiStyles.sheet}>
            <View style={upiStyles.handle} />
            <Text style={upiStyles.sheetTitle}>Expense Saved ✅</Text>
            <Text style={upiStyles.sheetSubtitle}>Pay ₹{savedAmount} via UPI?</Text>

            <View style={upiStyles.upiIdGroup}>
              <Text style={upiStyles.upiLabel}>UPI ID (optional)</Text>
              <TextInput
                style={upiStyles.upiInput}
                placeholder="e.g. merchant@upi"
                placeholderTextColor="#9ca3af"
                value={upiId}
                onChangeText={setUpiId}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <TouchableOpacity style={upiStyles.payButton} onPress={handleOpenUpi}>
              <Text style={upiStyles.payButtonText}>Open UPI App</Text>
            </TouchableOpacity>

            <TouchableOpacity style={upiStyles.skipButton} onPress={handleDismissUpi}>
              <Text style={upiStyles.skipButtonText}>Skip</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const upiStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 12,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#d1d5db',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
  },
  sheetSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  upiIdGroup: {
    marginBottom: 16,
  },
  upiLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  upiInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#f9fafb',
    color: '#1f2937',
  },
  payButton: {
    backgroundColor: '#7c3aed',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  payButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  skipButton: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  skipButtonText: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '600',
  },
});

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
