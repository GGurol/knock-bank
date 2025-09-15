import typing as t
from datetime import datetime, date
from pydantic import BaseModel, Field, ConfigDict, model_validator
from utils.schemas import PaginationQuery
from app.account.schemas import PersonBasicOut
from app.transaction.enums import TransactionType
from app.transaction.models import Transaction as TransactionModel # Import with an alias

class TransactionFilter(PaginationQuery):
    transactionDate: date | None = None
    transactionType: TransactionType | None = None

class MoneyIn(BaseModel):
    money: float = Field(gt=0)

class TransactionIn(MoneyIn):
    accountId: int

class TransactionTransferIn(TransactionIn):
    senderAccountId: int

class TransactionOut(BaseModel):
    # Define the final structure of our API response
    id: int
    money: float
    dateTime: datetime
    transactionType: TransactionType
    account: PersonBasicOut | None
    originAccount: PersonBasicOut | None

    model_config = ConfigDict(from_attributes=True)
    
    # --- THIS IS THE DEFINITIVE FIX ---
    # This validator runs BEFORE Pydantic tries to validate the fields.
    # It safely transforms the SQLAlchemy ORM model into a dictionary
    # that matches the structure of TransactionOut.
    @model_validator(mode='before')
    @classmethod
    def transform_db_model(cls, data: t.Any) -> t.Any:
        # Check if the incoming data is our SQLAlchemy model instance
        if isinstance(data, TransactionModel):
            # Manually build a dictionary with the correct nested data
            transformed_data = {
                'id': data.id,
                'money': data.money,
                'dateTime': data.date_time,
                'transactionType': data.transaction_type,
                'account': data.account.person if data.account and data.account.person else None,
                'originAccount': data.origin_account.person if data.origin_account and data.origin_account.person else None
            }
            return transformed_data
        # If it's not our ORM model (e.g., already a dict), let it pass through
        return data


class TransactionMonthResumeNumericOut(BaseModel):
    month: int
    label: str
    amount: float

class TransactionMonthResumeOut(BaseModel):
    month: str
    label: str
    amount: float