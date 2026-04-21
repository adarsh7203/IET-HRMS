from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import models, schemas
from routes.auth import get_current_user
from datetime import date
from typing import List

router = APIRouter(prefix="/api/attendance", tags=["Attendance"])

@router.post("/mark", response_model=schemas.AttendanceOut)
def mark_attendance(att: schemas.AttendanceMark, db: Session = Depends(get_db), current_user: models.Employee = Depends(get_current_user)):
    # Check if attendance already marked for today
    today = date.today()
    existing = db.query(models.Attendance).filter(
        models.Attendance.employee_id == current_user.id,
        models.Attendance.date == today
    ).first()
    
    if existing:
        existing.status = att.status
        db.commit()
        db.refresh(existing)
        return existing
    
    db_att = models.Attendance(
        employee_id=current_user.id,
        date=today,
        status=att.status
    )
    db.add(db_att)
    db.commit()
    db.refresh(db_att)
    return db_att

@router.get("/me", response_model=List[schemas.AttendanceOut])
def get_my_attendance(db: Session = Depends(get_db), current_user: models.Employee = Depends(get_current_user)):
    return db.query(models.Attendance).filter(models.Attendance.employee_id == current_user.id).all()

@router.get("/department/{dept_id}", response_model=List[schemas.AttendanceOut])
def get_dept_attendance(dept_id: int, db: Session = Depends(get_db), current_user: models.Employee = Depends(get_current_user)):
    if current_user.role != "super_admin" and not (current_user.role == "hod" and current_user.department_id == dept_id):
        raise HTTPException(status_code=403, detail="Not authorized")

    results = db.query(models.Attendance, models.Employee.name).join(
        models.Employee, models.Attendance.employee_id == models.Employee.id
    ).filter(models.Employee.department_id == dept_id).all()
    
    return [
        {
            "id": a.id,
            "employee_id": a.employee_id,
            "date": a.date,
            "status": a.status,
            "employee_name": name
        } for a, name in results
    ]

@router.get("/monthly/{employee_id}", response_model=List[schemas.AttendanceOut])
def get_monthly_attendance(employee_id: int, month: int, year: int, db: Session = Depends(get_db), current_user: models.Employee = Depends(get_current_user)):
    # Simple month filtering
    # In a real app, you'd use extract(month from date)
    attendance = db.query(models.Attendance).filter(
        models.Attendance.employee_id == employee_id
    ).all()
    
    # Filter by month and year in Python for simplicity here, or use SQLAlchemy's extract
    filtered = [a for a in attendance if a.date.month == month and a.date.year == year]
    return filtered
