from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import models, schemas
from routes.auth import get_current_user
from typing import List

router = APIRouter(prefix="/api/grievance", tags=["Grievances"])

@router.post("/raise", response_model=schemas.GrievanceOut)
def create_grievance(g: schemas.GrievanceCreate, db: Session = Depends(get_db), current_user: models.Employee = Depends(get_current_user)):
    # Automatically use user's department if not specified
    dept_id = g.department_id if g.department_id else current_user.department_id
    
    db_g = models.Grievance(
        employee_id=current_user.id,
        department_id=dept_id,
        issue=g.issue,
        status="pending"
    )
    db.add(db_g)
    db.commit()
    db.refresh(db_g)
    return db_g

@router.get("/me", response_model=List[schemas.GrievanceOut])
def get_my_grievances(db: Session = Depends(get_db), current_user: models.Employee = Depends(get_current_user)):
    return db.query(models.Grievance).filter(models.Grievance.employee_id == current_user.id).all()

@router.get("/department/{dept_id}", response_model=List[schemas.GrievanceOut])
def get_dept_grievances(dept_id: int, db: Session = Depends(get_db), current_user: models.Employee = Depends(get_current_user)):
    if current_user.role != "super_admin" and not (current_user.role == "hod" and current_user.department_id == dept_id):
        raise HTTPException(status_code=403, detail="Not authorized")

    results = db.query(models.Grievance, models.Employee.name).join(
        models.Employee, models.Grievance.employee_id == models.Employee.id
    ).filter(models.Grievance.department_id == dept_id).all()
    
    return [
        {
            "id": g.id,
            "employee_id": g.employee_id,
            "employee_name": name,
            "department_id": g.department_id,
            "issue": g.issue,
            "status": g.status
        } for g, name in results
    ]

@router.put("/{id}/resolve", response_model=schemas.GrievanceOut)
def resolve_grievance(id: int, db: Session = Depends(get_db), current_user: models.Employee = Depends(get_current_user)):
    g = db.query(models.Grievance).filter(models.Grievance.id == id).first()
    if not g:
        raise HTTPException(status_code=404, detail="Grievance not found")
        
    if current_user.role != "super_admin" and not (current_user.role == "hod" and current_user.department_id == g.department_id):
        raise HTTPException(status_code=403, detail="Not authorized")
        
    g.status = "resolved"
    db.commit()
    db.refresh(g)
    return g
