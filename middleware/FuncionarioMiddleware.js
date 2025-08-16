// Arquivo: middleware/FuncionarioMiddleware.js

module.exports = class FuncionarioMiddleware {
    static validateCreate(req, res, next) {
        const { nome, email, senha, cargo } = req.body;

        if (nome && email && senha && cargo) {
            return next();
        }

        let camposFaltando = [];
        if (!nome) camposFaltando.push('nome');
        if (!email) camposFaltando.push('email');
        if (!senha) camposFaltando.push('senha');
        if (!cargo) camposFaltando.push('cargo');
        
        return res.status(400).json({
            status: false,
            msg: `Campos obrigatórios faltando: ${camposFaltando.join(', ')}.`
        });
    }
};