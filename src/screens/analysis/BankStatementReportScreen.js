import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { transactionsAPI } from '../../api/transactions';
import BankStatementSummary from '../../components/BankStatementSummary';
import TransactionsSection from '../../components/TransactionsSection';
import { getCategoryStyle } from '../../theme/categories';
import { colors } from '../../theme/colors';

const backgroundImage = require('../../../assets/images/login-background.jpg');

const CHART_COLORS = [
  '#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6',
  '#ec4899', '#06b6d4', '#f97316', '#6366f1', '#14b8a6',
];

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatCurrency = (amount) => {
  if (amount == null) return '₹0.00';
  return '₹' + Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const BankStatementReportScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { statementId, fileName } = route.params;

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showTransactions, setShowTransactions] = useState(false);
  const [reviewOnly, setReviewOnly] = useState(false);
  const scrollRef = useRef(null);
  const transactionsOffset = useRef(0);

  // Edit transaction state
  const [editingTxn, setEditingTxn] = useState(null);
  const [editCategory, setEditCategory] = useState('');
  const [editType, setEditType] = useState('EXPENSE');
  const [savingCategory, setSavingCategory] = useState(false);

  // Category management state
  const [allCategories, setAllCategories] = useState([]);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [creatingCategory, setCreatingCategory] = useState(false);

  const toggleCategory = (key) => {
    setExpandedCategories((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const fetchCategories = useCallback(() => {
    transactionsAPI.getExpenseCategories()
      .then((res) => {
        const categories = res.data || [];
        setAllCategories(categories.map(cat => cat.name).sort());
      })
      .catch((err) => {
        console.error('Error fetching categories', err);
        setAllCategories([]);
      });
  }, []);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const res = await transactionsAPI.getBankStatementReport(statementId);
      setReport(res.data);
    } catch (err) {
      console.error('Error fetching report:', err);
      Alert.alert('Error', 'Failed to load report');
    } finally {
      setLoading(false);
    }
  }, [statementId]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchReport();
    setRefreshing(false);
  }, [fetchReport]);

  useEffect(() => {
    fetchCategories();
    fetchReport();
  }, [fetchCategories, fetchReport]);

  const toggleTransactions = () => {
    setReviewOnly(false);
    setShowTransactions((open) => !open);
  };

  // The notice is at the top and the list is below the charts, so take the user there.
  const reviewFlaggedTransactions = () => {
    setReviewOnly(true);
    setShowTransactions(true);
    // Wait for the list to render, otherwise the page is too short to scroll that far.
    setTimeout(() => scrollRef.current?.scrollTo({ y: transactionsOffset.current, animated: true }), 100);
  };

  const openEditModal = (txn) => {
    setEditingTxn(txn);
    setEditCategory(txn.category || '');
    setEditType(txn.type || 'EXPENSE');
  };

  const closeEditModal = () => {
    setEditingTxn(null);
    setEditCategory('');
    setEditType('EXPENSE');
    setShowAddCategory(false);
    setNewCategoryName('');
  };

  const handleCreateNewCategory = async () => {
    if (!newCategoryName.trim()) {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }

    setCreatingCategory(true);
    setSavingCategory(true);
    try {
      await transactionsAPI.addExpenseCategory(newCategoryName.trim());
      await fetchCategories();

      const createdCategoryName = newCategoryName.trim();
      setEditCategory(createdCategoryName);
      setNewCategoryName('');
      setShowAddCategory(false);

      const txnId = editingTxn.id || editingTxn.transactionId;
      const payload = { 
        category: createdCategoryName,
        type: editType
      };

      await transactionsAPI.updateTransactionDetails(txnId, payload);
      await new Promise(resolve => setTimeout(resolve, 300));
      await fetchReport();

      Alert.alert('Success', 'Category created and transaction updated');
      closeEditModal();
    } catch (err) {
      console.error('Error creating category:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to create category';
      Alert.alert('Error', msg);
    } finally {
      setCreatingCategory(false);
      setSavingCategory(false);
    }
  };

  const handleSaveTransaction = async () => {
    if (!editingTxn || !editCategory.trim()) return;
    setSavingCategory(true);
    try {
      const txnId = editingTxn.id || editingTxn.transactionId;
      const payload = { 
        category: editCategory.trim(),
        type: editType
      };

      await transactionsAPI.updateTransactionDetails(txnId, payload);
      await new Promise(resolve => setTimeout(resolve, 300));
      await fetchReport();

      Alert.alert('Success', 'Transaction updated successfully');
      closeEditModal();
    } catch (err) {
      console.error('Transaction update error:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to update transaction';
      Alert.alert('Error', msg);
    } finally {
      setSavingCategory(false);
    }
  };

  const getCategoryOptions = () => {
    return allCategories;
  };

  return (
    <ImageBackground source={backgroundImage} resizeMode="cover" style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bank Statement Report</Text>
        <Text style={styles.headerSubtitle}>{fileName}</Text>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primaryLight} />}
      >
        {/* Only the first load shows the loader: keeping the report on screen during a
            reload means saving an edit doesn't lose the user's place or filters. */}
        {loading && !report ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={colors.primaryLight} />
            <Text style={styles.loadingText}>Loading report...</Text>
          </View>
        ) : report ? (
          <>
            <BankStatementSummary reportData={report} onReviewPress={reviewFlaggedTransactions} />
            <View
              style={styles.transactionsContainer}
              onLayout={(e) => { transactionsOffset.current = e.nativeEvent.layout.y; }}
            >
              <TransactionsSection
                open={showTransactions}
                onToggle={toggleTransactions}
                transactions={report.transactions || []}
                onEditTransaction={openEditModal}
                reviewOnly={reviewOnly}
                onReviewOnlyChange={setReviewOnly}
              />
            </View>
          </>
        ) : null}
      </ScrollView>

      {/* Edit Transaction Modal */}
      <Modal
        visible={!!editingTxn}
        transparent
        animationType="fade"
        onRequestClose={closeEditModal}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={closeEditModal}
        >
          <View onStartShouldSetResponder={() => true} style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Transaction</Text>
            {editingTxn && (
              <Text style={styles.modalSubtitle} numberOfLines={2}>
                {editingTxn.description}
              </Text>
            )}

            {editingTxn?.needsReview && (
              <Text style={styles.modalReviewHint}>
                Low confidence. Check the category, then Save to confirm it.
              </Text>
            )}

            {/* Transaction Type Toggle */}
            <Text style={styles.modalLabel}>Transaction Type</Text>
            <View style={styles.typeToggle}>
              <TouchableOpacity
                style={[styles.typeToggleBtn, editType === 'EXPENSE' && styles.typeToggleBtnActiveExpense]}
                onPress={() => setEditType('EXPENSE')}
              >
                <Text style={[styles.typeToggleText, editType === 'EXPENSE' && styles.typeToggleTextActive]}>
                  Expense
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeToggleBtn, editType === 'INCOME' && styles.typeToggleBtnActiveIncome]}
                onPress={() => setEditType('INCOME')}
              >
                <Text style={[styles.typeToggleText, editType === 'INCOME' && styles.typeToggleTextActive]}>
                  Income
                </Text>
              </TouchableOpacity>
            </View>

            {/* Category Dropdown */}
            <Text style={styles.modalLabel}>Category</Text>
            {!showAddCategory ? (
              <>
                <ScrollView style={styles.categoryDropdown} nestedScrollEnabled>
                  {getCategoryOptions().map((cat) => {
                    const option = getCategoryStyle(cat);
                    return (
                      <TouchableOpacity
                        key={cat}
                        style={[
                          styles.categoryOption,
                          editCategory === cat && styles.categoryOptionSelected,
                        ]}
                        onPress={() => setEditCategory(cat)}
                      >
                        <View style={[styles.categoryOptionIcon, { backgroundColor: option.tint }]}>
                          <MaterialIcons name={option.icon} size={15} color={option.color} />
                        </View>
                        <Text
                          style={[
                            styles.categoryOptionText,
                            editCategory === cat && styles.categoryOptionTextSelected,
                          ]}
                        >
                          {cat}
                        </Text>
                        {editCategory === cat && <Text style={styles.categoryCheck}>✓</Text>}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
                <TouchableOpacity
                  style={styles.addCategoryButton}
                  onPress={() => setShowAddCategory(true)}
                >
                  <Text style={styles.addCategoryButtonText}>+ Add New Category</Text>
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.newCategoryContainer}>
                <TextInput
                  style={styles.modalInput}
                  value={newCategoryName}
                  onChangeText={setNewCategoryName}
                  placeholder="Enter new category name"
                  placeholderTextColor={colors.textFaint}
                  autoFocus
                />
                <View style={styles.newCategoryActions}>
                  <TouchableOpacity
                    style={styles.cancelNewCategoryBtn}
                    onPress={() => {
                      setShowAddCategory(false);
                      setNewCategoryName('');
                    }}
                    disabled={creatingCategory}
                  >
                    <Text style={styles.cancelNewCategoryText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.createCategoryBtn, creatingCategory && styles.buttonDisabled]}
                    onPress={handleCreateNewCategory}
                    disabled={creatingCategory || !newCategoryName.trim()}
                  >
                    <Text style={styles.createCategoryText}>
                      {creatingCategory ? 'Creating...' : 'Create'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Only show Save/Cancel buttons when not adding new category */}
            {!showAddCategory && (
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={closeEditModal}
                  disabled={savingCategory}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalSaveBtn, savingCategory && styles.buttonDisabled]}
                  onPress={handleSaveTransaction}
                  disabled={savingCategory || !editCategory.trim()}
                >
                  <Text style={styles.modalSaveText}>{savingCategory ? 'Saving...' : 'Save'}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollView: { flex: 1 },
  header: {
    backgroundColor: colors.surface,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 4,
  },
  transactionsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  centerBox: { alignItems: 'center', paddingVertical: 40 },
  loadingText: { marginTop: 10, fontSize: 14, color: colors.text },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.6,
    shadowRadius: 40,
    elevation: 12,
  },
  modalTitle: { fontSize: 17, fontWeight: '700', color: colors.text, textAlign: 'center' },
  modalSubtitle: { fontSize: 12, color: colors.textMuted, textAlign: 'center', marginTop: 4, marginBottom: 14 },
  modalReviewHint: {
    fontSize: 12,
    color: colors.amber,
    textAlign: 'center',
    marginBottom: 14,
  },
  modalLabel: { fontSize: 13, fontWeight: '600', color: colors.textMuted, marginBottom: 6 },
  typeToggle: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceHigh,
    borderRadius: 999,
    padding: 3,
    marginBottom: 16,
  },
  typeToggleBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  typeToggleBtnActiveExpense: { backgroundColor: colors.expenseTint, borderColor: colors.expense },
  typeToggleBtnActiveIncome: { backgroundColor: colors.incomeTint, borderColor: colors.income },
  typeToggleText: { fontSize: 13, fontWeight: '600', color: colors.textFaint },
  typeToggleTextActive: { color: colors.text },
  modalInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.background,
    marginBottom: 14,
  },
  categoryDropdown: {
    maxHeight: 220,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.background,
    padding: 6,
    marginBottom: 12,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 8,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryOptionIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryOptionSelected: { backgroundColor: colors.primaryTint, borderColor: colors.primary },
  categoryOptionText: { flex: 1, fontSize: 13, color: colors.text },
  categoryOptionTextSelected: { color: colors.primaryLight, fontWeight: '600' },
  categoryCheck: { fontSize: 14, color: colors.primaryLight, fontWeight: '700' },
  addCategoryButton: {
    marginBottom: 14,
    paddingVertical: 9,
    paddingHorizontal: 12,
    backgroundColor: colors.primaryTint,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    borderRadius: 999,
    alignItems: 'center',
  },
  addCategoryButtonText: { color: colors.primaryLight, fontSize: 13, fontWeight: '600' },
  newCategoryContainer: { marginBottom: 14 },
  newCategoryActions: { flexDirection: 'row', gap: 8, marginTop: 8 },
  cancelNewCategoryBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 999,
    alignItems: 'center',
    backgroundColor: colors.surfaceHigh,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelNewCategoryText: { color: colors.textMuted, fontSize: 13, fontWeight: '600' },
  createCategoryBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 999,
    alignItems: 'center',
    backgroundColor: colors.primary,
  },
  createCategoryText: { color: colors.onPrimary, fontSize: 13, fontWeight: '600' },
  modalActions: { flexDirection: 'row', gap: 8 },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 999,
    alignItems: 'center',
    backgroundColor: colors.surfaceHigh,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalCancelText: { color: colors.textMuted, fontSize: 14, fontWeight: '600' },
  modalSaveBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 999,
    alignItems: 'center',
    backgroundColor: colors.primary,
  },
  modalSaveText: { color: colors.onPrimary, fontSize: 14, fontWeight: '600' },
  buttonDisabled: { opacity: 0.5 },
});

export default BankStatementReportScreen;
