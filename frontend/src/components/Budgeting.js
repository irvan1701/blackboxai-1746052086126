import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Budgeting = () => {
  const [showSetBudgetModal, setShowSetBudgetModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [newBudget, setNewBudget] = useState('');

  // Sample data - replace with actual API data
  const budgetData = {
    departments: [
      {
        name: 'RIIT',
        budget: 100000000,
        spent: 75000000,
        remaining: 25000000,
      },
      {
        name: 'Internal',
        budget: 80000000,
        spent: 45000000,
        remaining: 35000000,
      },
      {
        name: 'Kewirausahaan',
        budget: 120000000,
        spent: 95000000,
        remaining: 25000000,
      },
      {
        name: 'Regional',
        budget: 150000000,
        spent: 85000000,
        remaining: 65000000,
      },
      {
        name: 'Medvis',
        budget: 70000000,
        spent: 40000000,
        remaining: 30000000,
      },
    ],
  };

  // Bar chart data
  const barChartData = {
    labels: budgetData.departments.map(dept => dept.name),
    datasets: [
      {
        label: 'Budget',
        data: budgetData.departments.map(dept => dept.budget),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
      },
      {
        label: 'Spent',
        data: budgetData.departments.map(dept => dept.spent),
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 1,
      },
    ],
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate percentage spent
  const calculatePercentage = (spent, budget) => {
    return (spent / budget) * 100;
  };

  const handleSetBudget = (department) => {
    setSelectedDepartment(department);
    setNewBudget(department.budget.toString());
    setShowSetBudgetModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log('New budget for', selectedDepartment.name, ':', newBudget);
    setShowSetBudgetModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Department Budgeting
        </h1>
      </div>

      {/* Budget Overview Chart */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Budget vs Spending Overview</h3>
        <div className="h-80">
          <Bar
            data={barChartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: (value) => formatCurrency(value),
                  },
                },
              },
              plugins: {
                tooltip: {
                  callbacks: {
                    label: (context) => {
                      const label = context.dataset.label || '';
                      const value = formatCurrency(context.raw);
                      return `${label}: ${value}`;
                    },
                  },
                },
              },
            }}
          />
        </div>
      </div>

      {/* Department Budget Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {budgetData.departments.map((department) => {
          const percentageSpent = calculatePercentage(department.spent, department.budget);
          const isOverBudget = percentageSpent > 100;
          const warningThreshold = percentageSpent >= 80;

          return (
            <div key={department.name} className="card">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{department.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Total Budget: {formatCurrency(department.budget)}
                  </p>
                </div>
                <button
                  onClick={() => handleSetBudget(department)}
                  className="text-primary-600 hover:text-primary-700 dark:text-primary-400"
                >
                  <i className="fas fa-edit"></i>
                </button>
              </div>

              {/* Progress Bar */}
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block text-primary-600">
                      {percentageSpent.toFixed(1)}% Spent
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold inline-block text-primary-600">
                      {formatCurrency(department.remaining)} Remaining
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200 dark:bg-gray-700">
                  <div
                    style={{ width: `${Math.min(percentageSpent, 100)}%` }}
                    className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-500 ${
                      isOverBudget
                        ? 'bg-red-500'
                        : warningThreshold
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}
                  ></div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Spent</p>
                  <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                    {formatCurrency(department.spent)}
                  </p>
                </div>
                <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Remaining</p>
                  <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                    {formatCurrency(department.remaining)}
                  </p>
                </div>
              </div>

              {/* Warning Message */}
              {(isOverBudget || warningThreshold) && (
                <div className={`mt-4 p-2 rounded-lg text-sm ${
                  isOverBudget
                    ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200'
                    : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200'
                }`}>
                  <i className={`fas fa-exclamation-triangle mr-2`}></i>
                  {isOverBudget
                    ? 'Budget exceeded! Please review expenses.'
                    : 'Approaching budget limit!'}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Set Budget Modal */}
      {showSetBudgetModal && selectedDepartment && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

            <div className="relative bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  Set Budget for {selectedDepartment.name}
                </h3>
                <button
                  onClick={() => setShowSetBudgetModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="budget" className="label">Budget Amount</label>
                  <input
                    type="number"
                    id="budget"
                    className="input"
                    value={newBudget}
                    onChange={(e) => setNewBudget(e.target.value)}
                    required
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowSetBudgetModal(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Set Budget
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Budgeting;
