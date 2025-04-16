// Importa o modelo Funcionario para realizar validações no banco
const Funcionario = require('../model/Funcionario');

// Classe responsável pelas validações dos dados de funcionários
module.exports = class FuncionarioMiddleware {

    // Verifica se o nome do funcionário tem pelo menos 3 letras
    async validar_NomeFuncionario(req, res, next) {
        const nome = req.body.funcionario?.nome;

        if (!nome || nome.trim().length < 3) {
            return res.status(400).send({
                status: false,
                msg: "O nome deve ter pelo menos 3 caracteres."
            });
        }

        next();
    }

    // Verifica se o email tem formato válido
    async validar_EmailFuncionario(req, res, next) {
        const email = req.body.funcionario?.email;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!email || !emailRegex.test(email)) {
            return res.status(400).send({
                status: false,
                msg: "Email inválido."
            });
        }

        next();
    }

    // Verifica se o email já está cadastrado no banco
    async isNot_funcionarioByEmail(req, res, next) {
        const email = req.body.funcionario?.email;

        const objFuncionario = new Funcionario();
        objFuncionario.email = email;

        const emailExiste = await objFuncionario.isFuncionarioByEmail(email);

        if (emailExiste) {
            return res.status(400).send({
                status: false,
                msg: "Já existe um funcionário com este e-mail cadastrado."
            });
        }

        next();
    }

    // Verifica se o CPF tem 11 dígitos numéricos válidos
    async validar_CPF(req, res, next) {
        const cpf = req.body.funcionario?.CPF;

        const cpfLimpo = cpf?.replace(/\D/g, '');

        if (!cpf || cpfLimpo.length !== 11 || !/^\d{11}$/.test(cpfLimpo)) {
            return res.status(400).send({
                status: false,
                msg: "CPF inválido. Deve conter exatamente 11 dígitos numéricos."
            });
        }

        next();
    }

    // Verifica se o telefone está presente e tem 10 ou 11 dígitos
    async validar_Telefone(req, res, next) {
        const telefone = req.body.funcionario?.telefone;
        const telefoneLimpo = telefone?.replace(/\D/g, '');

        if (!telefone || telefoneLimpo.length < 10 || telefoneLimpo.length > 11) {
            return res.status(400).send({
                status: false,
                msg: "Telefone inválido. Deve conter 10 ou 11 dígitos."
            });
        }

        next();
    }

    // Verifica se a senha foi fornecida e tem no mínimo 6 caracteres
    async validar_Senha(req, res, next) {
        const senha = req.body.funcionario?.senha;

        if (!senha || senha.length < 6) {
            return res.status(400).send({
                status: false,
                msg: "A senha deve ter no mínimo 6 caracteres."
            });
        }

        next();
    }

    // Verifica se a lista de permissões foi informada e contém ao menos uma
    async validar_Permissoes(req, res, next) {
        const permissoes = req.body.funcionario?.permissoes;

        if (!Array.isArray(permissoes) || permissoes.length === 0) {
            return res.status(400).send({
                status: false,
                msg: "O funcionário deve ter pelo menos uma permissão atribuída."
            });
        }

        next();
    }
};
