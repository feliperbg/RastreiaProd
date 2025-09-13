const Funcionario = require('../model/Funcionario');
const TokenJWT = require('../model/TokenJWT');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

module.exports = class FuncionarioController {
    static async create(req, res) {
        let novoFuncionario;
        const tempPath = req.file ? req.file.path : null;

        try {
            // 1. Cria o funcionário no banco de dados para obter o _id
            novoFuncionario = new Funcionario({
                ...req.body,
                imagem: null // Define a imagem como nula inicialmente
            });
            await novoFuncionario.save();

            // 2. Se um arquivo foi enviado, renomeia-o com o _id do funcionário
            if (tempPath) {
                const fileExtension = path.extname(req.file.originalname);
                const newFileName = `${novoFuncionario._id}${fileExtension}`;
                const finalPath = path.join(path.dirname(tempPath), newFileName);

                fs.renameSync(tempPath, finalPath);

                // 3. Atualiza o registro do funcionário com o caminho da imagem
                // O caminho salvo no banco deve ser relativo à pasta 'public'
                const imagePathForDB = `/imagens/funcionario/${newFileName}`;
                novoFuncionario.imagem = imagePathForDB;
                await novoFuncionario.save();
            }

            // Remove a senha do objeto de retorno
            const funcionarioRetorno = novoFuncionario.toObject();
            delete funcionarioRetorno.senha;
            return res.status(201).json({ status: true, msg: 'Funcionário criado com sucesso!', funcionario: funcionarioRetorno });

        } catch (error) {
            // Lógica de rollback: se algo der errado, desfaz as ações
            if (tempPath && fs.existsSync(tempPath)) {
                fs.unlinkSync(tempPath); // Deleta o arquivo temporário
            }
            if (novoFuncionario && novoFuncionario._id) {
                await Funcionario.findByIdAndDelete(novoFuncionario._id); // Deleta o registro do funcionário
            }

            console.error("Erro ao criar funcionário:", error);
            if (error.code === 11000) { // Erro de chave duplicada (ex: email)
                return res.status(400).json({ status: false, msg: 'O e-mail informado já está em uso.' });
            }
            return res.status(500).json({ status: false, msg: 'Erro interno no servidor.', error: error.message });
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
                return res.status(401).json({ status: false, msg: 'Credenciais inválidas.' });
            }
            const senhaCorreta = await bcrypt.compare(senha, funcionario.senha);
            if (!senhaCorreta) {
                return res.status(401).json({ status: false, msg: 'Credenciais inválidas.' });
            }
            const jwt = new TokenJWT();
            const token = jwt.gerarToken(funcionario);
            funcionario.senha = undefined;
            return res.status(200).json({ 
                status: true, 
                msg: 'Login bem-sucedido!', 
                token, 
                funcionario: funcionario
            });

        } catch (error) {
            console.error(error);
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
            const funcionarios = await Funcionario.find().populate('departamento', 'nome').sort('nome');
            return res.status(200).json({ status: true, funcionarios });
        } catch (error) {
            return res.status(500).json({ status: false, msg: 'Erro ao listar funcionários.' });
        }
    }

    static async readByID(req, res) {
        try {
            const { id } = req.params;
            const funcionario = await Funcionario.findById(id).populate('departamento', 'nome');

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
            delete dadosAtualizacao.senha;
            delete dadosAtualizacao.imagem;

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