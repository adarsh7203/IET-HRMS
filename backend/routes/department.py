from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import models, schemas
from routes.auth import get_current_user
from typing import List

router = APIRouter(prefix="/api/departments", tags=["Departments"])

@router.get("/", response_model=List[schemas.DepartmentOut])
def get_departments(db: Session = Depends(get_db), current_user: models.Employee = Depends(get_current_user)):
    # Super Admin can see all, HOD can see their own? User request says Super Admin creates depts.
    return db.query(models.Department).all()

@router.post("/", response_model=schemas.DepartmentOut)
def create_department(dept: schemas.DepartmentCreate, db: Session = Depends(get_db), current_user: models.Employee = Depends(get_current_user)):
    if current_user.role != "super_admin":
        raise HTTPException(status_code=403, detail="Only Super Admin can create departments")
    
    db_dept = models.Department(name=dept.name, hod_id=dept.hod_id)
    db.add(db_dept)
    db.commit()
    db.refresh(db_dept)
    return db_dept

@router.put("/{id}", response_model=schemas.DepartmentOut)
def update_department(id: int, dept: schemas.DepartmentCreate, db: Session = Depends(get_db), current_user: models.Employee = Depends(get_current_user)):
    if current_user.role != "super_admin":
        raise HTTPException(status_code=403, detail="Only Super Admin can update departments")
    
    db_dept = db.query(models.Department).filter(models.Department.id == id).first()
    if not db_dept:
        raise HTTPException(status_code=404, detail="Department not found")
    
    db_dept.name = dept.name
    db_dept.hod_id = dept.hod_id
    db.commit()
    db.refresh(db_dept)
    return db_dept

@router.delete("/{id}")
def delete_department(id: int, db: Session = Depends(get_db), current_user: models.Employee = Depends(get_current_user)):
    if current_user.role != "super_admin":
        raise HTTPException(status_code=403, detail="Only Super Admin can delete departments")
    
    db_dept = db.query(models.Department).filter(models.Department.id == id).first()
    if not db_dept:
        raise HTTPException(status_code=404, detail="Department not found")
    
    db.delete(db_dept)
    db.commit()
    return {"message": "Department deleted successfully"}
