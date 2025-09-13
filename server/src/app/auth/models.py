import typing as t
from core.db import BaseModel, Long
from sqlalchemy import Column, String
from sqlalchemy.orm import Mapped, relationship

# We no longer need the TYPE_CHECKING import for Person here
# because we will use a string reference.

class User(BaseModel):
    __tablename__ = 'user'

    id: Mapped[int] = Column(Long, primary_key=True, autoincrement=True)
    password: Mapped[str] = Column(String(255), nullable=False)
    token: Mapped[str] = Column(String(255), nullable=True)
    
    # The relationship now uses the string 'Person' to avoid circular imports.
    person: Mapped['Person'] = relationship(
        'Person', 
        back_populates='user', 
        cascade='all, delete-orphan', 
        uselist=False
    )