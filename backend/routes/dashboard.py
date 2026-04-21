from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import models, schemas
from routes.auth import get_current_user
from datetime import date

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/superadmin", response_model=schemas.SuperAdminDashboard)
def get_superadmin_stats(db: Session = Depends(get_db), current_user: models.Employee = Depends(get_current_user)):
    if current_user.role != "super_admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    total_depts = db.query(models.Department).count()
    total_emps = db.query(models.Employee).count()
    total_leaves = db.query(models.Leave).filter(models.Leave.status == "pending").count()
    total_grievances = db.query(models.Grievance).filter(models.Grievance.status == "pending").count()
    
    # Calculate total payroll for current month (simplified)
    # total_payroll = db.query(func.sum(models.Payroll.final_salary)).scalar() or 0
    total_payroll = 0 # Placeholder for complex query
    
    return {
        "total_departments": total_depts,
        "total_employees": total_emps,
        "total_leaves": total_leaves,
        "total_grievances": total_grievances,
        "total_payroll": total_payroll
    }

@router.get("/hod", response_model=schemas.HODDashboard)
def get_hod_stats(db: Session = Depends(get_db), current_user: models.Employee = Depends(get_current_user)):
    if current_user.role != "hod":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    dept_id = current_user.department_id
    dept_staff = db.query(models.Employee).filter(models.Employee.department_id == dept_id).count()
    
    today = date.today()
    today_att = db.query(models.Attendance).join(models.Employee).filter(
        models.Employee.department_id == dept_id,
        models.Attendance.date == today,
        models.Attendance.status == "present"
    ).count()
    
    pending_leaves = db.query(models.Leave).join(models.Employee).filter(
        models.Employee.department_id == dept_id,
        models.Leave.status == "pending"
    ).count()
    
    open_grievances = db.query(models.Grievance).filter(
        models.Grievance.department_id == dept_id,
        models.Grievance.status == "pending"
    ).count()
    
    # Calculate Department-wide Attendance Percentage
    total_dept_records = db.query(models.Attendance).join(models.Employee).filter(
        models.Employee.department_id == dept_id
    ).count()
    
    total_dept_present = db.query(models.Attendance).join(models.Employee).filter(
        models.Employee.department_id == dept_id,
        models.Attendance.status == "present"
    ).count()
    
    dept_att_percent = (total_dept_present / total_dept_records * 100) if total_dept_records > 0 else 0
    
    return {
        "dept_staff": dept_staff,
        "today_attendance": today_att,
        "attendance_percentage": dept_att_percent,
        "pending_leaves": pending_leaves,
        "open_grievances": open_grievances
    }

@router.get("/staff", response_model=schemas.StaffDashboard)
def get_staff_stats(db: Session = Depends(get_db), current_user: models.Employee = Depends(get_current_user)):
    # Calculate attendance percentage
    total_days = db.query(models.Attendance).filter(models.Attendance.employee_id == current_user.id).count()
    present_days = db.query(models.Attendance).filter(
        models.Attendance.employee_id == current_user.id,
        models.Attendance.status == "present"
    ).count()
    
    att_percent = (present_days / total_days * 100) if total_days > 0 else 0
    
    leave_count = db.query(models.Leave).filter(models.Leave.employee_id == current_user.id).count()
    
    recent_payroll = db.query(models.Payroll).filter(
        models.Payroll.employee_id == current_user.id
    ).order_by(models.Payroll.id.desc()).first()
    
    recent_salary = recent_payroll.final_salary if recent_payroll else None
    
    return {
        "attendance_percentage": att_percent,
        "leave_history_count": leave_count,
        "recent_salary": recent_salary,
        "unread_notices": 0 # Logic for notices not implemented yet
    }
