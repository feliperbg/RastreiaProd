const Funcionario = require('../model/Funcionario');
const TokenJWT = require('../model/TokenJWT');
const bcrypt = require('bcrypt');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const sendEmail = require('../utils/emailService.js');

module.exports = class FuncionarioController {
    static async create(req, res) {
        let novoFuncionario;
        const tempPath = req.file ? req.file.path : null;
        let finalPath = null;

        try {
            novoFuncionario = new Funcionario({
                ...req.body,
                imagem: null
            });
            await novoFuncionario.save();

            if (tempPath) {
                const fileExtension = path.extname(req.file.originalname);
                const newFileName = `${novoFuncionario._id}${fileExtension}`;
                
                // Define o diretório final
                const finalDir = path.join(path.dirname(tempPath), '..', 'funcionario');
                
                // Garante que o diretório final exista (usando a versão síncrona aqui, pois é uma verificação rápida na inicialização)
                const fsSync = require('fs');
                if (!fsSync.existsSync(finalDir)){
                    fsSync.mkdirSync(finalDir, { recursive: true });
                }

                finalPath = path.join(finalDir, newFileName);

                // USA A VERSÃO ASSÍNCRONA para mover o arquivo
                await fs.rename(tempPath, finalPath);

                const imagePathForDB = `/imagens/funcionario/${newFileName}`;
                novoFuncionario.imagem = imagePathForDB;
                await novoFuncionario.save();
            }

            const funcionarioRetorno = novoFuncionario.toObject();
            delete funcionarioRetorno.senha;
            return res.status(201).json({ status: true, msg: 'Funcionário criado com sucesso!', funcionario: funcionarioRetorno });

        } catch (error) {
            console.error("Erro ao criar funcionário:", error);

            // --- Lógica de Rollback Aprimorada ---
            try {
                if (tempPath) {
                    await fs.unlink(tempPath);
                }
                if (finalPath) {
                    // O fs.unlink falhará se o arquivo não existir, o que é esperado se o rename não ocorreu
                    // Adicionamos um catch para ignorar esse erro específico de "arquivo não encontrado"
                    await fs.unlink(finalPath).catch(err => {
                        if (err.code !== 'ENOENT') throw err; // Re-lança o erro se não for "file not found"
                    });
                }
            } catch (cleanupError) {
                console.error("Erro durante a limpeza dos arquivos:", cleanupError);
            }

            // Deleta o registro do banco
            if (novoFuncionario && novoFuncionario._id) {
                await Funcionario.findByIdAndDelete(novoFuncionario._id);
            }

            if (error.code === 11000) {
                return res.status(400).json({ status: false, msg: 'O e-mail ou CPF informado já está em uso.' });
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

        /**
     * @summary Recupera a senha do funcionário e envia por e-mail.
     * @description Verifica as credenciais, gera uma nova senha, atualiza no banco
     * e utiliza o serviço de e-mail para notificar o funcionário.
     * @param {object} req - A requisição Express.
     * @param {object} res - A resposta Express.
     * @returns {object} Retorna uma resposta JSON indicando sucesso ou falha.
     */
    static async recuperarSenha(req, res) {
        try {
            const { credential, birthdate } = req.body;
    
            const cpfSemMascara = credential.replace(/\D/g, '');
    
            const funcionario = await Funcionario.findOne({
                CPF: cpfSemMascara,
                dataNascimento: new Date(birthdate)
            });
    
            if (!funcionario) {
                return res.status(404).json({ status: false, msg: 'Funcionário não encontrado com os dados informados.' });
            }
    
            const novaSenha = crypto.randomBytes(8).toString('hex');
    
            funcionario.senha = novaSenha;
            await funcionario.save();
    
            const mensagem = `Olá, ${funcionario.nome}.\n\nVocê solicitou a recuperação de sua senha no sistema RastreiaProd.\nSua nova senha é: ${novaSenha}\n\nRecomendamos que você altere esta senha após o primeiro login.\n\nAtenciosamente,\nEquipe RastreiaProd`;

            // Chama a função de e-mail diretamente
            await sendEmail({
                email: funcionario.email,
                subject: 'Recuperação de Senha - RastreiaProd',
                message: mensagem,
            });
    
            // CORREÇÃO 3: Crie o objeto de resposta antes de enviá-lo para adicionar a chave condicional.
            const responseBody = {
                status: true,
                msg: 'Uma nova senha foi enviada para o seu e-mail de cadastro.'
            };

            if (process.env.NODE_ENV === 'development') {
                responseBody.novaSenha = novaSenha; // Adiciona a nova senha apenas em ambiente de desenvolvimento
            }

            return res.status(200).json(responseBody);
    
        } catch (error) {
            console.error('Erro ao recuperar senha:', error);
            if (error.message.includes('enviar o e-mail')) {
                return res.status(500).json({ status: false, msg: error.message });
            }
            return res.status(500).json({ status: false, msg: 'Erro interno no servidor ao tentar recuperar a senha.' });
        }
    }
}