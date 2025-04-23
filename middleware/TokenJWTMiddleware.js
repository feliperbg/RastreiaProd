// Importa a classe responsável por lidar com a validação do token JWT
const TokenJWT = require('../model/TokenJWT');

// Exporta a classe do middleware de autenticação JWT
module.exports = class JWTMiddleware {

    // Método de validação que verifica se o token JWT está presente e é válido
    validate(request, response, next) {
        const authHeader = request.headers['authorization'];

        // Verifica se o cabeçalho Authorization existe e começa com "Bearer "
        if (authHeader && authHeader.startsWith('Bearer ')) {
            // Extrai apenas o token, removendo "Bearer " do início da string
            const token = authHeader.split(' ')[1];

            const objMeuTokenJWT = new TokenJWT();

            // Valida o token utilizando a classe MeuTokenJWT
            if (objMeuTokenJWT.validarToken(token) === true) {
                next(); // Token válido, segue para o próximo middleware ou rota
            } else {
                // Token inválido
                response.status(401).json({
                    status: false,
                    msg: 'Token inválido.'
                });
            }

        } else {
            // Token não fornecido
            response.status(401).json({
                status: false,
                msg: 'Token não fornecido.'
            });
        }
    }
}