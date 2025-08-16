const Funcionario = require('../model/Funcionario');
const TokenJWT = require('../model/TokenJWT'); // Assumindo que a lógica de gerar token está aqui

module.exports = class FuncionarioController {
    static async create(req, res) {
        try {
            // A senha já é criptografada pelo middleware do Schema
            const novoFuncionario = await Funcionario.create(req.body);
            
            // Não retornar a senha na resposta
            const funcionarioRetorno = novoFuncionario.toObject();
            delete funcionarioRetorno.senha;

            return res.status(201).json({
                status: true,
                msg: 'Funcionário criado com sucesso!',
                funcionario: funcionarioRetorno
            });
        } catch (error) {
            return res.status(400).json({ status: false, msg: error.message });
        }
    }

    static async login(req, res) {
        try {
            const { email, senha } = req.body;
            if (!email || !senha) {
                return res.status(400).json({ status: false, msg: 'Email e senha são obrigatórios.' });
            }

            const funcionario = await Funcionario.findOne({ email: email }).select('+senha');
            if (!funcionario) {
                return res.status(404).json({ status: false, msg: 'Funcionário não encontrado.' });
            }
            
            const token = await TokenJWT.verificarLogin(senha, funcionario);
            if (!token) {
                 return res.status(401).json({ status: false, msg: 'Senha incorreta.' });
            }

            return res.status(200).json({ status: true, msg: 'Login bem-sucedido!', token, user: {id: funcionario.id, nome: funcionario.nome, email: funcionario.email, isAdmin: funcionario.isAdmin} });

        } catch (error) {
            return res.status(500).json({ status: false, msg: 'Erro interno no login.' });
        }
    }

    static async readAll(req, res) {
        try {
            const funcionarios = await Funcionario.find().sort('nome');
            return res.status(200).json({ status: true, funcionarios });
        } catch (error) {
            return res.status(500).json({ status: false, msg: 'Erro ao listar funcionários.' });
        }
    }

    static async readByID(req, res) {
        try {
            const { id } = req.params;
            const funcionario = await Funcionario.findById(id);

            if (!funcionario) {
                return res.status(404).json({ status: false, msg: 'Funcionário não encontrado.' });
            }

            return res.status(200).json({ status: true, funcionario });
        } catch (error) {
            return res.status(500).json({ status: false, msg: 'Erro ao buscar funcionário.' });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const dadosAtualizacao = req.body;
            
            // Impede que a senha seja atualizada diretamente por esta rota
            delete dadosAtualizacao.senha;

            const funcionarioAtualizado = await Funcionario.findByIdAndUpdate(id, dadosAtualizacao, { new: true, runValidators: true });

            if (!funcionarioAtualizado) {
                return res.status(404).json({ status: false, msg: 'Funcionário não encontrado.' });
            }

            return res.status(200).json({ status: true, msg: 'Funcionário atualizado!', funcionario: funcionarioAtualizado });
        } catch (error) {
            return res.status(400).json({ status: false, msg: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            const funcionarioDeletado = await Funcionario.findByIdAndDelete(id);

            if (!funcionarioDeletado) {
                return res.status(404).json({ status: false, msg: 'Funcionário não encontrado.' });
            }

            return res.status(200).json({ status: true, msg: 'Funcionário removido!' });
        } catch (error) {
            return res.status(500).json({ status: false, msg: 'Erro ao remover funcionário.' });
        }
    }
}