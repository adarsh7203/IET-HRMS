from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from database import get_db
from models import models, schemas
from utils import jwt as jwt_utils
from datetime import timedelta

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    payload = jwt_utils.decode_access_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    email: str = payload.get("sub")
    if email is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    
    user = db.query(models.Employee).filter(models.Employee.email == email).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user

@router.post("/register", response_model=schemas.EmployeeOut)
def register(user_in: schemas.EmployeeCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(models.Employee).filter(models.Employee.email == user_in.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = jwt_utils.get_password_hash(user_in.password)
    db_user = models.Employee(
        name=user_in.name,
        email=user_in.email,
        password=hashed_password,
        role=user_in.role,
        department_id=user_in.department_id,
        salary=user_in.salary
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.post("/login", response_model=schemas.Token)
def login(user_in: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.Employee).filter(models.Employee.email == user_in.email).first()
    if not user or not jwt_utils.verify_password(user_in.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=jwt_utils.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = jwt_utils.create_access_token(
        data={"sub": user.email, "role": user.role}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=schemas.EmployeeOut)
def read_users_me(current_user: models.Employee = Depends(get_current_user)):
    return current_user

@router.post("/logout")
def logout():
    # In JWT, logout is usually handled client-side by deleting the token.
    # We can just return a success message.
    return {"message": "Successfully logged out"}
