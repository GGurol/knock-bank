import math
from fastapi import Depends
from datetime import date
from dataclasses import dataclass

# Required imports for the service
from utils.schemas import PaginationResponse
from core.security import hash_password
from app.auth.models import User
from app.auth.repository import UserRepository
from app.account.exceptions import *
from app.account.models import Account, Person
from app.account.schemas import AccountOut, AccountFilter, AccountIn, UpdateAccountIn
from app.account.repository import AccountRepository, PersonRepository
from app.transaction.repository import TransactionRepository


@dataclass
class AccountService:
    # Dependency injection for repositories
    account_repository: AccountRepository = Depends(AccountRepository)
    transaction_repository: TransactionRepository = Depends(TransactionRepository)
    user_repository: UserRepository = Depends(UserRepository)
    person_repository: PersonRepository = Depends(PersonRepository)

    def get_all(
        self, filter: AccountFilter, account_id: int
    ) -> PaginationResponse[AccountOut]:
        accounts, total = self.account_repository.get_all(filter, account_id)
        
        # Pydantic will handle the conversion automatically via the response_model in the router
        return PaginationResponse(
            data=accounts,
            total=total,
            pageIndex=filter.pageIndex,
            pageSize=filter.pageSize,
            totalPages=math.ceil(total / filter.pageSize),
        )

    def get_by_id(self, account_id: int):
        account = self.account_repository.get_by_id(account_id)
        if account is None:
            raise AccountNotFound()
        return account

    def create(self, account_in: AccountIn):
        person_age = (date.today() - account_in.birthDate).days // 365
        if person_age < 18:
            raise AccountOwnerIsMinor()

        if self.person_repository.get_by_cpf(account_in.cpf):
            raise AccountAlreadyExistsWithThisCPF()

        hashed_password = hash_password(account_in.password)
        user_to_create = User(password=hashed_password)
        created_user = self.user_repository.save(user_to_create)

        person_to_create = Person(
            name=account_in.name,
            cpf=account_in.cpf,
            birthDate=account_in.birthDate,
            user_id=created_user.id
        )
        created_person = self.person_repository.save(person_to_create)
        
        account_to_create = Account(
            accountType=account_in.accountType,
            dailyWithdrawLimit=account_in.dailyWithdrawLimit,
            person_id=created_person.id
        )
        
        return self.account_repository.save(account_to_create)

    def update(self, account_id: int, update_account_in: UpdateAccountIn, user_id: int):
        account: Account = self.get_by_id(account_id)

        # --- THIS IS THE FIX ---
        # The correct path to the user ID is through the 'person' relationship.
        if account.person.user.id != user_id:
            raise CantUpdateAccount()

        today_total_withdraw = float(
            -self.transaction_repository.get_total_today_withdraw(account.id)
        )

        if update_account_in.dailyWithdrawLimit < float(today_total_withdraw):
            raise CantUpdateDailyWithdrawLimit()

        # The 'update' method on the model needs to be defined in models.py
        # Assuming it exists and works like: account.person.name = ...
        person = account.person
        person.name = update_account_in.name
        person.birthDate = update_account_in.birthDate
        account.accountType = update_account_in.accountType
        account.dailyWithdrawLimit = update_account_in.dailyWithdrawLimit
        
        return self.account_repository.save(account)

    def deactivate(self, account_id: int, user_id: int):
        account: Account = self.account_repository.get_by_id(account_id)

        # --- THIS IS ALSO FIXED ---
        # The correct path to the user object is through 'person'.
        if account.person.user.id != user_id:
            raise CantBlockAccount()

        account.flActive = False
        account.person.user.token = None # Access the token via the correct path
        self.account_repository.save(account)