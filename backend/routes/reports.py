from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from database import get_db
from models import models
from routes.auth import get_current_user
from utils.pdf_generator import generate_payslip_pdf # Can reuse some PDF logic or extend
import csv
from io import StringIO, BytesIO
from datetime import date
import calendar

router = APIRouter(prefix="/api/reports", tags=["Reports"])

@router.get("/attendance/csv")
def export_attendance_csv(db: Session = Depends(get_db), current_user: models.Employee = Depends(get_current_user)):
    if current_user.role != "super_admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(["Employee Name", "Department", "Present Days", "Absent Days", "Attendance %"])

    employees = db.query(models.Employee).all()
    for emp in employees:
        attendance = db.query(models.Attendance).filter(models.Attendance.employee_id == emp.id).all()
        present = len([a for a in attendance if a.status == "present"])
        absent = len([a for a in attendance if a.status == "absent"])
        total = present + absent
        perc = (present / total * 100) if total > 0 else 0
        
        dept_name = emp.department.name if emp.department else "N/A"
        writer.writerow([emp.name, dept_name, present, absent, f"{perc:.2f}%"])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=Attendance_Summary.csv"}
    )

@router.get("/budget/pdf")
def export_budget_pdf(db: Session = Depends(get_db), current_user: models.Employee = Depends(get_current_user)):
    if current_user.role != "super_admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    # For now, let's generate a summary PDF of all payrolls
    from reportlab.lib.pagesizes import A4
    from reportlab.lib import colors
    from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
    from reportlab.lib.styles import getSampleStyleSheet

    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    elements = []
    styles = getSampleStyleSheet()

    elements.append(Paragraph("IET HRMS - Annual Budget Analysis", styles['Title']))
    elements.append(Spacer(1, 20))

    data = [["Department", "Staff Count", "Total Monthly Salary", "Total Deductions"]]
    
    depts = db.query(models.Department).all()
    total_budget = 0
    
    for d in depts:
        dept_employees = db.query(models.Employee).filter(models.Employee.department_id == d.id).all()
        emp_ids = [e.id for e in dept_employees]
        payrolls = db.query(models.Payroll).filter(models.Payroll.employee_id.in_(emp_ids)).all()
        
        sal = sum([p.salary for p in payrolls])
        ded = sum([p.deduction for p in payrolls])
        total_budget += (sal - ded)
        
        data.append([d.name, len(dept_employees), f"Rs. {sal:,}", f"Rs. {ded:,}"])

    table = Table(data, colWidths=[150, 100, 150, 100])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#1e1b4b")),
        ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0,0), (-1,0), 12),
        ('GRID', (0,0), (-1,-1), 1, colors.grey)
    ]))
    elements.append(table)
    elements.append(Spacer(1, 30))
    elements.append(Paragraph(f"Estimated Total Monthly Expenditure: Rs. {total_budget:,}", styles['Heading2']))

    doc.build(elements)
    buffer.seek(0)
    
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=Budget_Analysis.pdf"}
    )

@router.get("/turnover/excel")
def export_turnover_csv(db: Session = Depends(get_db), current_user: models.Employee = Depends(get_current_user)):
    if current_user.role != "super_admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    # Using CSV for "Excel" compatibility for now (widely accepted)
    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(["Employee ID", "Name", "Department", "Role", "Email", "Salary"])

    employees = db.query(models.Employee).all()
    for emp in employees:
        dept_name = emp.department.name if emp.department else "N/A"
        writer.writerow([emp.id, emp.name, dept_name, emp.role, emp.email, emp.salary])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=Staff_Turnover_Report.csv"}
    )
