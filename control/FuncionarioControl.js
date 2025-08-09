const Funcionario = require('../model/Funcionario');
const Funcionarios = require('../model/FuncionariosTabela'); // IMPORTADO PARA OPERAÇÕES CRUD
const TokenJWT = require('../model/TokenJWT');

module.exports = class FuncionarioControl {
    async logout(req, res, next) {
        try {
            res.status(200).json({ status: true, msg: "Logout realizado com sucesso." });
        } catch (error) {
            console.error("Erro ao realizar logout:", error);
            error.statusCode = 500;
            next(error);
        }
    }

    async login(req, res, next) {
        try {
            const { credencial, senha } = req.body.Funcionario;

            if (!credencial || !senha) {
                const error = new Error('Credencial e senha são obrigatórios.');
                error.statusCode = 400;
                return next(error);
            }

            // Usa o método estático para autenticar
            const funcionario = await Funcionario.autenticar(credencial, senha);

            if (!funcionario) {
                const error = new Error('Credenciais inválidas.');
                error.statusCode = 401;
                return next(error);
            }

            // Gera o token com os dados do funcionário retornado
            const token = new TokenJWT().gerarToken(
                funcionario._id.toString(), // Garante que o ID seja uma string
                funcionario.nome,
                funcionario.credencialaaaaaaaaaaaaaaaaaaaaaaaaaasaaaaa
            );

            res.status(200).json({
                status: true,
                token,
                funcionario: {
                    id: funcionario._id.toString(), // Garante que o ID seja uma string
                    nome: funcionario.nome,
                    role: funcionario.role,
                    permissoes: funcionario.permissoes
                }
            });

        } catch (error) {
            console.error('Erro no login:', error);
            // Se o autenticar() lançar um erro, ele será capturado aqui
            if (!error.statusCode) {
                error.statusCode = 500;
            }
            next(error);
        }
    }

    async add(req, res, next) {
        try {
            // CORRIGIDO: Usa o modelo do Mongoose 'Funcionarios' diretamente
            const novoFuncionario = await Funcionarios.create(req.body);
            res.status(201).json({ status: true, funcionario: novoFuncionario });
        } catch (error) {
            if (error.name === 'ValidationError' || error.code === 11000) {
                error.statusCode = 400;
            }
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            // CORRIGIDO: Usa o modelo do Mongoose 'Funcionarios' diretamente
            const funcionario = await Funcionarios.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
            if (!funcionario) {
                const error = new Error('Funcionário não encontrado.');
                error.statusCode = 404;
                return next(error);
            }
            res.status(200).json({ status: true, funcionario });
        } catch (error) {
            if (error.name === 'ValidationError') {
                error.statusCode = 400;
            }
            next(error);
        }
    }

    async getById(req, res, next) {
        try {
            // CORRIGIDO: Usa o modelo do Mongoose 'Funcionarios' diretamente
            const funcionario = await Funcionarios.findById(req.params.id);
            if (!funcionario) {
                const error = new Error('Funcionário não encontrado.');
                error.statusCode = 404;
                return next(error);
            }
            res.status(200).json({ status: true, funcionario });
        } catch (error) {
            next(error);
        }
    }

    async getAll(req, res, next) {
        try {
            // CORRIGIDO: Usa o modelo do Mongoose 'Funcionarios' diretamente
            const funcionarios = await Funcionarios.find({});
            res.status(200).json({ funcionarios, status: true });
        } catch (error) {
            next(error);
        }
    }

    async delete(req, res, next) {
        try {
            // CORRIGIDO: Usa o modelo do Mongoose 'Funcionarios' diretamente
            const funcionario = await Funcionarios.findByIdAndDelete(req.params.id);
            if (!funcionario) {
                const error = new Error('Funcionário não encontrado.');
                error.statusCode = 404;
                return next(error);
            }
            // A lógica de apagar a imagem pode ser adicionada aqui, se necessário
            res.status(200).json({ status: true, msg: "Funcionário removido." });
        } catch (error) {
            next(error);
        }
    }
};