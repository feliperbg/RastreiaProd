// Arquivo: control/FuncionarioControl.js
const Funcionario = require('../model/Funcionario');
const TokenJWT = require('../model/TokenJWT');
const bcrypt = require('bcrypt');
module.exports = class FuncionarioController {
    static async create(req, res) {
        try {
            // A senhaFuncionario já é criptografada pelo middleware do Schema
            const novoFuncionario = await Funcionario.create(req.body);
            
            // Não retornar a senhaFuncionario na resposta
            const funcionarioRetorno = novoFuncionario.toObject();
            delete funcionarioRetorno.senhaFuncionario;

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
            
            const { emailFuncionario, senhaFuncionario } = req.body;

            // 2. Verifique se os campos foram enviados
            if (!emailFuncionario || !senhaFuncionario) {
                return res.status(400).json({ status: false, msg: 'Email e senha são obrigatórios.' });
            }

            // 3. Busque o funcionário pelo email (garanta que o campo no Schema é 'email')
            const funcionario = await Funcionario.findOne({ email: emailFuncionario }).select('+senha');
            if (!funcionario) {
                // Use uma mensagem genérica para não informar se o email existe ou não
                return res.status(401).json({ status: false, msg: 'Credenciais inválidas.' });
            }
            
            // 4. Compare a senha enviada com a senha armazenada no banco (que deve estar hasheada)
            const senhaCorreta = await bcrypt.compare(senhaFuncionario, funcionario.senha);
            if (!senhaCorreta) {
                return res.status(401).json({ status: false, msg: 'Credenciais inválidas.' });
            }

            const jwt = new TokenJWT();
            const token = jwt.gerarToken(funcionario);

            // Para não retornar a senha na resposta
            funcionario.senha = undefined;

            // 6. Envie a resposta de sucesso com o token e os dados do usuário
            return res.status(200).json({ 
                status: true, 
                msg: 'Login bem-sucedido!', 
                token, 
                funcionario: funcionario
            });

        } catch (error) {
            console.error(error); // Logue o erro no console para debug
            return res.status(500).json({ status: false, msg: 'Erro interno no servidor.' });
        }
    }

    static async logout(req, res) {
        try {
            return res.status(200).json({
                status: true,
                message: "Logout realizado com sucesso.",
            });
        }catch(e){
            return res.status(500).json({
                status: false,
                message: 'Logout não foi realizado com sucesso.',
                error: e
            })
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
            
            // Impede que a senhaFuncionario seja atualizada diretamente por esta rota
            delete dadosAtualizacao.senhaFuncionario;

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