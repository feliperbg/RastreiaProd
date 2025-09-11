// Arquivo: middleware/FuncionarioMiddleware.js
module.exports = class FuncionarioMiddleware {
    static validateCreate(req, res, next) {
        const { nome, email, senha } = req.body;

        if (!nome || !email || !senha) {
            let camposFaltando = [];
            if (!nome) camposFaltando.push('nome'); //
            if (!email) camposFaltando.push('email'); //
            if (!senha) camposFaltando.push('senha'); //
            return res.status(400).json({ status: false, msg: `Campos obrigatórios faltando: ${camposFaltando.join(', ')}.` });
        }

        // --- NOVA VALIDAÇÃO DE FORMATO DE EMAIL ---
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ status: false, msg: 'O formato do email é inválido.' });
        }

        return next();
    }

    static validateUpdate(req, res, next) {
        const { nome, email, senha } = req.body;

        if (nome === '') {
            return res.status(400).json({ status: false, msg: 'O campo "nome" não pode ser vazio.' });
        }
        if (email === '') {
            return res.status(400).json({ status: false, msg: 'O campo "email" não pode ser vazio.' });
        }
        // --- NOVA VALIDAÇÃO DE FORMATO DE EMAIL ---
        if (email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ status: false, msg: 'O formato do email é inválido.' });
            }
        }

        if (senha != null && senha.length < 6) {
            return res.status(400).json({ status: false, msg: 'A senha deve ter pelo menos 6 caracteres.' });
        }

        next();
    }

    static validateLogin(req, res, next) {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({ status: false, msg: 'Os campos "email" e "senha" são obrigatórios.' });
        }

        // --- NOVA VALIDAÇÃO DE FORMATO DE EMAIL ---
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ status: false, msg: 'O formato do email é inválido.' });
        }

        next();
    }
};