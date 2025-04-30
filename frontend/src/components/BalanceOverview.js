import React, { useState } from 'react';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const BalanceOverview = () => {
  const [timeframe, setTimeframe] = useState('monthly');

  // Sample data - replace with actual API data
  const balanceData = {
    totalIncome: 250000000,
    totalExpenses: 175000000,
    balance: 75000000,
    recentTransactions: [
      { id: 1, type: 'income', amount: 15000000, description: 'Event Sponsorship', date: '2023-08-15' },
      { id: 2, type: 'expense', amount: 8000000, description: 'Office Supplies', date: '2023-08-14' },
      { id: 3, type: 'income', amount: 25000000, description: 'Research Grant', date: '2023-08-13' },
      { id: 4, type: 'expense', amount: 12000000, description: 'Equipment', date: '2023-08-12' },
    ]
  };

  // Line chart data
  const lineChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Income',
        data: [150, 200, 175, 225, 250, 275],
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Expenses',
        data: [100, 150, 125, 175, 160, 200],
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Doughnut chart data for expense breakdown
  const doughnutChartData = {
    labels: ['RIIT', 'Internal', 'Kewirausahaan', 'Regional', 'Medvis'],
    datasets: [{
      data: [30, 20, 15, 25, 10],
      backgroundColor: [
        '#3B82F6',
        '#10B981',
        '#F59E0B',
        '#6366F1',
        '#EC4899',
      ],
    }],
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Financial Overview
        </h1>
        <div className="mt-4 md:mt-0">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="input max-w-xs"
          >
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-gradient-to-br from-green-500 to-green-600">
          <h3 className="text-lg font-semibold text-white">Total Income</h3>
          <p className="text-2xl font-bold text-white mt-2">
            {formatCurrency(balanceData.totalIncome)}
          </p>
        </div>
        <div className="card bg-gradient-to-br from-red-500 to-red-600">
          <h3 className="text-lg font-semibold text-white">Total Expenses</h3>
          <p className="text-2xl font-bold text-white mt-2">
            {formatCurrency(balanceData.totalExpenses)}
          </p>
        </div>
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600">
          <h3 className="text-lg font-semibold text-white">Current Balance</h3>
          <p className="text-2xl font-bold text-white mt-2">
            {formatCurrency(balanceData.balance)}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Income vs Expenses</h3>
          <div className="h-64">
            <Line
              data={lineChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: 'rgba(156, 163, 175, 0.1)',
                    },
                  },
                  x: {
                    grid: {
                      display: false,
                    },
                  },
                },
                plugins: {
                  legend: {
                    position: 'top',
                  },
                },
              }}
            />
          </div>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Expense Distribution</h3>
          <div className="h-64">
            <Doughnut
              data={doughnutChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right',
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Type</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {balanceData.recentTransactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td>{new Date(transaction.date).toLocaleDateString('id-ID')}</td>
                  <td>{transaction.description}</td>
                  <td>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        transaction.type === 'income'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {transaction.type === 'income' ? 'Income' : 'Expense'}
                    </span>
                  </td>
                  <td className={transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                    {formatCurrency(transaction.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BalanceOverview;
