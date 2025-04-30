import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to attach auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const apiService = {
  // Auth endpoints
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),

  // Income endpoints
  getIncomes: (filters) => api.get('/income', { params: filters }),
  addIncome: (data) => api.post('/income', data),
  updateIncome: (id, data) => api.put(`/income/${id}`, data),
  deleteIncome: (id) => api.delete(`/income/${id}`),

  // Expense endpoints
  getExpenses: (filters) => api.get('/expenses', { params: filters }),
  addExpense: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'receipt' && data[key]) {
        formData.append('receipt', data[key]);
      } else {
        formData.append(key, data[key]);
      }
    });
    return api.post('/expenses', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  updateExpense: (id, data) => api.put(`/expenses/${id}`, data),
  deleteExpense: (id) => api.delete(`/expenses/${id}`),

  // Budget endpoints
  getBudgets: () => api.get('/budget'),
  setBudget: (department, amount) => api.post('/budget', { department, amount }),
  updateBudget: (id, data) => api.put(`/budget/${id}`, data),

  // Report endpoints
  generateReport: (params) => api.get('/reports/generate', { 
    params,
    responseType: 'blob' 
  }),
  getRecentReports: () => api.get('/reports/recent'),
  deleteReport: (id) => api.delete(`/reports/${id}`),

  // Dashboard overview
  getDashboardStats: () => api.get('/dashboard/stats'),
  getIncomeStats: (timeframe) => api.get('/dashboard/income-stats', { params: { timeframe } }),
  getExpenseStats: (timeframe) => api.get('/dashboard/expense-stats', { params: { timeframe } }),
  getBudgetOverview: () => api.get('/dashboard/budget-overview'),
};

export default apiService;
