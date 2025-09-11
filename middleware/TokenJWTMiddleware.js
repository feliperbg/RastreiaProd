// Arquivo: middleware/TokenJWTMiddleware.js
const TokenJWT = require('../model/TokenJWT');

module.exports = class TokenJWTMiddleware {
    validate(req, res, next) {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ status: false, msg: 'Token não fornecido.' });
        }
        
        const parts = authHeader.split(' ');

        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return res.status(401).json({ status: false, msg: 'Token mal formatado.' });
        }

        const token = parts[1];
        const jwt = new TokenJWT();
        const decoded = jwt.validarToken(token);

        if (decoded) {
            req.user = decoded;
            
            return next(); // Continua para a próxima função na rota
        } else {
            return res.status(401).json({ status: false, msg: 'Token inválido ou expirado.' });
        }
    }
}
