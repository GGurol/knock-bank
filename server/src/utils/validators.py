from validate_docbr import CPF
from string import ascii_lowercase, ascii_uppercase, digits, punctuation


def validate_cpf(value: str) -> None:
    if CPF().validate(value) is False:
        raise ValueError('Invalid CPF.')


def validate_password(value: str) -> None:
    if len(value) < 8:
        raise ValueError('The password must contain at least 8 characters.')

    have_lower = have_upper = have_digits = have_special = False
    for char in value:
        if char in ascii_lowercase:
            have_lower = True

        if char in ascii_uppercase:
            have_upper = True

        if char in digits:
            have_digits = True

        if char in punctuation:
            have_special = True

        if have_upper and have_digits and have_lower and have_special:
            break

    else:
        if have_lower is False:
            raise ValueError('The password must contain lowercase letters.')

        if have_upper is False:
            raise ValueError('The password must contain uppercase letters.')

        if have_digits is False:
            raise ValueError('The password must contain numbers.')

        if have_special is False:
            raise ValueError('The password must contain special characters.')
