from apiflask import APIBlueprint
from knockbankapi.app import deps
from knockbankapi.app.auth import auth
from knockbankapi.app.schemas import Response, UserLogin, TokenOut
from knockbankapi.domain.dto import UserLoginDTO
from knockbankapi.domain.models import User
from knockbankapi.domain.services import AuthService


auth_bp = APIBlueprint('Auth', __name__, url_prefix='/api')


@auth_bp.post('/login')
@auth_bp.input(UserLogin, arg_name='user_login_dto')
@auth_bp.output(TokenOut)
def login(user_login_dto: UserLoginDTO):
    '''
    Endpoint para realização do login.\n
    Recebe o cpf do dono da conta e a senha de acesso.\n
    Retorna o token JWT.
    '''
    auth_service = deps.get_auth_service()
    token: str = auth_service.login(user_login_dto)
    return {'type': 'bearer', 'accessToken': token}


@auth_bp.delete('/logout')
@auth_bp.auth_required(auth)
@auth_bp.output(Response)
def logout():
    '''
    Endpoint para deslogar o usuário.\n
    Remove o token JWT do banco de dados
    '''
    auth_user: User = auth.current_user
    auth_service = deps.get_auth_service()

    auth_service.logout(auth_user)
    return {
        'message': 'Conta desconectada com sucesso.',
        'detail': {'user': {'id': auth_user.id, 'nome': auth_user.account.person.name}},
    }
