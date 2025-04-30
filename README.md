# APMI Financial Management Dashboard

A comprehensive financial management system for the Indonesian Young Researchers Association (Asosiasi Peneliti Muda Indonesia) that includes features for managing income, expenses, budgets, and generating financial reports.

## Features

- **Modern, Responsive UI**: Built with React and Tailwind CSS
- **Dark/Light Mode**: Toggle between dark and light themes
- **Comprehensive Financial Management**:
  - Income tracking and categorization
  - Expense management with receipt uploads
  - Department-wise budget allocation and tracking
  - Financial report generation (CSV/PDF)
- **Data Visualization**: Interactive charts and graphs
- **Secure Authentication**: JWT-based authentication system
- **Database**: SQLite for reliable data storage

## Tech Stack

### Frontend
- React.js
- Tailwind CSS
- Chart.js
- Axios for API communication
- Font Awesome icons

### Backend
- Node.js
- Express.js
- SQLite3
- JWT for authentication
- Multer for file uploads

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn package manager

## Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd apmi-finance-dashboard
\`\`\`

2. Install backend dependencies:
\`\`\`bash
cd backend
npm install
\`\`\`

3. Install frontend dependencies:
\`\`\`bash
cd frontend
npm install
\`\`\`

4. Configure environment variables:
   - Copy `.env.example` to `.env` in the backend directory
   - Update the values according to your setup

5. Create admin user:
```bash
cd backend
npm run create-admin
```
This will create an admin user with the following credentials:
- Username: admin@apmi.org
- Password: Admin@APMI2023

**Important**: Change the password after first login!

## Running the Application

1. Start the backend server:
\`\`\`bash
cd backend
npm run dev
\`\`\`

2. Start the frontend development server:
\`\`\`bash
cd frontend
npm start
\`\`\`

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## API Endpoints

### Authentication
- POST /api/auth/login - User login
- POST /api/auth/register - Register new user (admin only)

### Income Management
- GET /api/income - Get all income records
- POST /api/income - Add new income
- PUT /api/income/:id - Update income record
- DELETE /api/income/:id - Delete income record

### Expense Management
- GET /api/expenses - Get all expenses
- POST /api/expenses - Add new expense with receipt
- PUT /api/expenses/:id - Update expense
- DELETE /api/expenses/:id - Delete expense

### Budget Management
- GET /api/budget - Get all department budgets
- POST /api/budget - Set/update department budget
- GET /api/budget/overview - Get budget overview with analytics
- GET /api/budget/alerts - Get budget alerts

### Reports
- GET /api/reports/generate - Generate financial report
- GET /api/reports/recent - Get recent reports

## Project Structure

\`\`\`
apmi-finance-dashboard/
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── services/
│       └── App.js
├── backend/
│   ├── routes/
│   ├── middleware/
│   ├── data/
│   └── server.js
└── README.md
\`\`\`

## Security Features

- JWT-based authentication
- Password hashing
- Input validation
- File upload restrictions
- Error handling
- CORS protection

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@apmi.org or create an issue in the repository.
