from enum import Enum


class AccountType(Enum):
    CURRENT_ACCOUNT = "CURRENT_ACCOUNT"
    SAVING_ACCOUNT = "SAVING_ACCOUNT"
    SALARY_ACCOUNT = "SALARY_ACCOUNT"
    PAYMENT_ACCOUNT = "PAYMENT_ACCOUNT"

    @classmethod
    def get_account_type(cls, account_type_id: int):
        for account_type in cls:
            if account_type.value[0] == account_type_id:
                return account_type

        raise ValueError('Invalid Account Type.')
