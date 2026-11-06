import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    // Dimensions, // Only used to size the bar chart, which is commented out below.
    ImageBackground,
    Modal,
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
// import { BarChart } from 'react-native-chart-kit'; // Bar chart is commented out below.
import { transactionsAPI } from '../../api/transactions';
import CategoryDonut from '../../components/CategoryDonut';
import NeedsReviewNotice from '../../components/NeedsReviewNotice';
import TransactionsSection from '../../components/TransactionsSection';
import { getCategoryStyle } from '../../theme/categories';
import { colors } from '../../theme/colors';
import { isPdfEncrypted } from '../../utils/pdf';

const backgroundImage = require('../../../assets/images/login-background.jpg');

const CHART_COLORS = [
  '#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6',
  '#ec4899', '#06b6d4', '#f97316', '#6366f1', '#14b8a6',
];

const TABS = ['Upload & Report', 'History'];

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatCurrency = (amount) => {
  if (amount == null) return '₹0.00';
  return '₹' + Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const BankStatementScreen = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState(0);

  // Upload tab state
  const [selectedFile, setSelectedFile] = useState(null);
  const [password, setPassword] = useState('');
  const [uploading, setUploading] = useState(false);
  const [report, setReport] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [uploadError, setUploadError] = useState('');

  // History tab state
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [historyReport, setHistoryReport] = useState(null);
  const [historyReportLoading, setHistoryReportLoading] = useState(false);

  // Category correction state
  const [editingTxn, setEditingTxn] = useState(null);
  const [editCategory, setEditCategory] = useState('');
  const [editType, setEditType] = useState('EXPENSE');
  const [savingCategory, setSavingCategory] = useState(false);
  const [activeReportData, setActiveReportData] = useState(null);
  
  // New category creation state
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [creatingCategory, setCreatingCategory] = useState(false);
  
  // All categories from database
  const [allExpenseCategories, setAllExpenseCategories] = useState([]);
  const [allIncomeCategories, setAllIncomeCategories] = useState([]);

  // Chart toggle state
  const [chartTab, setChartTab] = useState('expense');

  // Transaction list below the charts
  const [showTransactions, setShowTransactions] = useState(false);
  const [reviewOnly, setReviewOnly] = useState(false);
  const scrollRef = useRef(null);
  const reportOffset = useRef(0);
  const transactionsOffset = useRef(0);

  const toggleTransactions = () => {
    setReviewOnly(false);
    setShowTransactions((open) => !open);
  };

  // The notice is at the top and the list is below the charts, so take the user there.
  const reviewFlaggedTransactions = () => {
    setReviewOnly(true);
    setShowTransactions(true);
    // Wait for the list to render, otherwise the page is too short to scroll that far.
    setTimeout(() => scrollRef.current?.scrollTo({ y: reportOffset.current + transactionsOffset.current, animated: true }), 100);
  };

  const fetchCategories = useCallback(() => {
    // Fetch expense categories
    transactionsAPI.getExpenseCategories()
      .then((res) => {
        const categories = res.data || [];
        setAllExpenseCategories(categories.map(cat => cat.name).sort());
      })
      .catch((err) => {
        console.error('Error fetching expense categories', err);
        setAllExpenseCategories([]);
      });
    
    // Fetch income categories
    transactionsAPI.getIncomeCategories()
      .then((res) => {
        const categories = res.data || [];
        setAllIncomeCategories(categories.map(cat => cat.name).sort());
      })
      .catch((err) => {
        console.error('Error fetching income categories', err);
        setAllIncomeCategories([]);
      });
  }, []);

  const fetchHistory = useCallback(() => {
    setHistoryLoading(true);
    transactionsAPI.getBankStatementHistory()
      .then((res) => setHistory(res.data || []))
      .catch((err) => {
        console.error('Error fetching bank statement history', err);
        setHistory([]);
      })
      .finally(() => setHistoryLoading(false));
  }, []);

  useEffect(() => {
    // Fetch categories on mount
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (activeTab === 1) {
      fetchHistory();
    }
  }, [activeTab, fetchHistory]);

  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setSelectedFile(asset);
        setPassword('');
        setReport(null);
        setShowTransactions(false);
        setReviewOnly(false);
        setUploadError('');
        setPasswordError('');
        setShowPasswordModal((await isPdfEncrypted(asset)) === true);
      }
    } catch (err) {
      console.error('File picker error:', err);
      Alert.alert('Error', 'Failed to pick file');
    }
  };

  // Password problems go back to the popup; anything else shows on the upload card.
  const showUploadFailure = (message) => {
    if (/password/i.test(message)) {
      setPassword('');
      setPasswordError(message);
      setShowPasswordModal(true);
    } else {
      setUploadError(message);
    }
  };

  const cancelPasswordModal = () => {
    setShowPasswordModal(false);
    setPasswordError('');
    setPassword('');
    setSelectedFile(null);
  };

  const submitPasswordModal = () => {
    setShowPasswordModal(false);
    handleUpload();
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      Alert.alert('Error', 'Please select a PDF file first');
      return;
    }

    const formData = new FormData();
    if (Platform.OS === 'web') {
      // On web, expo-document-picker provides a File object
      const fileBlob = selectedFile.file || await fetch(selectedFile.uri).then(r => r.blob());
      formData.append('file', fileBlob, selectedFile.name || 'bank-statement.pdf');
    } else {
      formData.append('file', {
        uri: selectedFile.uri,
        type: 'application/pdf',
        name: selectedFile.name || 'bank-statement.pdf',
      });
    }
    
    // Add password if provided (optional)
    if (password.trim()) {
      formData.append('password', password.trim());
    }

    setUploading(true);
    setUploadError('');
    setPasswordError('');
    try {
      const res = await transactionsAPI.uploadBankStatement(formData);
      // The backend reports parsing failures, including password ones, as 200 with status FAILED.
      if (res.data?.status === 'FAILED') {
        showUploadFailure((res.data.summary || 'Upload failed').replace('Failed to analyze bank statement: ', ''));
      } else {
        setReport(res.data);
        setShowTransactions(false);
        setReviewOnly(false);
        setSelectedFile(null);
        setPassword('');
      }
    } catch (err) {
      console.error('Upload error:', err);
      const data = err.response?.data;
      showUploadFailure(data?.summary || data?.message || data?.error || err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleViewHistoryReport = async (statementId) => {
    if (selectedHistory === statementId && historyReport) {
      setSelectedHistory(null);
      setHistoryReport(null);
      return;
    }
    setSelectedHistory(statementId);
    setHistoryReportLoading(true);
    try {
      const res = await transactionsAPI.getBankStatementReport(statementId);
      setHistoryReport(res.data);
    } catch (err) {
      console.error('Error fetching report:', err);
      Alert.alert('Error', 'Failed to load report');
      setSelectedHistory(null);
      setHistoryReport(null);
    } finally {
      setHistoryReportLoading(false);
    }
  };

  const handleDeleteStatement = async (statementId, fileName) => {
    console.log('Delete button clicked for:', statementId, fileName);
    
    // Platform-specific confirmation
    let confirmed = false;
    
    if (Platform.OS === 'web') {
      // Use window.confirm for web
      confirmed = window.confirm(
        `Are you sure you want to delete "${fileName}"?\n\nThis will permanently delete the statement and all its transactions.`
      );
    } else {
      // Use Alert.alert for mobile
      return new Promise((resolve) => {
        Alert.alert(
          'Delete Statement',
          `Are you sure you want to delete "${fileName}"? This will permanently delete the statement and all its transactions.`,
          [
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => resolve(),
            },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: async () => {
                try {
                  console.log('Deleting statement:', statementId);
                  await transactionsAPI.deleteBankStatement(statementId);
                  Alert.alert('Success', 'Statement deleted successfully');
                  fetchHistory();
                } catch (err) {
                  console.error('Error deleting statement:', err);
                  const msg = err.response?.data?.message || err.message || 'Failed to delete statement';
                  Alert.alert('Error', msg);
                }
                resolve();
              },
            },
          ]
        );
      });
    }
    
    // Handle web confirmation
    if (confirmed) {
      try {
        console.log('Deleting statement:', statementId);
        await transactionsAPI.deleteBankStatement(statementId);
        window.alert('Statement deleted successfully');
        fetchHistory();
      } catch (err) {
        console.error('Error deleting statement:', err);
        const msg = err.response?.data?.message || err.message || 'Failed to delete statement';
        window.alert('Error: ' + msg);
      }
    }
  };

  const openEditModal = (txn, reportData) => {
    setEditingTxn(txn);
    setEditCategory(txn.category || '');
    setEditType(txn.type || 'EXPENSE');
    setActiveReportData(reportData);
  };

  const closeEditModal = () => {
    setEditingTxn(null);
    setEditCategory('');
    setEditType('EXPENSE');
    setActiveReportData(null);
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
      // Create the new category based on type
      if (editType === 'EXPENSE') {
        await transactionsAPI.addExpenseCategory(newCategoryName.trim());
      } else {
        await transactionsAPI.addIncomeCategory(newCategoryName.trim());
      }
      
      // Refresh categories list
      await fetchCategories();
      
      // Set the new category as selected
      const createdCategoryName = newCategoryName.trim();
      setEditCategory(createdCategoryName);
      setNewCategoryName('');
      setShowAddCategory(false);
      
      // Now update the transaction with the new category and type
      const txnId = editingTxn.id || editingTxn.transactionId;
      const payload = { 
        category: createdCategoryName,
        type: editType
      };
      
      await transactionsAPI.updateTransactionDetails(txnId, payload);
      
      // Refresh the report to get updated data with a small delay to ensure backend is updated
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const statementId = selectedHistory?.id || report?.statementId;
      if (statementId) {
        const refreshedReport = await transactionsAPI.getBankStatementReport(statementId);
        const freshData = refreshedReport.data;
        
        if (selectedHistory) {
          // Update history report with fresh data
          setHistoryReport(null); // Clear first to force re-render
          setTimeout(() => setHistoryReport(freshData), 0);
          await fetchHistory();
        } else {
          // Update upload report with fresh data
          setReport(freshData);
        }
      }
      
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
      
      // Use the correct API endpoint
      await transactionsAPI.updateTransactionDetails(txnId, payload);
      
      // Add small delay to ensure backend is updated
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Refresh the report to get updated category list and transactions
      const statementId = selectedHistory?.id || report?.statementId;
      if (statementId) {
        const refreshedReport = await transactionsAPI.getBankStatementReport(statementId);
        const freshData = refreshedReport.data;
        
        if (selectedHistory) {
          // Clear and update history report to force re-render
          setHistoryReport(null);
          setTimeout(() => setHistoryReport(freshData), 0);
          // Also refresh the history list to update the summary
          await fetchHistory();
        } else {
          // Update in place so the user keeps their scroll position
          setReport(freshData);
        }
      }
      
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
    // Return categories based on selected type
    return editType === 'EXPENSE' ? allExpenseCategories : allIncomeCategories;
  };

  const renderReport = (data) => {
    if (!data) return null;

    const expenseCategories = (data.categorySummary || []).filter((c) => c.type === 'EXPENSE');
    const incomeCategories = (data.categorySummary || []).filter((c) => c.type === 'INCOME');
    const netAmount = data.netAmount != null ? data.netAmount : (data.totalIncome || 0) - (data.totalExpense || 0);

    return (
      <View
        style={styles.reportContainer}
        onLayout={(e) => { reportOffset.current = e.nativeEvent.layout.y; }}
      >
        <NeedsReviewNotice
          count={(data.transactions || []).filter((txn) => txn.needsReview).length}
          onPress={reviewFlaggedTransactions}
        />

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Transactions</Text>
            <Text style={styles.summaryValue}>{data.totalTransactions || 0}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Income</Text>
            <Text style={[styles.summaryValue, { color: colors.income }]}>{formatCurrency(data.totalIncome)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Expense</Text>
            <Text style={[styles.summaryValue, { color: colors.expense }]}>{formatCurrency(data.totalExpense)}</Text>
          </View>
          <View style={[styles.summaryRow, styles.summaryRowNet]}>
            <Text style={[styles.summaryLabel, { fontWeight: '700' }]}>Net Amount</Text>
            <Text style={[styles.summaryValue, { fontWeight: '700', color: netAmount >= 0 ? colors.income : colors.expense }]}>
              {formatCurrency(netAmount)}
            </Text>
          </View>
        </View>

        {/* Charts Section */}
        {(expenseCategories.length > 0 || incomeCategories.length > 0) && (() => {
          const chartCategories = chartTab === 'expense' ? expenseCategories : incomeCategories;
          // The bar chart is hidden so this page shows only the pie chart, like View Report.
          // Its code is kept here and below in case it's needed again.
          // const screenWidth = Dimensions.get('window').width - 64;
          //
          // const barData = {
          //   labels: chartCategories.map((c) => c.category.length > 8 ? c.category.slice(0, 7) + '..' : c.category),
          //   datasets: [{ data: chartCategories.map((c) => c.totalAmount) }],
          // };
          //
          // const barChartConfig = {
          //   backgroundColor: colors.surface,
          //   backgroundGradientFrom: colors.surface,
          //   backgroundGradientTo: colors.surface,
          //   decimalPlaces: 0,
          //   color: () => chartTab === 'expense' ? colors.expense : colors.income,
          //   labelColor: () => colors.textMuted,
          //   barPercentage: 0.6,
          //   fillShadowGradientFromOpacity: 0.95,
          //   fillShadowGradientToOpacity: 0.55,
          //   propsForBackgroundLines: { stroke: colors.border },
          //   propsForLabels: { fontSize: 10 },
          // };

          return (
            <View style={styles.chartCard}>
              <Text style={styles.chartCardTitle}>Category Analysis</Text>
              <View style={styles.chartToggle}>
                <TouchableOpacity
                  style={[styles.chartToggleBtn, chartTab === 'expense' && styles.chartToggleBtnActive]}
                  onPress={() => setChartTab('expense')}
                >
                  <Text style={[styles.chartToggleText, chartTab === 'expense' && styles.chartToggleTextActive]}>Expense</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.chartToggleBtn, chartTab === 'income' && styles.chartToggleBtnActiveIncome]}
                  onPress={() => setChartTab('income')}
                >
                  <Text style={[styles.chartToggleText, chartTab === 'income' && styles.chartToggleTextActive]}>Income</Text>
                </TouchableOpacity>
              </View>

              {chartCategories.length > 0 ? (
                <>
                  {/* Bar chart hidden, see the note above.
                  <Text style={styles.chartSubTitle}>Amount by Category</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <BarChart
                      data={barData}
                      width={Math.max(screenWidth, chartCategories.length * 70)}
                      height={220}
                      chartConfig={barChartConfig}
                      style={styles.chart}
                      fromZero
                      showValuesOnTopOfBars
                    />
                  </ScrollView>
                  */}

                  <Text style={styles.chartSubTitle}>Category Distribution</Text>
                  <CategoryDonut key={chartTab} data={chartCategories} />
                </>
              ) : (
                <Text style={styles.chartEmpty}>No {chartTab} categories to display</Text>
              )}
            </View>
          );
        })()}

        {/* AI Summary card: disabled, kept for reference.
            Why it existed: to show a written overview of the statement under the charts.
            Why it is off: the text is not AI output. The backend's buildSummary
            (StatementParsingPipeline.java) formats counts and totals locally, repeating the
            Summary card, and the Groq calls are already commented out, so there is no API
            call to disable here.
            Note: data.summary must stay in the API. It also carries upload error messages
            (see handleUpload) and parser "Please review" warnings, which this card was
            the only place to show.

        {data.summary ? (
          <View style={styles.aiSummaryCard}>
            <Text style={styles.aiSummaryTitle}>AI Analysis</Text>
            <Text style={styles.aiSummaryText}>{data.summary}</Text>
          </View>
        ) : null}
        */}


        <View
          style={styles.transactionsSection}
          onLayout={(e) => { transactionsOffset.current = e.nativeEvent.layout.y; }}
        >
          <TransactionsSection
            open={showTransactions}
            onToggle={toggleTransactions}
            transactions={data.transactions || []}
            onEditTransaction={(txn) => openEditModal(txn, data)}
            reviewOnly={reviewOnly}
            onReviewOnlyChange={setReviewOnly}
          />
        </View>
      </View>
    );
  };

  return (
    <ImageBackground source={backgroundImage} resizeMode="cover" style={styles.container}>
      {/* Tab Bar */}
      <View style={styles.tabBar}>
        {TABS.map((tab, idx) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === idx && styles.tabActive]}
            onPress={() => setActiveTab(idx)}
          >
            <Text style={[styles.tabText, activeTab === idx && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      {activeTab === 0 ? (
        <ScrollView ref={scrollRef} style={styles.content} contentContainerStyle={styles.contentContainer}>
          {/* Upload Section */}
          <View style={styles.uploadCard}>
            <Text style={styles.uploadTitle}>Upload Bank Statement</Text>
            <Text style={styles.uploadSubtitle}>Select a PDF bank statement to analyze</Text>

            <TouchableOpacity style={styles.pickButton} onPress={handlePickFile} disabled={uploading}>
              <Text style={styles.pickButtonText}>
                {selectedFile ? `📄 ${selectedFile.name}` : '📁 Choose PDF File'}
              </Text>
            </TouchableOpacity>

            {selectedFile && (
              <Text style={styles.fileInfo}>
                {(selectedFile.size / 1024).toFixed(1)} KB
              </Text>
            )}

            {uploadError ? (
              <View style={styles.uploadErrorBox}>
                <Text style={styles.uploadErrorText}>{uploadError}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={[styles.uploadButton, (!selectedFile || uploading) && styles.buttonDisabled]}
              onPress={handleUpload}
              disabled={!selectedFile || uploading}
            >
              {uploading ? (
                <View style={styles.uploadingRow}>
                  <ActivityIndicator size="small" color={colors.textMuted} />
                  <Text style={[styles.uploadButtonText, styles.buttonTextDisabled]}>  Analyzing... (may take 15s)</Text>
                </View>
              ) : (
                <Text style={[styles.uploadButtonText, !selectedFile && styles.buttonTextDisabled]}>Upload & Analyze</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Report */}
          {report && renderReport(report)}
        </ScrollView>
      ) : (
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          refreshControl={<RefreshControl refreshing={historyLoading} onRefresh={fetchHistory} tintColor={colors.primaryLight} />}
        >
          {historyLoading && history.length === 0 ? (
            <View style={styles.centerBox}>
              <ActivityIndicator size="large" color={colors.primaryLight} />
              <Text style={styles.loadingText}>Loading history...</Text>
            </View>
          ) : history.length === 0 ? (
            <View style={styles.centerBox}>
              <Text style={styles.emptyText}>No statements uploaded yet.</Text>
            </View>
          ) : (
            history.map((item) => (
              <View key={item.statementId}>
                <View style={styles.historyCard}>
                  <View style={styles.historyTop}>
                    <Text style={styles.historyFileName} numberOfLines={1}>📄 {item.fileName}</Text>
                    <Text style={styles.historyDate}>{formatDate(item.uploadDate)}</Text>
                  </View>
                  <View style={styles.historyStats}>
                    <Text style={[styles.historyStat, { color: colors.income }]}>
                      Income: {formatCurrency(item.totalIncome)}
                    </Text>
                    <Text style={[styles.historyStat, { color: colors.expense }]}>
                      Expense: {formatCurrency(item.totalExpense)}
                    </Text>
                  </View>
                  <Text style={styles.historyTxnCount}>{item.totalTransactions} transactions</Text>
                  
                  <View style={styles.historyActions}>
                    <TouchableOpacity
                      style={styles.viewReportButton}
                      onPress={() => navigation.navigate('BankStatementReport', {
                        statementId: item.statementId,
                        fileName: item.fileName
                      })}
                    >
                      <Text style={styles.viewReportButtonText}>📊 View Report</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      activeOpacity={0.7}
                      onPress={() => {
                        console.log('Delete TouchableOpacity pressed');
                        handleDeleteStatement(item.statementId, item.fileName);
                      }}
                    >
                      <Text style={styles.deleteButtonText}>🗑️ Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {selectedHistory === item.statementId && (
                  historyReportLoading ? (
                    <View style={styles.centerBox}>
                      <ActivityIndicator size="small" color={colors.primaryLight} />
                    </View>
                  ) : historyReport ? (
                    renderReport(historyReport)
                  ) : null
                )}
              </View>
            ))
          )}
        </ScrollView>
      )}

      {/* PDF Password Modal */}
      <Modal
        visible={showPasswordModal}
        transparent
        animationType="fade"
        onRequestClose={cancelPasswordModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🔒 Password Required</Text>
            <Text style={styles.modalSubtitle} numberOfLines={2}>
              {selectedFile?.name}
            </Text>
            <Text style={styles.modalLabel}>This PDF is protected. Enter its password to continue.</Text>
            <TextInput
              style={styles.modalInput}
              value={password}
              onChangeText={setPassword}
              onSubmitEditing={submitPasswordModal}
              placeholder="Enter PDF password"
              placeholderTextColor={colors.textFaint}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus
            />
            {passwordError ? <Text style={styles.passwordErrorText}>{passwordError}</Text> : null}
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={cancelPasswordModal}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSaveBtn} onPress={submitPasswordModal}>
                <Text style={styles.modalSaveText}>Upload</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
                onPress={() => {
                  setEditType('EXPENSE');
                  setEditCategory('');
                }}
              >
                <Text style={[styles.typeToggleText, editType === 'EXPENSE' && styles.typeToggleTextActive]}>
                  Expense
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeToggleBtn, editType === 'INCOME' && styles.typeToggleBtnActiveIncome]}
                onPress={() => {
                  setEditType('INCOME');
                  setEditCategory('');
                }}
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
                    <Text style={[styles.createCategoryText, creatingCategory && styles.buttonTextDisabled]}>
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
                  <Text style={[styles.modalSaveText, savingCategory && styles.buttonTextDisabled]}>{savingCategory ? 'Saving...' : 'Save'}</Text>
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
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textMuted,
  },
  tabTextActive: {
    color: colors.primaryLight,
    fontWeight: '700',
  },
  content: { flex: 1 },
  contentContainer: { padding: 16, paddingBottom: 40 },
  transactionsSection: { marginTop: 16 },

  // Upload Section
  uploadCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  uploadSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  pickButton: {
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: colors.primaryTint,
  },
  pickButtonText: {
    fontSize: 15,
    color: colors.primaryLight,
    fontWeight: '600',
  },
  fileInfo: {
    fontSize: 12,
    color: colors.textFaint,
    textAlign: 'center',
    marginTop: 6,
  },
  uploadErrorBox: {
    backgroundColor: colors.expenseTint,
    borderRadius: 8,
    padding: 12,
    marginTop: 14,
  },
  uploadErrorText: {
    color: colors.expense,
    fontSize: 13,
    textAlign: 'center',
  },
  passwordErrorText: {
    color: colors.expense,
    fontSize: 13,
    marginTop: -6,
    marginBottom: 14,
  },
  uploadButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 14,
  },
  uploadButtonText: {
    color: colors.onPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  uploadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: colors.surfaceHighest,
  },
  buttonTextDisabled: {
    color: colors.textMuted,
  },

  // Report
  reportContainer: {
    marginTop: 16,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  summaryRowNet: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: 6,
    paddingTop: 10,
  },
  // Charts
  chartCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chartCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 10,
  },
  chartToggle: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceHigh,
    borderRadius: 999,
    padding: 3,
    marginBottom: 14,
  },
  chartToggleBtn: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  chartToggleBtnActive: {
    backgroundColor: colors.expenseTint,
    borderColor: colors.expense,
  },
  chartToggleBtnActiveIncome: {
    backgroundColor: colors.incomeTint,
    borderColor: colors.income,
  },
  chartToggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textFaint,
  },
  chartToggleTextActive: {
    color: colors.text,
  },
  chartSubTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 8,
  },
  // Used only by the bar chart, which is commented out above.
  // chart: {
  //   // borderRadius removed for iOS compatibility
  // },
  chartEmpty: {
    textAlign: 'center',
    color: colors.textFaint,
    fontSize: 13,
    paddingVertical: 30,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.textMuted,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },

  // AI Summary: disabled along with the card in renderReport, which explains why.
  // aiSummaryCard: {
  //   backgroundColor: colors.amberTint,
  //   borderRadius: 12,
  //   padding: 16,
  //   marginTop: 12,
  //   borderWidth: 1,
  //   borderColor: colors.amberBorder,
  // },
  // aiSummaryTitle: {
  //   fontSize: 14,
  //   fontWeight: '700',
  //   color: colors.amber,
  //   marginBottom: 8,
  // },
  // aiSummaryText: {
  //   fontSize: 13,
  //   color: colors.amberSoft,
  //   lineHeight: 20,
  // },

  // Category Breakdown

  // Transactions

  // Modal
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
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 14,
  },
  modalReviewHint: {
    fontSize: 12,
    color: colors.amber,
    textAlign: 'center',
    marginBottom: 14,
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 6,
  },
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
  typeToggleBtnActiveExpense: {
    backgroundColor: colors.expenseTint,
    borderColor: colors.expense,
  },
  typeToggleBtnActiveIncome: {
    backgroundColor: colors.incomeTint,
    borderColor: colors.income,
  },
  typeToggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textFaint,
  },
  typeToggleTextActive: {
    color: colors.text,
  },
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
  categoryOptionIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
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
  categoryOptionSelected: {
    backgroundColor: colors.primaryTint,
    borderColor: colors.primary,
  },
  categoryOptionText: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
  },
  categoryOptionTextSelected: {
    color: colors.primaryLight,
    fontWeight: '600',
  },
  categoryCheck: {
    fontSize: 14,
    color: colors.primaryLight,
    fontWeight: '700',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 8,
  },
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
  
  // Add New Category Styles
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
  addCategoryButtonText: {
    color: colors.primaryLight,
    fontSize: 13,
    fontWeight: '600',
  },
  newCategoryContainer: {
    marginBottom: 14,
  },
  newCategoryActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  cancelNewCategoryBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 999,
    alignItems: 'center',
    backgroundColor: colors.surfaceHigh,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelNewCategoryText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  createCategoryBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 999,
    alignItems: 'center',
    backgroundColor: colors.primary,
  },
  createCategoryText: {
    color: colors.onPrimary,
    fontSize: 13,
    fontWeight: '600',
  },

  // History
  historyCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  historyTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  historyFileName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  historyDate: {
    fontSize: 12,
    color: colors.textFaint,
  },
  historyStats: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 4,
  },
  historyStat: {
    fontSize: 12,
    fontWeight: '500',
  },
  historyTxnCount: {
    fontSize: 11,
    color: colors.textFaint,
    marginBottom: 6,
  },
  historyExpand: {
    fontSize: 12,
    color: colors.primaryLight,
    fontWeight: '600',
  },
  historyActions: {
    flexDirection: 'row',
    marginTop: 10,
  },
  viewReportButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: colors.primary,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewReportButtonText: {
    color: colors.onPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: colors.danger,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
  },
  deleteButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },

  // Common
  centerBox: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: colors.textMuted,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textFaint,
  },
});

export default BankStatementScreen;
