from app.transaction.schemas import (
    TransactionMonthResumeOut,
    TransactionMonthResumeNumericOut,
)

def create_year_transaction_resume_by_month(
    data: list[TransactionMonthResumeNumericOut],
) -> list[TransactionMonthResumeOut]:
    months_map = {
        1: 'Jan', 2: 'Feb', 3: 'Mar', 4: 'Apr', 5: 'May', 6: 'Jun',
        7: 'Jul', 8: 'Aug', 9: 'Sep', 10: 'Oct', 11: 'Nov', 12: 'Dec',
    }

    # --- THIS IS THE FIX ---
    # The labels are changed to all uppercase to match the database query results.
    resume_map = {(resume.month, resume.label): resume.amount for resume in data}

    final_resume: list[TransactionMonthResumeOut] = []
    for month_num, month_name in months_map.items():
        deposit_amount = resume_map.get((month_num, 'DEPOSIT'), 0.0) # Changed to uppercase
        final_resume.append(
            TransactionMonthResumeOut(month=month_name, label='DEPOSIT', amount=deposit_amount) # Changed to uppercase
        )

        withdraw_amount = resume_map.get((month_num, 'WITHDRAW'), 0.0) # Changed to uppercase
        final_resume.append(
            TransactionMonthResumeOut(month=month_name, label='WITHDRAW', amount=withdraw_amount) # Changed to uppercase
        )

    return final_resume