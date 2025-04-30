import React, { useState } from 'react';

const FinancialReports = () => {
  const [reportParams, setReportParams] = useState({
    startDate: '',
    endDate: '',
    type: 'all',
    department: 'all',
    format: 'pdf'
  });
  const [isGenerating, setIsGenerating] = useState(false);

  // Sample data - replace with actual API data
  const departments = ['All', 'RIIT', 'Internal', 'Kewirausahaan', 'Regional', 'Medvis'];
  const reportTypes = [
    { value: 'all', label: 'Complete Financial Report' },
    { value: 'income', label: 'Income Report' },
    { value: 'expense', label: 'Expense Report' },
    { value: 'budget', label: 'Budget Analysis' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Generating report with params:', reportParams);
      
      // Handle report generation and download here
      // For now, just log the parameters
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Financial Reports
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Generate detailed financial reports with custom parameters
        </p>
      </div>

      {/* Report Generation Form */}
      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date Range */}
            <div>
              <label htmlFor="startDate" className="label">Start Date</label>
              <input
                type="date"
                id="startDate"
                className="input"
                value={reportParams.startDate}
                onChange={(e) => setReportParams({ ...reportParams, startDate: e.target.value })}
                required
              />
            </div>
            <div>
              <label htmlFor="endDate" className="label">End Date</label>
              <input
                type="date"
                id="endDate"
                className="input"
                value={reportParams.endDate}
                onChange={(e) => setReportParams({ ...reportParams, endDate: e.target.value })}
                required
              />
            </div>

            {/* Report Type */}
            <div>
              <label htmlFor="type" className="label">Report Type</label>
              <select
                id="type"
                className="input"
                value={reportParams.type}
                onChange={(e) => setReportParams({ ...reportParams, type: e.target.value })}
              >
                {reportTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Department */}
            <div>
              <label htmlFor="department" className="label">Department</label>
              <select
                id="department"
                className="input"
                value={reportParams.department}
                onChange={(e) => setReportParams({ ...reportParams, department: e.target.value })}
              >
                {departments.map((dept) => (
                  <option key={dept.toLowerCase()} value={dept.toLowerCase()}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Format Selection */}
            <div>
              <label htmlFor="format" className="label">Report Format</label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio text-primary-600"
                    name="format"
                    value="pdf"
                    checked={reportParams.format === 'pdf'}
                    onChange={(e) => setReportParams({ ...reportParams, format: e.target.value })}
                  />
                  <span className="ml-2">PDF</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio text-primary-600"
                    name="format"
                    value="csv"
                    checked={reportParams.format === 'csv'}
                    onChange={(e) => setReportParams({ ...reportParams, format: e.target.value })}
                  />
                  <span className="ml-2">CSV</span>
                </label>
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isGenerating}
              className={`btn-primary ${isGenerating ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {isGenerating ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Generating Report...
                </>
              ) : (
                <>
                  <i className="fas fa-file-download mr-2"></i>
                  Generate Report
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Recent Reports */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Recent Reports</h3>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Date Generated</th>
                <th>Report Type</th>
                <th>Department</th>
                <th>Format</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* Sample data - replace with actual reports */}
              <tr>
                <td>2023-08-15</td>
                <td>Complete Financial Report</td>
                <td>All Departments</td>
                <td>PDF</td>
                <td>
                  <button className="text-primary-600 hover:text-primary-700 mr-3">
                    <i className="fas fa-download"></i>
                  </button>
                  <button className="text-red-600 hover:text-red-700">
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </td>
              </tr>
              <tr>
                <td>2023-08-14</td>
                <td>Expense Report</td>
                <td>RIIT</td>
                <td>CSV</td>
                <td>
                  <button className="text-primary-600 hover:text-primary-700 mr-3">
                    <i className="fas fa-download"></i>
                  </button>
                  <button className="text-red-600 hover:text-red-700">
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Report Templates */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reportTypes.map((type) => (
          <div key={type.value} className="card hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <i className="fas fa-file-alt text-2xl text-primary-600 mr-3"></i>
                <h3 className="text-lg font-semibold">{type.label}</h3>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Generate a detailed {type.label.toLowerCase()} with customizable parameters and instant download.
            </p>
            <button
              onClick={() => setReportParams({ ...reportParams, type: type.value })}
              className="btn-secondary w-full"
            >
              Use Template
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FinancialReports;
