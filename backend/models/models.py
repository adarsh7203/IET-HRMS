from sqlalchemy import Column, Integer, String, Date, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
from database import Base
import enum

class UserRole(str, enum.Enum):
    SUPER_ADMIN = "super_admin"
    HOD = "hod"
    STAFF = "staff"

class LeaveStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

class GrievanceStatus(str, enum.Enum):
    PENDING = "pending"
    RESOLVED = "resolved"

class AttendanceStatus(str, enum.Enum):
    PRESENT = "present"
    ABSENT = "absent"

class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    hod_id = Column(Integer, ForeignKey("employees.id", use_alter=True, name="fk_dept_hod"), nullable=True)

    # Relationships
    employees = relationship("Employee", back_populates="department", foreign_keys="Employee.department_id")
    hod = relationship("Employee", foreign_keys=[hod_id])

class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)  # Hashed password
    role = Column(String)  # super_admin, hod, staff
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    salary = Column(Integer, default=0)

    # Relationships
    department = relationship("Department", back_populates="employees", foreign_keys=[department_id])
    attendance = relationship("Attendance", back_populates="employee")
    leaves = relationship("Leave", back_populates="employee")
    payrolls = relationship("Payroll", back_populates="employee")
    grievances = relationship("Grievance", back_populates="employee")

class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"))
    date = Column(Date)
    status = Column(String)  # present, absent

    employee = relationship("Employee", back_populates="attendance")

class Leave(Base):
    __tablename__ = "leaves"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"))
    reason = Column(Text)
    from_date = Column(Date)
    to_date = Column(Date)
    status = Column(String, default="pending")  # pending, approved, rejected

    employee = relationship("Employee", back_populates="leaves")

class Payroll(Base):
    __tablename__ = "payroll"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"))
    month = Column(String)  # e.g., "April 2026"
    salary = Column(Integer)
    deduction = Column(Integer, default=0)
    final_salary = Column(Integer)

    employee = relationship("Employee", back_populates="payrolls")

class Grievance(Base):
    __tablename__ = "grievances"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"))
    department_id = Column(Integer, ForeignKey("departments.id"))
    issue = Column(Text)
    status = Column(String, default="pending")  # pending, resolved

    employee = relationship("Employee", back_populates="grievances")
    department = relationship("Department")
