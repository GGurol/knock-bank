from fastapi import Depends
from datetime import date
from decimal import Decimal
from dataclasses import dataclass
from sqlalchemy import select, func, case, extract
from sqlalchemy.orm import Session, joinedload
from core.db import get_db
from app.transaction.models import Transaction
from app.account.models import Account
from app.transaction.enums import TransactionType
from app.transaction.schemas import TransactionMonthResumeNumericOut, TransactionFilter
from app.transaction.resumes import create_year_transaction_resume_by_month


@dataclass
class TransactionRepository:
    db: Session = Depends(get_db)

    def get_all(
        self,
        filter: TransactionFilter,
        account_id: int,
    ) -> tuple[list[Transaction], int]:
        
        # Base query to get the total count first
        count_query = select(func.count(Transaction.id)).where(Transaction.account_id == account_id)
        
        # --- THIS IS THE FIX ---
        # When filtering, we must compare against the enum's .value, not the enum object itself.
        if filter.transactionType is not None:
            count_query = count_query.where(Transaction.transaction_type == filter.transactionType.value)
        if filter.transactionDate is not None:
            count_query = count_query.where(func.date(Transaction.date_time) == filter.transactionDate)
            
        total = self.db.execute(count_query).scalar_one_or_none() or 0

        # Main query to fetch the paginated data with all relationships
        query = (
            select(Transaction)
            .options(
                joinedload(Transaction.account).joinedload(Account.person),
                joinedload(Transaction.origin_account).joinedload(Account.person)
            )
            .where(Transaction.account_id == account_id)
            .limit(filter.pageSize)
            .offset((filter.pageIndex - 1) * filter.pageSize)
            .order_by(Transaction.date_time.desc())
        )
        
        # Apply the same filters to the main data query
        if filter.transactionType is not None:
            query = query.where(Transaction.transaction_type == filter.transactionType.value)
        if filter.transactionDate is not None:
            query = query.where(func.date(Transaction.date_time) == filter.transactionDate)

        results = self.db.execute(query).scalars().all()

        return results, total

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
        month_expression = extract('month', Transaction.date_time).label('month')
        
        label_expression = case(
            (Transaction.transaction_type == TransactionType.DEPOSIT.value, 'DEPOSIT'),
            (Transaction.transaction_type == TransactionType.WITHDRAW.value, 'WITHDRAW'),
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

    def get_by_id(self, id: int) -> Transaction | None:
        query = select(Transaction).where(Transaction.id == id)
        return self.db.execute(query).scalars().first()

    def save(self, transaction: Transaction) -> Transaction:
        if transaction.id is None:
            self.db.add(transaction)

        self.db.commit()
        self.db.refresh(transaction)
        return transaction

    def save_all(self, transactions: list[Transaction]) -> None:
        self.db.add_all(transactions)
        self.db.commit()