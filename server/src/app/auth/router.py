from fastapi import APIRouter, Depends
from core.security import get_current_user
from app.auth.schemas import TokenIn, TokenOut
from app.auth.models import User
from app.auth.service import AuthService


auth_router = APIRouter(tags=['Auth'], prefix='/api')


@auth_router.post('/login')
def login(
    token_in: TokenIn, auth_service: AuthService = Depends(AuthService)
) -> TokenOut:
    """
    Endpoint to perform the login.
    Receives the account owner's cpf and the access password.
    Returns the JWT token.
    """
    token: str = auth_service.login(token_in)
    return TokenOut(accessToken=token)


@auth_router.delete('/logout')
def logout(
    user: User = Depends(get_current_user),
    auth_service: AuthService = Depends(AuthService),
):
    """
    Endpoint for logging out the user.
    It removes the JWT token from database.
    """
    auth_service.logout(user)
    
    # --- THIS IS THE FIX ---
    # The correct path to the person's name is directly through user.person.name
    return {
        'message': 'Account logged out successfully.',
        'detail': {'user': {'id': user.id, 'name': user.person.name}},
    }