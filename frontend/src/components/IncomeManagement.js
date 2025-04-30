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

const IncomeManagement = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newIncome, setNewIncome] = useState({
    amount: '',
    source: '',
    category: '',
    date: '',
    description: '',
  });

  // Sample data - replace with actual API data
  const incomeData = {
    sources: [
      { id: 1, source: 'Research Grants', amount: 150000000, date: '2023-08-15' },
      { id: 2, source: 'Event Sponsorships', amount: 75000000, date: '2023-08-10' },
      { id: 3, source: 'Donations', amount: 50000000, date: '2023-08-05' },
      { id: 4, source: 'Workshop Fees', amount: 25000000, date: '2023-08-01' },
    ],
    categories: ['Research Grants', 'Event Sponsorships', 'Donations', 'Workshop Fees'],
  };

  // Bar chart data
  const barChartData = {
    labels: incomeData.categories,
    datasets: [
      {
        label: 'Income by Category',
        data: [150000000, 75000000, 50000000, 25000000],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(99, 102, 241, 0.8)',
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

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log('New income:', newIncome);
    setShowAddModal(false);
    setNewIncome({
      amount: '',
      source: '',
      category: '',
      date: '',
      description: '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Income Management
        </h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary mt-4 sm:mt-0"
        >
          <i className="fas fa-plus mr-2"></i>
          Add New Income
        </button>
      </div>

      {/* Income Overview */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Income Distribution</h3>
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
                legend: {
                  display: false,
                },
                tooltip: {
                  callbacks: {
                    label: (context) => formatCurrency(context.raw),
                  },
                },
              },
            }}
          />
        </div>
      </div>

      {/* Income List */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Income Sources</h3>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Source</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {incomeData.sources.map((income) => (
                <tr key={income.id}>
                  <td>{new Date(income.date).toLocaleDateString('id-ID')}</td>
                  <td>{income.source}</td>
                  <td className="text-green-600 font-medium">
                    {formatCurrency(income.amount)}
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

      {/* Add Income Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

            <div className="relative bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Add New Income</h3>
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
                    value={newIncome.amount}
                    onChange={(e) => setNewIncome({ ...newIncome, amount: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="source" className="label">Source</label>
                  <input
                    type="text"
                    id="source"
                    className="input"
                    value={newIncome.source}
                    onChange={(e) => setNewIncome({ ...newIncome, source: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="category" className="label">Category</label>
                  <select
                    id="category"
                    className="input"
                    value={newIncome.category}
                    onChange={(e) => setNewIncome({ ...newIncome, category: e.target.value })}
                    required
                  >
                    <option value="">Select a category</option>
                    {incomeData.categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
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
                    value={newIncome.date}
                    onChange={(e) => setNewIncome({ ...newIncome, date: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="description" className="label">Description</label>
                  <textarea
                    id="description"
                    className="input"
                    rows="3"
                    value={newIncome.description}
                    onChange={(e) => setNewIncome({ ...newIncome, description: e.target.value })}
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
                    Add Income
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

export default IncomeManagement;
