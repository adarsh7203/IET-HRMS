from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import models, schemas
from routes.auth import get_current_user
from utils import jwt as jwt_utils
from typing import List

router = APIRouter(prefix="/api/employees", tags=["Employees"])

@router.get("/", response_model=List[schemas.EmployeeOut])
def get_employees(db: Session = Depends(get_db), current_user: models.Employee = Depends(get_current_user)):
    if current_user.role == "super_admin":
        employees = db.query(models.Employee).all()
    elif current_user.role == "hod":
        employees = db.query(models.Employee).filter(models.Employee.department_id == current_user.department_id).all()
    else:
        raise HTTPException(status_code=403, detail="Not authorized to view all employees")
        
    for emp in employees:
        total = db.query(models.Attendance).filter(models.Attendance.employee_id == emp.id).count()
        present = db.query(models.Attendance).filter(models.Attendance.employee_id == emp.id, models.Attendance.status == "present").count()
        emp.attendance_percentage = (present / total * 100) if total > 0 else 0
        
        approved_leaves = db.query(models.Leave).filter(models.Leave.employee_id == emp.id, models.Leave.status == "approved").count()
        emp.leaves_left = max(0, 15 - approved_leaves)
        
    return employees

@router.get("/{id}", response_model=schemas.EmployeeOut)
def get_employee(id: int, db: Session = Depends(get_db), current_user: models.Employee = Depends(get_current_user)):
    employee = db.query(models.Employee).filter(models.Employee.id == id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    # Auth check
    if current_user.role == "super_admin" or current_user.id == id or (current_user.role == "hod" and employee.department_id == current_user.department_id):
        total = db.query(models.Attendance).filter(models.Attendance.employee_id == id).count()
        present = db.query(models.Attendance).filter(models.Attendance.employee_id == id, models.Attendance.status == "present").count()
        employee.attendance_percentage = (present / total * 100) if total > 0 else 0
        
        approved_leaves = db.query(models.Leave).filter(models.Leave.employee_id == id, models.Leave.status == "approved").count()
        employee.leaves_left = max(0, 15 - approved_leaves)
        
        return employee
        
    raise HTTPException(status_code=403, detail="Not authorized")

@router.post("/", response_model=schemas.EmployeeOut)
def create_employee(emp: schemas.EmployeeCreate, db: Session = Depends(get_db), current_user: models.Employee = Depends(get_current_user)):
    if current_user.role not in ["super_admin", "hod"]:
        raise HTTPException(status_code=403, detail="Not authorized to create employees")
    
    # HOD can only create employees for their own department
    if current_user.role == "hod" and emp.department_id != current_user.department_id:
        raise HTTPException(status_code=403, detail="HOD can only create employees for their department")

    existing_user = db.query(models.Employee).filter(models.Employee.email == emp.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    hashed_password = jwt_utils.get_password_hash(emp.password)
    db_emp = models.Employee(
        name=emp.name,
        email=emp.email,
        password=hashed_password,
        role=emp.role,
        department_id=emp.department_id,
        salary=emp.salary
    )
    db.add(db_emp)
    db.commit()
    db.refresh(db_emp)
    return db_emp

@router.put("/{id}", response_model=schemas.EmployeeOut)
def update_employee(id: int, emp: schemas.EmployeeUpdate, db: Session = Depends(get_db), current_user: models.Employee = Depends(get_current_user)):
    db_emp = db.query(models.Employee).filter(models.Employee.id == id).first()
    if not db_emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    # Auth check
    if current_user.role != "super_admin" and not (current_user.role == "hod" and db_emp.department_id == current_user.department_id) and current_user.id != id:
        raise HTTPException(status_code=403, detail="Not authorized")

    update_data = emp.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_emp, key, value)
    
    db.commit()
    db.refresh(db_emp)
    return db_emp

@router.delete("/{id}")
def delete_employee(id: int, db: Session = Depends(get_db), current_user: models.Employee = Depends(get_current_user)):
    if current_user.role != "super_admin":
        raise HTTPException(status_code=403, detail="Only Super Admin can delete employees")
        
    db_emp = db.query(models.Employee).filter(models.Employee.id == id).first()
    if not db_emp:
        raise HTTPException(status_code=404, detail="Employee not found")
        
    db.delete(db_emp)
    db.commit()
    return {"message": "Employee deleted successfully"}

@router.get("/department/{dept_id}", response_model=List[schemas.EmployeeOut])
def get_employees_by_department(dept_id: int, db: Session = Depends(get_db), current_user: models.Employee = Depends(get_current_user)):
    if current_user.role == "super_admin" or (current_user.role == "hod" and current_user.department_id == dept_id):
        employees = db.query(models.Employee).filter(models.Employee.department_id == dept_id).all()
        for emp in employees:
            total = db.query(models.Attendance).filter(models.Attendance.employee_id == emp.id).count()
            present = db.query(models.Attendance).filter(models.Attendance.employee_id == emp.id, models.Attendance.status == "present").count()
            emp.attendance_percentage = (present / total * 100) if total > 0 else 0
            
            approved_leaves = db.query(models.Leave).filter(models.Leave.employee_id == emp.id, models.Leave.status == "approved").count()
            emp.leaves_left = max(0, 15 - approved_leaves)
        return employees
    
    raise HTTPException(status_code=403, detail="Not authorized")
