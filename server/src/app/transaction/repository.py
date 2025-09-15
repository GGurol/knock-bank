from fastapi import Depends
from datetime import date
from decimal import Decimal
from dataclasses import dataclass
from sqlalchemy import text, select, func, case, extract
from sqlalchemy.orm import Session
from core.db import get_db
from app.transaction.models import Transaction
from app.transaction.enums import TransactionType
from app.transaction.schemas import TransactionMonthResumeNumericOut, TransactionFilter
from app.transaction.resumes import create_year_transaction_resume_by_month


@dataclass
class TransactionRepository:
    db: Session = Depends(get_db)

    # ... (get_all and get_total_today_withdraw functions remain the same) ...
    def get_all(
        self,
        filter: TransactionFilter,
        account_id: int,
    ) -> tuple[list[Transaction], int]:
        query = (
            select(Transaction, func.count(Transaction.id).over().label('total'))
            .where(Transaction.account_id == account_id)
            .limit(filter.pageSize)
            .offset(
                filter.pageIndex - 1
                if filter.pageIndex == 1
                else (filter.pageIndex - 1) * filter.pageSize
            )
            .order_by(Transaction.date_time.desc())
        )

        if filter.transactionType is not None:
            query = query.where(Transaction.transaction_type == filter.transactionType)

        if filter.transactionDate is not None:
            query = query.where(
                func.date(Transaction.date_time) == filter.transactionDate
            )

        results = self.db.execute(query).all()

        data = [result[0] for result in results]
        total = results[0]._asdict().get('total') if len(results) > 0 else 0

        return data, total

    def get_total_today_withdraw(self, account_id: int) -> Decimal:
        query = (
            select(func.sum(Transaction.money))
            .where(Transaction.account_id == account_id)
            .where(func.date(Transaction.date_time) == (date.today()))
            .where(Transaction.transaction_type == TransactionType.WITHDRAW)
        )
        total = self.db.execute(query).scalars().first()
        return total if total is not None else Decimal(0)

    def get_this_year_transactions(self, account_id: int):
        # --- THIS IS THE FIX ---
        # The labels in the CASE statement are changed to all uppercase
        # to match what is stored in the database.
        
        month_expression = extract('month', Transaction.date_time).label('month')
        
        label_expression = case(
            (Transaction.transaction_type == TransactionType.DEPOSIT.value, 'DEPOSIT'), # Changed to uppercase
            (Transaction.transaction_type == TransactionType.WITHDRAW.value, 'WITHDRAW'), # Changed to uppercase
        ).label('label')

        query = (
            select(
                month_expression,
                label_expression,
                func.sum(func.abs(Transaction.money)).label('amount')
            )
            .where(Transaction.account_id == account_id)
            .where(extract('year', Transaction.date_time) == date.today().year)
            .group_by(month_expression, label_expression)
            .order_by(month_expression, label_expression)
        )

        data = self.db.execute(query).all()
        data = [TransactionMonthResumeNumericOut(**row._asdict()) for row in data]
        return create_year_transaction_resume_by_month(data)

    # ... (get_by_id, save, and save_all functions remain the same) ...
    def get_by_id(self, id: int) -> Transaction | None:
        query = select(Transaction).where(Transaction.id == id)
        return self.db.execute(query).scalars().first()

    def save(self, transaction: Transaction) -> Transaction:
        if transaction.id is None:
            self.db.add(transaction)

        self.db.commit()
        return transaction

    def save_all(self, transactions: list[Transaction]) -> None:
        self.db.add_all(transactions)
        self.db.commit()