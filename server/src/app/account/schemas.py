from datetime import date
from pydantic import BaseModel, Field, field_validator
from utils import validators
from utils.schemas import PaginationQuery
from app.auth.enums import AccountType


class PersonBasicOut(BaseModel):
    id: int
    name: str
    cpf: str | None = None


class PersonOut(PersonBasicOut):
    birthDate: date


class UpdateAccountIn(BaseModel):
    name: str
    birthDate: date
    # CORRECTED: Changed from int to the AccountType Enum for consistency
    accountType: AccountType
    dailyWithdrawLimit: float = Field(gt=0)


class AccountFilter(PaginationQuery):
    search: str | None = None


class AccountIn(BaseModel):
    name: str
    cpf: str
    password: str
    birthDate: date
    accountType: AccountType
    dailyWithdrawLimit: float = Field(gt=0, default=999)

    @field_validator('cpf')
    @classmethod
    def cpf_field_validator(cls, value: str) -> str:
        # This validation is currently disabled in your validators.py
        validators.validate_cpf(value)
        return value

    @field_validator('password')
    @classmethod
    def password_field_validator(cls, value: str) -> str:
        validators.validate_password(value)
        return value


class AccountOut(BaseModel):
    id: int
    flActive: bool
    person: PersonBasicOut


class AccountMeOut(BaseModel):
    id: int
    person: PersonOut
    balance: float
    flActive: bool
    # CORRECTED: Changed from int to the AccountType Enum
    accountType: AccountType
    dailyWithdrawLimit: float
    todayWithdraw: float