from fastapi import Depends
from dataclasses import dataclass
from core import security
from app.auth.exceptions import *
from app.auth.models import User
from app.auth.schemas import TokenIn
from app.auth.repository import UserRepository
from app.account.repository import AccountRepository

@dataclass
class AuthService:
    user_repository: UserRepository = Depends(UserRepository)
    account_repository: AccountRepository = Depends(AccountRepository)

    def login(self, token_in: TokenIn) -> str:
        account = self.account_repository.get_by_cpf(token_in.cpf)

        # CORRECTED: The path to the password check is now account.person.user
        # We also now use the verify_password utility for better separation of concerns.
        if (
            account is None or
            account.person is None or
            account.person.user is None or
            not security.verify_password(token_in.password, account.person.user.password)
        ):
            raise InvalidCredentials()

        if not account.flActive:
            raise CantLoginInBlockedAccount()

        # The token should be created for the user ID
        token: str = security.create_token(account.person.user.id)

        account.person.user.token = token
        self.user_repository.save(account.person.user) # Save the user object, not the account

        return token

    def logout(self, user: User) -> None:
        user.token = None
        self.user_repository.save(user)