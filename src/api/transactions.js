import api from './client';

export const transactionsAPI = {
  // ===== BALANCE API =====
  getBalance: () => api.get('/expense/getBalance'),
  
  // ===== EXPENSE CATEGORY APIs =====
  getExpenseCategories: () => api.get('/api/categories'),
  addExpenseCategory: (name) => api.post('/api/categories', { name }),
  updateExpenseCategory: (id, name) => api.put(`/api/categories/${id}`, { name }),
  deleteExpenseCategory: (id) => api.delete(`/api/categories/${id}`),
  
  // ===== INCOME CATEGORY APIs =====
  getIncomeCategories: () => api.get('/api/income-category'),
  addIncomeCategory: (name) => api.post(`/api/income-category?name=${encodeURIComponent(name)}`),
  updateIncomeCategory: (id, name, userId) => api.put(`/api/income-category/${id}`, { name, userId }),
  deleteIncomeCategory: (id) => api.delete(`/api/income-category/${id}`),
  
  // ===== EXPENSE APIs =====
  // Get expense history - supports filter=month OR fromDate+toDate
  getExpenseTransactions: (params) => api.get('/expense/getExpenseHistory', { params }),
  
  // Add expense
  addExpense: (data) => api.post('/expense/addExpense', data),
  
  // Update expense
  updateExpense: (id, data) => api.put(`/expense/updateExpense/${id}`, data),
  
  // Delete expense
  deleteExpense: (id) => api.delete(`/expense/deleteExpense/${id}`),
  
  // Get category summary - supports filter=month
  getCategorySummary: (params) => api.get('/expense/getCategorySummary', { params }),
  
  // ===== INCOME APIs =====
  // Get incomes - supports filter=month OR fromDate+toDate
  getIncomeTransactions: (params) => api.get('/income/getIncomes', { params }),
  
  // Add income
  addIncome: (data) => api.post('/income/addIncome', data),
  
  // Update income
  updateIncome: (id, data) => api.put(`/income/updateIncome/${id}`, data),
  
  // Delete income
  deleteIncome: (id) => api.delete(`/income/deleteIncome/${id}`),
  
  // ===== BANK STATEMENT APIs =====
  uploadBankStatement: (formData) => api.post('/analysis/bank-statement/upload', formData, {
    timeout: 120000,
  }),
  getBankStatementReport: (statementId) => api.get(`/analysis/bank-statement/report?statementId=${statementId}`),
  getBankStatementHistory: () => api.get('/analysis/bank-statement/history'),
  deleteBankStatement: (statementId) => api.delete(`/analysis/bank-statement/${statementId}`),
  
  // Update transaction category
  updateTransactionCategory: (transactionId, category) => api.put(`/analysis/bank-statement/transaction/${transactionId}/category`, { category }),
  
  // Update transaction details (category + merchant)
  updateTransactionDetails: (transactionId, data) => api.post(`/analysis/bank-statement/transaction/${transactionId}/update`, data),
  
  // ===== FINANCIAL ANALYSIS API =====
  getFinancialAnalysis: (fromDate, toDate) => {
    const params = new URLSearchParams();
    if (fromDate) params.append('fromDate', fromDate);
    if (toDate) params.append('toDate', toDate);
    const url = `/financial-analysis/financial${params.toString() ? '?' + params.toString() : ''}`;
    return api.get(url);
  },
};
