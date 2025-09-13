from fastapi import APIRouter, Depends, Query, status
from core.security import get_current_user
from app.auth.models import User
from app.account.schemas import *
from app.account.models import Account
from app.account.service import AccountService
from app.transaction.repository import TransactionRepository
from utils.schemas import PaginationResponse
from app.account.schemas import AccountMeOut # Ensure this is imported

account_router = APIRouter(tags=['Account'], prefix='/api/account')


@account_router.get('/me', response_model=AccountMeOut) # Add response_model
def get_auth_account(
    user: User = Depends(get_current_user),
    transaction_repository: TransactionRepository = Depends(TransactionRepository),
) -> AccountMeOut:
    """Endpoint to fetch the logged-in user's account data."""
    account: Account = user.person.account
    today_withdraw = transaction_repository.get_total_today_withdraw(account.id)

    # CORRECTED: Instead of a manual .to_json(), we will return the Pydantic model
    # FastAPI will handle the conversion automatically.
    return AccountMeOut(
        id=account.id,
        person=account.person,
        balance=account.balance,
        flActive=account.flActive,
        accountType=account.accountType,
        dailyWithdrawLimit=account.dailyWithdrawLimit,
        todayWithdraw=float(-(today_withdraw))
    )



@account_router.get('/')
def get_all(
    filter: AccountFilter = Query(AccountFilter),
    user: User = Depends(get_current_user),
    account_service: AccountService = Depends(AccountService),
) -> PaginationResponse[AccountOut]:
    """
    Endpoint to search for registered accounts.
    Does not include the querying user's own account.
    """
    # CORRECTED: The path to the account ID is through user.person
    return account_service.get_all(filter, user.person.account.id)


@account_router.post('/', status_code=status.HTTP_201_CREATED)
def create_account(
    account_in: AccountIn, account_service: AccountService = Depends(AccountService)
):
    """Endpoint to register a new account."""
    account = account_service.create(account_in)

    return {
        'message': 'Account registered successfully.',
        'detail': {'created_id': account.id},
    }


@account_router.put('/{id}', status_code=status.HTTP_202_ACCEPTED)
def update_account(
    id: int,
    update_account_in: UpdateAccountIn,
    user: User = Depends(get_current_user),
    account_service: AccountService = Depends(AccountService),
):
    """
    Endpoint to update an account.
    Some information, like the CPF, cannot be updated.
    Only the account owner can update the information.
    """
    account_service.update(id, update_account_in, user.id)

    return {
        'message': 'Account updated successfully.',
    }


@account_router.delete('/{id}', status_code=status.HTTP_202_ACCEPTED)
def deactivate_account(
    id: int,
    user: User = Depends(get_current_user),
    account_service: AccountService = Depends(AccountService),
):
    """
    Endpoint to deactivate an account.
    Only the account owner can perform this action.
    """
    # CORRECTED: The path to the account ID is through user.person
    account_service.deactivate(id, user.person.account.id)

    return {
        'message': 'Account blocked successfully.',
    }