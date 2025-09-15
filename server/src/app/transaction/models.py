import typing as t
from decimal import Decimal
from datetime import datetime as dt
from sqlalchemy import Column, DateTime, Numeric, ForeignKey, Enum as EnumDB
from sqlalchemy.orm import Mapped, relationship
from core.db import BaseModel, Long
from app.transaction.enums import TransactionType

if t.TYPE_CHECKING:
    from app.account.models import Account

class Transaction(BaseModel):
    __tablename__ = 'transactions'
    id: Mapped[int] = Column(Long, primary_key=True, autoincrement=True)
    date_time: Mapped[dt] = Column(DateTime, nullable=False, default=dt.now)
    money: Mapped[Decimal] = Column(Numeric(10, 2), nullable=False)
    transaction_type: Mapped[TransactionType] = Column(EnumDB(TransactionType), nullable=False)
    account_id: Mapped[int] = Column(Long, ForeignKey('account.id'), nullable=False)
    origin_account_id: Mapped[int] = Column(Long, ForeignKey('account.id'), nullable=True)

    account: Mapped['Account'] = relationship(
        'Account', 
        back_populates='transactions', 
        foreign_keys=[account_id]
    )
    origin_account: Mapped['Account'] = relationship(
        'Account', 
        back_populates='originated_transactions', 
        foreign_keys=[origin_account_id]
    )

    def __init__(
        self,
        money: float,
        transaction_type: TransactionType,
        account: t.ForwardRef('Account'),
        origin_account: t.Optional[t.ForwardRef('Account')] = None,
    ) -> None:
        self.money = (
            Decimal(-abs(money))
            if transaction_type == TransactionType.WITHDRAW
            else Decimal(abs(money))
        )
        # --- THIS IS THE FIX ---
        # We assign the enum member directly. SQLAlchemy handles saving its value.
        self.transaction_type = transaction_type
        self.account_id = account.id
        self.origin_account_id = (
            origin_account.id if origin_account is not None else None
        )