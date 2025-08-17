// Arquivo: middleware/FuncionarioMiddleware.js
module.exports = class FuncionarioMiddleware {
    static validateCreate(req, res, next) {
        const { nome, email, senha } = req.body;

        if (nome && email && senha) {
            return next();
        }

        let camposFaltando = [];
        if (!nome) camposFaltando.push('nome');
        if (!email) camposFaltando.push('email');
        if (!senha) camposFaltando.push('senha');
        
        return res.status(400).json({
            status: false,
            msg: `Campos obrigatórios faltando: ${camposFaltando.join(', ')}.`
        });
    }
};