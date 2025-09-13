// Arquivo: middleware/FuncionarioMiddleware.js
module.exports = class FuncionarioMiddleware {
    /**
     * Middleware para validar os campos durante a criação de um novo registro.
     */
    static validateCreate(req, res, next) {
        // Extrai todos os campos esperados do corpo da requisição
        let {
            nome,
            senha,
            CPF,
            email,
            telefone,
            turno,
            dataNascimento,
            imagem,
            permissoes,
            role,
            departamento,
        } = req.body;

        // Validação do Nome
        if (nome === undefined || nome.trim() === '') {
            return res.status(400).json({ status: false, msg: 'O campo "nome" é obrigatório.' });
        }

        // Validação do Email
        if (email === undefined || email.trim() === '') {
            return res.status(400).json({ status: false, msg: 'O campo "email" é obrigatório.' });
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ status: false, msg: 'O formato do email é inválido.' });
        }

        // Validação da Senha
        if (senha === undefined || senha === '') {
            return res.status(400).json({ status: false, msg: 'O campo "senha" é obrigatório.' });
        }
        if (senha.length < 6) {
            return res.status(400).json({ status: false, msg: 'A senha deve ter pelo menos 6 caracteres.' });
        }

        // Validação do CPF
        if (CPF === undefined || CPF.trim() === '') {
            return res.status(400).json({ status: false, msg: 'O campo "CPF" é obrigatório.' });
        }
        if (!validaCPF(CPF)) {
            return res.status(400).json({ status: false, msg: 'O CPF informado é inválido.' });
        }
        
        // Validação do Telefone
        if (telefone === undefined || telefone.trim() === '') {
            return res.status(400).json({ status: false, msg: 'O campo "telefone" é obrigatório.' });
        }

        // Validação do Turno
        if (turno === undefined || turno.trim() === '') {
            return res.status(400).json({ status: false, msg: 'O campo "turno" é obrigatório.' });
        }

        // Validação da Data de Nascimento
        if (dataNascimento === undefined || dataNascimento.trim() === '') {
            return res.status(400).json({ status: false, msg: 'O campo "data de nascimento" é obrigatório.' });
        }
        const dataRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dataRegex.test(dataNascimento)) {
            return res.status(400).json({ status: false, msg: 'O formato da data de nascimento deve ser AAAA-MM-DD.' });
        }
        if (new Date(dataNascimento) > new Date()) {
            return res.status(400).json({ status: false, msg: 'A data de nascimento não pode ser no futuro.' });
        }

        if (permissoes && typeof permissoes === 'string') {
            permissoes = permissoes.split(',');
            req.body.permissoes = permissoes; 
        }

        // Validação da Role
        if (role === undefined || role.trim() === '') {
            return res.status(400).json({ status: false, msg: 'O campo "role" é obrigatório.' });
        }

        // Validação do Departamento
        if (departamento === undefined || departamento.trim() === '') {
            return res.status(400).json({ status: false, msg: 'O campo "departamento" é obrigatório.' });
        }


        // Se todas as validações passarem, continua para a próxima função
        next();
    }



    /**
     * Middleware para validar os campos do corpo da requisição.
     */
    static validateUpdate(req, res, next) {
        // Extrai todos os campos esperados do corpo da requisição
        const {
            nome,
            email,
            CPF,
            telefone,
            turno,
            dataNascimento,
            role,
            departamento
        } = req.body;

        // Validação do Nome
        if (nome === undefined || nome.trim() === '') {
            return res.status(400).json({ status: false, msg: 'O campo "nome" é obrigatório.' });
        }

        // Validação do Email
        if (email === undefined || email.trim() === '') {
            return res.status(400).json({ status: false, msg: 'O campo "email" é obrigatório.' });
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ status: false, msg: 'O formato do email é inválido.' });
        }

        // Validação do CPF
        if (CPF === undefined || CPF.trim() === '') {
            return res.status(400).json({ status: false, msg: 'O campo "CPF" é obrigatório.' });
        }
        if (!validaCPF(CPF)) {
            return res.status(400).json({ status: false, msg: 'O CPF informado é inválido.' });
        }
        
        // Validação do Telefone (opcional, mas se existir, pode ter um formato)
        if (telefone === undefined || telefone.trim() === '') {
            return res.status(400).json({ status: false, msg: 'O campo "telefone" é obrigatório.' });
        }

        // Validação do Turno
        if (turno === undefined || turno.trim() === '') {
            return res.status(400).json({ status: false, msg: 'O campo "turno" é obrigatório.' });
        }

        // Validação da Data de Nascimento
        if (dataNascimento === undefined || dataNascimento.trim() === '') {
            return res.status(400).json({ status: false, msg: 'O campo "dataNascimento" é obrigatório.' });
        }
        // Verifica se a data está no formato YYYY-MM-DD
        const dataRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dataRegex.test(dataNascimento)) {
            return res.status(400).json({ status: false, msg: 'O formato da data de nascimento deve ser AAAA-MM-DD.' });
        }

        // Validação da Role
        if (role === undefined || role.trim() === '') {
            return res.status(400).json({ status: false, msg: 'O campo "role" é obrigatório.' });
        }

        // Validação do Departamento
        if (!departamento || String(departamento).trim() === '') {
            return res.status(400).json({ status: false, msg: 'O campo "departamento" é obrigatório.' });
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
    /**
     * Função auxiliar para validar o CPF.
     * @param {string} strCPF - O CPF a ser validado, pode conter pontos e traços.
     * @returns {boolean} - Retorna true se o CPF for válido, false caso contrário.
     */
    function validaCPF(strCPF) {
        let soma = 0;
        let resto;

        // Remove caracteres não numéricos
        const cpfLimpo = String(strCPF).replace(/[^\d]/g, '');

        // Verifica se o CPF tem 11 dígitos
        if (cpfLimpo.length !== 11) {
            return false;
        }

        if (/^(\d)\1+$/.test(cpfLimpo)) {
            return false;
        }

        // Validação do primeiro dígito verificador
        for (let i = 1; i <= 9; i++) {
            soma += parseInt(cpfLimpo.substring(i - 1, i)) * (11 - i);
        }
        resto = (soma * 10) % 11;
        if ((resto === 10) || (resto === 11)) {
            resto = 0;
        }
        if (resto !== parseInt(cpfLimpo.substring(9, 10))) {
            return false;
        }

        // Validação do segundo dígito verificador
        soma = 0;
        for (let i = 1; i <= 10; i++) {
            soma += parseInt(cpfLimpo.substring(i - 1, i)) * (12 - i);
        }
        resto = (soma * 10) % 11;
        if ((resto === 10) || (resto === 11)) {
            resto = 0;
        }
        if (resto !== parseInt(cpfLimpo.substring(10, 11))) {
            return false;
        }

        return true;
    }