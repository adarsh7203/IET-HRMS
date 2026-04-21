def calculate_payroll(base_salary: int, total_days_in_month: int, absent_days: int):
    """
    Fair payroll logic:
    - Only deduct for days explicitly marked as 'absent'.
    - Sundays, holidays, and unrecorded days are paid by default.
    """
    if total_days_in_month == 0:
        return 0, 0, 0
        
    daily_rate = base_salary / 30 # Standard month divisor
    deduction = int(daily_rate * absent_days)
    final_salary = base_salary - deduction
    
    return base_salary, deduction, max(0, final_salary)
