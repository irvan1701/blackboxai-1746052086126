import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import IncomeManagement from './components/IncomeManagement';
import ExpenseTracking from './components/ExpenseTracking';
import BalanceOverview from './components/BalanceOverview';
import Budgeting from './components/Budgeting';
import FinancialReports from './components/FinancialReports';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();

  // Check for authentication token on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  // Handle dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Handle login
  const handleLogin = (token) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
    navigate('/dashboard');
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    navigate('/login');
  };

  // Protected Route wrapper
  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" />;
    }
    return children;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Routes>
        <Route 
          path="/login" 
          element={
            isAuthenticated ? 
            <Navigate to="/dashboard" /> : 
            <Login onLogin={handleLogin} />
          } 
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard 
                onLogout={handleLogout}
                darkMode={darkMode}
                setDarkMode={setDarkMode}
              >
                <Routes>
                  <Route index element={<BalanceOverview />} />
                  <Route path="income" element={<IncomeManagement />} />
                  <Route path="expenses" element={<ExpenseTracking />} />
                  <Route path="budgeting" element={<Budgeting />} />
                  <Route path="reports" element={<FinancialReports />} />
                </Routes>
              </Dashboard>
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </div>
  );
}

export default App;
