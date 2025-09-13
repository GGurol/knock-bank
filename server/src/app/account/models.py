import typing as t
from datetime import date
from sqlalchemy import (
    Column, String, ForeignKey, Date, Float, 
    Boolean, Enum as EnumDB
)
from sqlalchemy.orm import Mapped, relationship
from core.db import BaseModel, Long
from app.auth.enums import AccountType

# Use TYPE_CHECKING for type hints without causing import cycles at runtime.
if t.TYPE_CHECKING:
    from app.auth.models import User
    from app.transaction.models import Transaction

class Person(BaseModel):
    __tablename__ = 'person'
    
    id: Mapped[int] = Column(Long, primary_key=True, index=True)
    name: Mapped[str] = Column(String(100), nullable=False)
    cpf: Mapped[str] = Column(String(11), unique=True, index=True, nullable=False)
    birthDate: Mapped[date] = Column(Date, nullable=False)
    
    user_id: Mapped[int] = Column(Long, ForeignKey('user.id'), unique=True)
    
    # Relationships use string references to avoid circular imports.
    user: Mapped['User'] = relationship('User', back_populates='person')
    account: Mapped['Account'] = relationship(
        'Account', back_populates='person', cascade='all, delete-orphan', uselist=False
    )

class Account(BaseModel):
    __tablename__ = 'account'

    id: Mapped[int] = Column(Long, primary_key=True, index=True)
    balance: Mapped[float] = Column(Float, default=0.0)
    dailyWithdrawLimit: Mapped[float] = Column(Float, default=1000.0)
    flActive: Mapped[bool] = Column(Boolean, default=True)
    accountType: Mapped[AccountType] = Column(EnumDB(AccountType), default=AccountType.CURRENT_ACCOUNT)

    person_id: Mapped[int] = Column(Long, ForeignKey('person.id'), unique=True)
    
    person: Mapped['Person'] = relationship('Person', back_populates='account')
    
    # Relationship for transactions where this account is the primary account
    transactions: Mapped[list['Transaction']] = relationship(
        'Transaction', 
        back_populates='account',
        foreign_keys='Transaction.account_id'
    )
    
    # --- ADD THIS RELATIONSHIP ---
    # Relationship for transfers originating from this account
    originated_transactions: Mapped[list['Transaction']] = relationship(
        'Transaction', 
        back_populates='origin_account',
        foreign_keys='Transaction.origin_account_id'
    )