# IET HRMS v2 - Higher Education HR Management System

A comprehensive, full-stack Human Resource Management System tailored for educational institutions. Built with a modern glassmorphism UI and a robust FastAPI backend.

## 🚀 Features

- **Multi-Role Access**: Super Admin, HOD, and Staff portals.
- **Smart Payroll**: Automated monthly salary generation with absence-based deduction logic.
- **Official Reports**: Export Attendance, Budget, and Staff data to CSV/PDF.
- **Secure Payslips**: Authenticated PDF payslip downloads for all staff.
- **Attendance Tracking**: Real-time tracking with department-wise summaries.
- **Grievance & Leave Management**: Streamlined approval workflows for administrative efficiency.

## 🛠️ Technology Stack

- **Frontend**: React.js, Vite, Lucide Icons, Vanilla CSS (Glassmorphism UI).
- **Backend**: FastAPI (Python), SQLAlchemy (ORM).
- **Database**: PostgreSQL (Hosted on Supabase).
- **Security**: JWT Authentication, Bcrypt Password Hashing.
- **PDF Engine**: ReportLab.

## 📦 Installation & Setup

### 1. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
# Create a .env file based on .env.example
uvicorn main:app --reload
```

### 2. Frontend Setup
```bash
cd frontend
npm install
# Create a .env file based on .env.example
npm run dev
```

## 🛡️ Environment Variables

Ensure you create `.env` files in both directories using the provided `.env.example` templates to secure your database credentials and API endpoints.

---
Developed for **IET Lucknow**.
