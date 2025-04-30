import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import DarkModeToggle from './DarkModeToggle';

const Dashboard = ({ children, onLogout, darkMode, setDarkMode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navigation = [
    {
      name: 'Overview',
      path: '/dashboard',
      icon: 'fas fa-chart-pie',
    },
    {
      name: 'Income',
      path: '/dashboard/income',
      icon: 'fas fa-money-bill-trend-up',
    },
    {
      name: 'Expenses',
      path: '/dashboard/expenses',
      icon: 'fas fa-receipt',
    },
    {
      name: 'Budgeting',
      path: '/dashboard/budgeting',
      icon: 'fas fa-wallet',
    },
    {
      name: 'Reports',
      path: '/dashboard/reports',
      icon: 'fas fa-file-invoice-dollar',
    },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar for mobile */}
      <div
        className={`fixed inset-0 z-40 lg:hidden ${
          isSidebarOpen ? 'block' : 'hidden'
        }`}
        onClick={() => setIsSidebarOpen(false)}
      >
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75"></div>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-center h-16 px-4 bg-primary-700 dark:bg-primary-900">
          <h1 className="text-xl font-bold text-white">APMI Finance</h1>
        </div>

        {/* Navigation */}
        <nav className="mt-5 px-2 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-150 ${
                isActive(item.path)
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-100'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              <i className={`${item.icon} w-6`}></i>
              <span className="ml-3">{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top navigation */}
        <nav className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Mobile menu button */}
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <i className="fas fa-bars"></i>
              </button>

              {/* Right side buttons */}
              <div className="flex items-center space-x-4">
                <DarkModeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
                
                <button
                  onClick={onLogout}
                  className="flex items-center text-sm text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
                >
                  <i className="fas fa-sign-out-alt mr-2"></i>
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main content area */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
