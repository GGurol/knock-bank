from fastapi import HTTPException, status


class AccountNotFound(HTTPException):
    def __init__(self) -> None:
        """Raised when account is not found by path parameter."""
        self.detail = 'Account not found.'
        self.status_code = status.HTTP_404_NOT_FOUND


class AccountAlreadyExistsWithThisCPF(HTTPException):
    def __init__(self) -> None:
        """Raised when an account already exists with a CPF."""
        self.detail = 'This CPF already has a registered account.'
        self.status_code = status.HTTP_400_BAD_REQUEST


class AccountOwnerIsMinor(HTTPException):
    def __init__(self) -> None:
        """Raised when the account owner is underage."""
        self.detail = 'You must be of legal age to create an account.'
        self.status_code = status.HTTP_400_BAD_REQUEST


class CantUpdateAccount(HTTPException):
    def __init__(self) -> None:
        """Raised when the current user is trying to update another user account."""
        self.detail = 'You do not have permission to edit this account.'
        self.status_code = status.HTTP_403_FORBIDDEN


class CantUpdateDailyWithdrawLimit(HTTPException):
    def __init__(self) -> None:
        """Raised when an account owner tries to update the daily withdrawal limit 
        to less than what has already been withdrawn today."""
        self.detail = 'You cannot change the daily withdrawal limit to a value lower than what has already been withdrawn today.'
        self.status_code = status.HTTP_400_BAD_REQUEST


class CantBlockAccount(HTTPException):
    def __init__(self) -> None:
        """Raised when the current user is trying to block another user account."""
        self.detail = 'You do not have permission to block this account.'
        self.status_code = status.HTTP_403_FORBIDDEN
