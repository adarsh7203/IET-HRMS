from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import models, schemas
from routes.auth import get_current_user
from typing import List

router = APIRouter(prefix="/api/leaves", tags=["Leaves"])

@router.post("/apply", response_model=schemas.LeaveOut)
def apply_leave(leave_in: schemas.LeaveApply, db: Session = Depends(get_db), current_user: models.Employee = Depends(get_current_user)):
    db_leave = models.Leave(
        employee_id=current_user.id,
        reason=leave_in.reason,
        from_date=leave_in.from_date,
        to_date=leave_in.to_date,
        status="pending"
    )
    db.add(db_leave)
    db.commit()
    db.refresh(db_leave)
    return db_leave

@router.get("/me", response_model=List[schemas.LeaveOut])
def get_my_leaves(db: Session = Depends(get_db), current_user: models.Employee = Depends(get_current_user)):
    return db.query(models.Leave).filter(models.Leave.employee_id == current_user.id).all()

@router.get("/department/{dept_id}", response_model=List[schemas.LeaveOut])
def get_department_leaves(dept_id: int, db: Session = Depends(get_db), current_user: models.Employee = Depends(get_current_user)):
    if current_user.role != "super_admin" and not (current_user.role == "hod" and current_user.department_id == dept_id):
        raise HTTPException(status_code=403, detail="Not authorized")

    results = db.query(models.Leave, models.Employee.name).join(
        models.Employee, models.Leave.employee_id == models.Employee.id
    ).filter(models.Employee.department_id == dept_id).all()
    
    return [
        {
            "id": l.id,
            "employee_id": l.employee_id,
            "employee_name": name,
            "reason": l.reason,
            "from_date": l.from_date,
            "to_date": l.to_date,
            "status": l.status
        } for l, name in results
    ]

@router.put("/{id}/approve", response_model=schemas.LeaveOut)
def approve_leave(id: int, db: Session = Depends(get_db), current_user: models.Employee = Depends(get_current_user)):
    leave = db.query(models.Leave).filter(models.Leave.id == id).first()
    if not leave:
        raise HTTPException(status_code=404, detail="Leave not found")
    
    employee = db.query(models.Employee).filter(models.Employee.id == leave.employee_id).first()
    
    if current_user.role != "super_admin" and not (current_user.role == "hod" and current_user.department_id == employee.department_id):
        raise HTTPException(status_code=403, detail="Not authorized to approve this leave")
    
    leave.status = "approved"
    db.commit()
    db.refresh(leave)
    return leave

@router.put("/{id}/reject", response_model=schemas.LeaveOut)
def reject_leave(id: int, db: Session = Depends(get_db), current_user: models.Employee = Depends(get_current_user)):
    leave = db.query(models.Leave).filter(models.Leave.id == id).first()
    if not leave:
        raise HTTPException(status_code=404, detail="Leave not found")
    
    employee = db.query(models.Employee).filter(models.Employee.id == leave.employee_id).first()
    
    if current_user.role != "super_admin" and not (current_user.role == "hod" and current_user.department_id == employee.department_id):
        raise HTTPException(status_code=403, detail="Not authorized to reject this leave")
    
    leave.status = "rejected"
    db.commit()
    db.refresh(leave)
    return leave
