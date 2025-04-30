import React, { useState } from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

const ExpenseTracking = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [newExpense, setNewExpense] = useState({
    amount: '',
    category: '',
    date: '',
    dueDate: '',
    description: '',
    department: '',
  });

  // Sample data - replace with actual API data
  const expenseData = {
    expenses: [
      { id: 1, category: 'Equipment', amount: 25000000, date: '2023-08-15', department: 'RIIT', status: 'paid' },
      { id: 2, category: 'Travel', amount: 15000000, date: '2023-08-10', department: 'Regional', status: 'pending' },
      { id: 3, category: 'Office Supplies', amount: 5000000, date: '2023-08-05', department: 'Internal', status: 'paid' },
      { id: 4, category: 'Events', amount: 35000000, date: '2023-08-01', department: 'Kewirausahaan', status: 'paid' },
    ],
    categories: ['Equipment', 'Travel', 'Office Supplies', 'Events', 'Research'],
    departments: ['RIIT', 'Internal', 'Kewirausahaan', 'Regional', 'Medvis'],
  };

  // Pie chart data
  const pieChartData = {
    labels: ['Equipment', 'Travel', 'Office Supplies', 'Events'],
    datasets: [
      {
        data: [25000000, 15000000, 5000000, 35000000],
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
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

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log('New expense:', { ...newExpense, receipt: selectedFile });
    setShowAddModal(false);
    setNewExpense({
      amount: '',
      category: '',
      date: '',
      dueDate: '',
      description: '',
      department: '',
    });
    setSelectedFile(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Expense Tracking
        </h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary mt-4 sm:mt-0"
        >
          <i className="fas fa-plus mr-2"></i>
          Add New Expense
        </button>
      </div>

      {/* Expense Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Expense Distribution</h3>
          <div className="h-64">
            <Pie
              data={pieChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right',
                  },
                  tooltip: {
                    callbacks: {
                      label: (context) => {
                        const label = context.label || '';
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

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
          <div className="grid grid-cols-1 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
              <p className="text-sm text-blue-600 dark:text-blue-200">Total Expenses This Month</p>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-100">
                {formatCurrency(80000000)}
              </p>
            </div>
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
              <p className="text-sm text-yellow-600 dark:text-yellow-200">Pending Payments</p>
              <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-100">
                {formatCurrency(15000000)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Expense List */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Recent Expenses</h3>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Department</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenseData.expenses.map((expense) => (
                <tr key={expense.id}>
                  <td>{new Date(expense.date).toLocaleDateString('id-ID')}</td>
                  <td>{expense.category}</td>
                  <td>{expense.department}</td>
                  <td className="text-red-600 font-medium">
                    {formatCurrency(expense.amount)}
                  </td>
                  <td>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        expense.status === 'paid'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {expense.status}
                    </span>
                  </td>
                  <td>
                    <button className="text-blue-600 hover:text-blue-800 mr-3">
                      <i className="fas fa-edit"></i>
                    </button>
                    <button className="text-red-600 hover:text-red-800">
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

            <div className="relative bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Add New Expense</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="amount" className="label">Amount</label>
                  <input
                    type="number"
                    id="amount"
                    className="input"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="category" className="label">Category</label>
                  <select
                    id="category"
                    className="input"
                    value={newExpense.category}
                    onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                    required
                  >
                    <option value="">Select a category</option>
                    {expenseData.categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="department" className="label">Department</label>
                  <select
                    id="department"
                    className="input"
                    value={newExpense.department}
                    onChange={(e) => setNewExpense({ ...newExpense, department: e.target.value })}
                    required
                  >
                    <option value="">Select a department</option>
                    {expenseData.departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="date" className="label">Date</label>
                  <input
                    type="date"
                    id="date"
                    className="input"
                    value={newExpense.date}
                    onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="dueDate" className="label">Due Date (Optional)</label>
                  <input
                    type="date"
                    id="dueDate"
                    className="input"
                    value={newExpense.dueDate}
                    onChange={(e) => setNewExpense({ ...newExpense, dueDate: e.target.value })}
                  />
                </div>

                <div>
                  <label htmlFor="receipt" className="label">Receipt</label>
                  <input
                    type="file"
                    id="receipt"
                    className="input"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                  />
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Upload receipt (PDF or image)
                  </p>
                </div>

                <div>
                  <label htmlFor="description" className="label">Description</label>
                  <textarea
                    id="description"
                    className="input"
                    rows="3"
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                  ></textarea>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Add Expense
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

export default ExpenseTracking;
