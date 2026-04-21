from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import models, schemas
from routes.auth import get_current_user
from fastapi.responses import StreamingResponse
from utils import payroll as payroll_utils
from utils.pdf_generator import generate_payslip_pdf
from typing import List
from datetime import date
import calendar

router = APIRouter(prefix="/api/payroll", tags=["Payroll"])

@router.post("/bulk-generate", response_model=List[schemas.PayrollOut])
def bulk_generate_payroll(month_str: str, db: Session = Depends(get_db), current_user: models.Employee = Depends(get_current_user)):
    if current_user.role != "super_admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    try:
        m_name, year = month_str.split()
        month = list(calendar.month_name).index(m_name)
        year = int(year)
    except:
        raise HTTPException(status_code=400, detail="Invalid month format. Use 'Month Year'")

    num_days = calendar.monthrange(year, month)[1]
    employees = db.query(models.Employee).all()
    results = []

    for employee in employees:
        # Calculate days explicitly marked as 'absent'
        attendance = db.query(models.Attendance).filter(
            models.Attendance.employee_id == employee.id,
            models.Attendance.status == "absent"
        ).all()
        
        absent_days = len([a for a in attendance if a.date.month == month and a.date.year == year])
        
        # Calculate salary logic based on absences
        base_salary, deduction, final_salary = payroll_utils.calculate_payroll(
            employee.salary, num_days, absent_days
        )
        
        existing = db.query(models.Payroll).filter(
            models.Payroll.employee_id == employee.id,
            models.Payroll.month == month_str
        ).first()
        
        if existing:
            existing.salary = base_salary
            existing.deduction = deduction
            existing.final_salary = final_salary
            results.append(existing)
        else:
            db_payroll = models.Payroll(
                employee_id=employee.id,
                month=month_str,
                salary=base_salary,
                deduction=deduction,
                final_salary=final_salary
            )
            db.add(db_payroll)
            results.append(db_payroll)
            
    db.commit()
    for r in results: db.refresh(r)
    return results

@router.get("/month/{month_str}", response_model=List[schemas.PayrollOut])
def get_payroll_by_month(month_str: str, db: Session = Depends(get_db), current_user: models.Employee = Depends(get_current_user)):
    if current_user.role != "super_admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    return db.query(models.Payroll).filter(models.Payroll.month == month_str).all()

@router.post("/generate/{employee_id}", response_model=schemas.PayrollOut)
def generate_payroll(employee_id: int, month: int, year: int, db: Session = Depends(get_db), current_user: models.Employee = Depends(get_current_user)):
    if current_user.role not in ["super_admin", "hod"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    employee = db.query(models.Employee).filter(models.Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
        
    if current_user.role == "hod" and employee.department_id != current_user.department_id:
        raise HTTPException(status_code=403, detail="Not authorized for this department")

    # Calculate days absent
    num_days = calendar.monthrange(year, month)[1]
    attendance = db.query(models.Attendance).filter(
        models.Attendance.employee_id == employee_id,
        models.Attendance.status == "absent"
    ).all()
    
    absent_days = len([a for a in attendance if a.date.month == month and a.date.year == year])
    
    base_salary, deduction, final_salary = payroll_utils.calculate_payroll(
        employee.salary, num_days, absent_days
    )
    
    month_name = f"{calendar.month_name[month]} {year}"
    
    # Check if payroll already exists
    existing = db.query(models.Payroll).filter(
        models.Payroll.employee_id == employee_id,
        models.Payroll.month == month_name
    ).first()
    
    if existing:
        existing.salary = base_salary
        existing.deduction = deduction
        existing.final_salary = final_salary
        db.commit()
        db.refresh(existing)
        return existing

    db_payroll = models.Payroll(
        employee_id=employee_id,
        month=month_name,
        salary=base_salary,
        deduction=deduction,
        final_salary=final_salary
    )
    db.add(db_payroll)
    db.commit()
    db.refresh(db_payroll)
    return db_payroll

@router.get("/me", response_model=List[schemas.PayrollOut])
def get_my_payroll(db: Session = Depends(get_db), current_user: models.Employee = Depends(get_current_user)):
    return db.query(models.Payroll).filter(models.Payroll.employee_id == current_user.id).all()

@router.get("/{employee_id}", response_model=List[schemas.PayrollOut])
def get_employee_payroll(employee_id: int, db: Session = Depends(get_db), current_user: models.Employee = Depends(get_current_user)):
    if current_user.role not in ["super_admin", "hod"] and current_user.id != employee_id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    return db.query(models.Payroll).filter(models.Payroll.employee_id == employee_id).all()

@router.get("/slip/{id}", response_model=schemas.PayrollOut)
def get_payroll_slip(id: int, db: Session = Depends(get_db), current_user: models.Employee = Depends(get_current_user)):
    payroll = db.query(models.Payroll).filter(models.Payroll.id == id).first()
    if not payroll:
        raise HTTPException(status_code=404, detail="Payroll slip not found")
        
    if current_user.role not in ["super_admin", "hod"] and current_user.id != payroll.employee_id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    return payroll

@router.get("/download/{id}")
def download_payslip(id: int, db: Session = Depends(get_db), current_user: models.Employee = Depends(get_current_user)):
    payroll = db.query(models.Payroll).filter(models.Payroll.id == id).first()
    if not payroll:
        raise HTTPException(status_code=404, detail="Payroll record not found")
        
    if current_user.role not in ["super_admin", "hod"] and current_user.id != payroll.employee_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    employee = db.query(models.Employee).filter(models.Employee.id == payroll.employee_id).first()
    dept_name = employee.department.name if employee.department else "General"

    pdf_buffer = generate_payslip_pdf(
        employee_name=employee.name,
        employee_id=employee.id,
        department=dept_name,
        month=payroll.month,
        base_salary=payroll.salary,
        deduction=payroll.deduction,
        final_salary=payroll.final_salary
    )
    
    filename = f"Payslip_{employee.name.replace(' ', '_')}_{payroll.month.replace(' ', '_')}.pdf"
    
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
