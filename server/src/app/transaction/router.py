from fastapi import APIRouter, Query, Depends
from core.security import get_current_user
from app.auth.models import User
from app.transaction.schemas import *
from app.transaction.service import TransactionService
from utils.schemas import PaginationResponse

transaction_router = APIRouter(tags=['Transaction'], prefix='/api/transaction')

@transaction_router.get('/')
def get_all_transactions(
    filter: TransactionFilter = Query(TransactionFilter),
    user: User = Depends(get_current_user),
    transaction_service: TransactionService = Depends(TransactionService),
) -> PaginationResponse[TransactionOut]:
    """
    Endpoint to fetch transactions made by the user.
    Returns transactions in a paginated format.
    """
    # CORRECTED: The path to the account ID is through user.person.account
    return transaction_service.get_all(filter, user.person.account.id)

@transaction_router.get('/resume')
def get_month_transactions_resume(
    user: User = Depends(get_current_user),
    transaction_service: TransactionService = Depends(TransactionService),
) -> list[TransactionMonthResumeOut]:
    """Endpoint to fetch a summary of transactions made throughout the year."""
    # CORRECTED: The path to the account ID is through user.person.account
    return transaction_service.get_month_transactions_resume(user.person.account.id)

@transaction_router.get('/{id}', dependencies=[Depends(get_current_user)])
def detail_transaction(
    id: int, transaction_service: TransactionService = Depends(TransactionService)
) -> TransactionOut:
    """Endpoint to get the details of a specific transaction."""
    transaction = transaction_service.get_by_id(id)
    return transaction.to_json()

@transaction_router.post('/withdraw')
def withdraw_money(
    money_in: MoneyIn,
    user: User = Depends(get_current_user),
    transaction_service: TransactionService = Depends(TransactionService),
):
    """Endpoint to perform a withdrawal from the logged-in account."""
    # CORRECTED: The path to the account ID is through user.person.account
    transaction_in = TransactionIn(money=money_in.money, accountId=user.person.account.id)

    transaction_service.withdraw(transaction_in)
    return {'message': 'Withdrawal successful.'}

@transaction_router.post('/deposit')
def deposit_money(
    money_in: MoneyIn,
    user: User = Depends(get_current_user),
    transaction_service: TransactionService = Depends(TransactionService),
):
    """Endpoint to make a deposit into the logged-in account."""
    # CORRECTED: The path to the account ID is through user.person.account
    transaction_in = TransactionIn(money=money_in.money, accountId=user.person.account.id)

    transaction_service.deposit(transaction_in)
    return {'message': 'Deposit successful.'}

@transaction_router.post('/transfer')
def transfer_money(
    transaction_in: TransactionIn,
    user: User = Depends(get_current_user),
    transaction_service: TransactionService = Depends(TransactionService),
):
    """Endpoint to perform a transfer to another registered account."""
    # CORRECTED: The path to the account ID is through user.person.account
    transaction_transfer_in = TransactionTransferIn(
        money=transaction_in.money,
        accountId=transaction_in.accountId,
        senderAccountId=user.person.account.id,
    )

    transaction_service.transfer(transaction_transfer_in)
    return {'message': 'Transfer successful.'}