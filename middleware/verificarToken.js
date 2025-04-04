// middleware/verificarToken.js
const TokenJWT = require('../model/TokenJWT');

module.exports = (req, res, next) => {
    const token = req.cookies.authToken;

    const jwt = new TokenJWT();

    if (!token || !jwt.validarToken(token)) {
        return res.status(401).send({
            status: false,
            msg: "Token inválido ou ausente. Faça login novamente."
        });
    }
    req.funcionario = jwt.getPayload();
    next();
};
