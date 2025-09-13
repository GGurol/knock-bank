from datetime import datetime, date
from pydantic import BaseModel, Field, ConfigDict, model_validator
from utils.schemas import PaginationQuery
from app.account.schemas import PersonBasicOut
from app.transaction.enums import TransactionType # 1. Import the Enum

class TransactionFilter(PaginationQuery):
    transactionDate: date | None = None
    # 2. Use the Enum for type safety
    transactionType: TransactionType | None = None


class MoneyIn(BaseModel):
    money: float = Field(gt=0)


class TransactionIn(MoneyIn):
    accountId: int


class TransactionTransferIn(TransactionIn):
    senderAccountId: int


class TransactionOut(BaseModel):
    id: int
    money: float
    dateTime: datetime = Field(alias='date_time')
    transactionType: TransactionType = Field(alias='transaction_type')
    account: PersonBasicOut | None = None
    originAccount: PersonBasicOut | None = Field(alias='origin_account')
    
    model_config = ConfigDict(from_attributes=True)
    
    @model_validator(mode='before')
    @classmethod
    def get_person_from_account(cls, data):
        # This validator intercepts the raw database object before validation.
        # It replaces the 'account' attribute (an Account object)
        # with the 'person' attribute from that account object.
        if hasattr(data, 'account') and hasattr(data.account, 'person'):
            data.account = data.account.person
        if hasattr(data, 'origin_account') and data.origin_account and hasattr(data.origin_account, 'person'):
            data.origin_account = data.origin_account.person
        return data


class TransactionMonthResumeNumericOut(BaseModel):
    month: int
    label: str
    amount: float


class TransactionMonthResumeOut(BaseModel):
    month: str
    label: str
    amount: float