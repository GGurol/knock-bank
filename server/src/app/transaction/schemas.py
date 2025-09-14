from datetime import datetime, date
from pydantic import BaseModel, Field, ConfigDict, model_validator, computed_field
from utils.schemas import PaginationQuery
from app.account.schemas import PersonBasicOut
from app.transaction.enums import TransactionType

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
    id: int
    money: float
    date_time: datetime
    transaction_type: TransactionType
    
    model_config = ConfigDict(from_attributes=True)

    @computed_field
    @property
    def account(self) -> PersonBasicOut | None:
        if self.account and hasattr(self.account, 'person'):
            return PersonBasicOut.model_validate(self.account.person)
        return None

    @computed_field
    @property
    def originAccount(self) -> PersonBasicOut | None:
        if self.origin_account and hasattr(self.origin_account, 'person'):
            return PersonBasicOut.model_validate(self.origin_account.person)
        return None


class TransactionMonthResumeNumericOut(BaseModel):
    month: int
    label: str
    amount: float

class TransactionMonthResumeOut(BaseModel):
    month: str
    label: str
    amount: float