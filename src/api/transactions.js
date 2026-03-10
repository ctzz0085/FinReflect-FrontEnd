import api from './client';

export const transactionsAPI = {
  // Get user balance
  getBalance: () => api.get('/expense/getBalance'),
  
  // Get income categories (singular, not plural)
  getIncomeCategories: () => api.get('/api/income-category'),
  
  // Get expense categories
  getExpenseCategories: () => api.get('/api/categories'),
  
  // Add income category
  addIncomeCategory: (name) => api.post(`/api/income-category?name=${encodeURIComponent(name)}`),
  
  // Add expense category
  addExpenseCategory: (name) => api.post('/api/categories', { name }),
  
  // Update income category  
  updateIncomeCategory: (id, name) => api.post(`/api/income-category?id=${id}&name=${encodeURIComponent(name)}`),
  
  // Update expense category
  updateExpenseCategory: (id, name) => api.put(`/api/categories/${id}`, { name }),
  
  // Delete income category
  deleteIncomeCategory: (id) => api.delete(`/api/income-category/${id}`),
  
  // Delete expense category
  deleteExpenseCategory: (id) => api.delete(`/api/categories/${id}`),
  
  // Get income transactions (optional filter: week|month|year, or custom startDate+endDate)
  getIncomeTransactions: (params) => api.get('/income/getIncomes', { params }),
  
  // Get expense transactions (optional filter: week|month|year, or custom startDate+endDate)
  getExpenseTransactions: (params) => api.get('/expense/getExpenseHistory', { params }),
  
  // Add income
  addIncome: (data) => api.post('/income/addIncome', data),
  
  // Add expense
  addExpense: (data) => api.post('/expense/addExpense', data),
  
  // Update income
  updateIncome: (id, data) => api.put(`/income/updateIncome/${id}`, data),
  
  // Update expense
  updateExpense: (id, data) => api.put(`/expense/updateExpense/${id}`, data),
  
  // Delete income
  deleteIncome: (id) => api.delete(`/income/deleteIncome/${id}`),
  
  // Delete expense
  deleteExpense: (id) => api.delete(`/expense/deleteExpense/${id}`),
  
  // Get transactions
  getTransactions: () => api.get('/api/transactions'),
  
  // Get income history
  getIncomeHistory: () => api.get('/api/income-history'),
  
  // Get expense history
  getExpenseHistory: () => api.get('/api/expense-history'),
  
  // Get financial analysis
  getFinancialAnalysis: (fromDate, toDate) => {
    const params = new URLSearchParams();
    if (fromDate) params.append('fromDate', fromDate);
    if (toDate) params.append('toDate', toDate);
    const url = `/analysis/financial${params.toString() ? '?' + params.toString() : ''}`;
    return api.get(url);
  },
};
