from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routes import auth, department, employee, attendance, leave, payroll, grievance, dashboard, reports

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="IET HRMS API", description="Multi-Department HR Management System API")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(department.router)
app.include_router(employee.router)
app.include_router(attendance.router)
app.include_router(leave.router)
app.include_router(payroll.router)
app.include_router(grievance.router)
app.include_router(dashboard.router)
app.include_router(reports.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to IET HRMS API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
