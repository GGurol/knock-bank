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
        accounts = [
            AccountOut(**account.to_json(mask_cpf=True)) for account in accounts
        ]

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

    # --- CORRECTED CREATE FUNCTION ---
    def create(self, account_in: AccountIn):
        # 1. Check the person's age
        person_age = (date.today() - account_in.birthDate).days // 365
        if person_age < 18:
            raise AccountOwnerIsMinor()

        # 2. Check if a person with this CPF already exists
        if self.person_repository.get_by_cpf(account_in.cpf):
            raise AccountAlreadyExistsWithThisCPF()

        # 3. Hash the password and create a new User
        hashed_password = hash_password(account_in.password)
        user_to_create = User(password=hashed_password)
        created_user = self.user_repository.save(user_to_create)

        # 4. Create a new Person and link it to the User
        person_to_create = Person(
            name=account_in.name,
            cpf=account_in.cpf,
            birthDate=account_in.birthDate,
            user_id=created_user.id
        )
        created_person = self.person_repository.save(person_to_create)
        
        # 5. Create a new Account and link it to the Person
        account_to_create = Account(
            accountType=account_in.accountType,
            dailyWithdrawLimit=account_in.dailyWithdrawLimit,
            person_id=created_person.id
        )
        
        # 6. Save and return the new Account
        return self.account_repository.save(account_to_create)

    def update(self, account_id: int, update_account_in: UpdateAccountIn, user_id: int):
        account: Account = self.get_by_id(account_id)

        if account.user.id != user_id:
            raise CantUpdateAccount()

        today_total_withdraw = float(
            -self.transaction_repository.get_total_today_withdraw(account.id)
        )

        if update_account_in.dailyWithdrawLimit < float(today_total_withdraw):
            raise CantUpdateDailyWithdrawLimit()

        account.update(update_account_in)
        return self.account_repository.save(account)

    def deactivate(self, account_id: int, user_id: int):
        account: Account = self.account_repository.get_by_id(account_id)

        if account.user.id != user_id:
            raise CantBlockAccount()

        account.fl_active = False
        account.user.token = None
        self.account_repository.save(account)