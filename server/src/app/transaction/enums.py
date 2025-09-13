from enum import Enum


class TransactionType(str, Enum):
    DEPOSIT = "DEPOSIT"
    WITHDRAW = "WITHDRAW"
    
"""
    @classmethod
    def get_transaction_type(cls, transaction_type_id: int):
        for transaction_type in cls:
            if transaction_type.value[0] == transaction_type_id:
                return transaction_type

        raise ValueError('Invalid Transaction Type')
"""