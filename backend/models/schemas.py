from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import date

# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

# Employee Schemas
class EmployeeBase(BaseModel):
    name: str
    email: EmailStr
    role: str
    department_id: Optional[int] = None
    salary: int

class EmployeeCreate(EmployeeBase):
    password: str

class EmployeeUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[str] = None
    department_id: Optional[int] = None
    salary: Optional[int] = None

class EmployeeOut(EmployeeBase):
    id: int
    attendance_percentage: Optional[float] = 0.0
    leaves_left: Optional[int] = 15
    class Config:
        from_attributes = True

# Department Schemas
class DepartmentBase(BaseModel):
    name: str
    hod_id: Optional[int] = None

class DepartmentCreate(DepartmentBase):
    pass

class DepartmentOut(DepartmentBase):
    id: int
    class Config:
        from_attributes = True

# Attendance Schemas
class AttendanceBase(BaseModel):
    employee_id: int
    date: date
    status: str

class AttendanceMark(BaseModel):
    status: str # present/absent

class AttendanceOut(AttendanceBase):
    id: int
    employee_name: Optional[str] = None
    class Config:
        from_attributes = True

# Leave Schemas
class LeaveBase(BaseModel):
    reason: str
    from_date: date
    to_date: date

class LeaveApply(LeaveBase):
    pass

class LeaveOut(LeaveBase):
    id: int
    employee_id: int
    employee_name: Optional[str] = None
    status: str
    class Config:
        from_attributes = True

# Payroll Schemas
class PayrollBase(BaseModel):
    employee_id: int
    month: str
    salary: int
    deduction: int
    final_salary: int

class PayrollOut(PayrollBase):
    id: int
    class Config:
        from_attributes = True

# Grievance Schemas
class GrievanceBase(BaseModel):
    issue: str

class GrievanceCreate(GrievanceBase):
    department_id: Optional[int] = None

class GrievanceOut(GrievanceBase):
    id: int
    employee_id: int
    employee_name: Optional[str] = None
    department_id: int
    status: str
    class Config:
        from_attributes = True

# Dashboard Schemas
class SuperAdminDashboard(BaseModel):
    total_departments: int
    total_employees: int
    total_leaves: int
    total_grievances: int
    total_payroll: int

class HODDashboard(BaseModel):
    dept_staff: int
    today_attendance: int
    attendance_percentage: float
    pending_leaves: int
    open_grievances: int

class StaffDashboard(BaseModel):
    attendance_percentage: float
    leave_history_count: int
    recent_salary: Optional[int]
    unread_notices: int # Placeholder logic
