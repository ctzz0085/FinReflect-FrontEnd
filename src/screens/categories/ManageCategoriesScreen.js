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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { transactionsAPI } from '../../api/transactions';

const ManageCategoriesScreen = () => {
  const [incomeCategories, setIncomeCategories] = useState([]);
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [activeTab, setActiveTab] = useState('income');
  const [loading, setLoading] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [editCategoryName, setEditCategoryName] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const [incomeRes, expenseRes] = await Promise.all([
        transactionsAPI.getIncomeCategories(),
        transactionsAPI.getExpenseCategories(),
      ]);
      setIncomeCategories(incomeRes.data || []);
      setExpenseCategories(expenseRes.data || []);
    } catch (err) {
      console.error('Error fetching categories', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to fetch categories';
      Alert.alert('Error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      Alert.alert('Error', 'Please enter category name');
      return;
    }

    setLoading(true);
    try {
      if (activeTab === 'income') {
        await transactionsAPI.addIncomeCategory(newCategoryName.trim());
      } else {
        await transactionsAPI.addExpenseCategory(newCategoryName.trim());
      }
      setNewCategoryName('');
      await fetchCategories();
    } catch (err) {
      console.error('Error adding category', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to add category';
      Alert.alert('Error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setEditCategoryName(category.name);
  };

  const handleUpdateCategory = async () => {
    if (!editCategoryName.trim()) {
      Alert.alert('Error', 'Please enter category name');
      return;
    }

    setLoading(true);
    try {
      if (activeTab === 'income') {
        await transactionsAPI.updateIncomeCategory(editingCategory.id, editCategoryName.trim());
      } else {
        await transactionsAPI.updateExpenseCategory(editingCategory.id, editCategoryName.trim());
      }
      setEditingCategory(null);
      setEditCategoryName('');
      await fetchCategories();
    } catch (err) {
      console.error('Error updating category', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to update category';
      Alert.alert('Error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = (category) => {
    Alert.alert(
      'Delete Category',
      `Delete category "${category.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              console.log('Deleting category:', category.id, 'Type:', activeTab);
              if (activeTab === 'income') {
                const res = await transactionsAPI.deleteIncomeCategory(category.id);
                console.log('Delete income response:', res?.data);
              } else {
                const res = await transactionsAPI.deleteExpenseCategory(category.id);
                console.log('Delete expense response:', res?.data);
              }
              await fetchCategories();
            } catch (err) {
              console.error('Error deleting category', err);
              console.error('Delete error status:', err.response?.status);
              console.error('Delete error data:', JSON.stringify(err.response?.data));
              const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to delete category';
              Alert.alert('Error', errorMsg);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const categories = activeTab === 'income' ? incomeCategories : expenseCategories;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.title}>Manage Categories</Text>

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
                💰 Income Categories
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
                💳 Expense Categories
              </Text>
            </TouchableOpacity>
          </View>

          {/* Add Category Form */}
          <View style={styles.addForm}>
            <Text style={styles.formLabel}>
              Add New {activeTab === 'income' ? 'Income' : 'Expense'} Category
            </Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="Enter category name"
                value={newCategoryName}
                onChangeText={setNewCategoryName}
              />
              <TouchableOpacity
                style={[
                  styles.addButton,
                  loading && styles.buttonDisabled,
                  activeTab === 'income' ? styles.addButtonIncome : styles.addButtonExpense,
                ]}
                onPress={handleAddCategory}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#000" />
                ) : (
                  <Text style={styles.addButtonText}>Add</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Categories List */}
          <View style={styles.listContainer}>
            <Text style={styles.listTitle}>
              Existing {activeTab === 'income' ? 'Income' : 'Expense'} Categories
            </Text>
            {categories.length === 0 ? (
              <Text style={styles.emptyText}>No categories found</Text>
            ) : (
              categories.map((category) => (
                <View key={category.id} style={styles.categoryItem}>
                  <Text style={styles.categoryName}>{category.name}</Text>
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => handleEditCategory(category)}
                    >
                      <Text style={styles.editButtonText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteCategory(category)}
                    >
                      <Text style={styles.deleteButtonText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {/* Edit Modal */}
      <Modal
        visible={editingCategory !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setEditingCategory(null);
          setEditCategoryName('');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Edit {activeTab === 'income' ? 'Income' : 'Expense'} Category
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setEditingCategory(null);
                  setEditCategoryName('');
                }}
              >
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.formLabel}>Category Name</Text>
              <TextInput
                style={styles.modalInput}
                value={editCategoryName}
                onChangeText={setEditCategoryName}
                autoFocus
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setEditingCategory(null);
                  setEditCategoryName('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.updateButton, loading && styles.buttonDisabled]}
                onPress={handleUpdateCategory}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#000" />
                ) : (
                  <Text style={styles.updateButtonText}>Update</Text>
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
    backgroundColor: '#4ade80',
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
  addForm: {
    marginBottom: 24,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: '#ffffff',
  },
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 60,
  },
  addButtonIncome: {
    backgroundColor: '#4ade80',
  },
  addButtonExpense: {
    backgroundColor: '#60a5fa',
  },
  addButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '500',
  },
  buttonDisabled: {
    backgroundColor: '#d1d5db',
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
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#60a5fa',
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
    marginBottom: 16,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: '#ffffff',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 8,
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
    fontWeight: '500',
  },
  updateButton: {
    backgroundColor: '#4ade80',
  },
  updateButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ManageCategoriesScreen;
