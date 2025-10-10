const Funcionario = require('../model/Funcionario');
const TokenJWT = require('../model/TokenJWT');
const bcrypt = require('bcrypt');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const sendEmail = require('../utils/emailService.js');

// Função auxiliar para tratar erros de forma padronizada
function handleErrors(res, error) {
  if (error.name === 'ValidationError') {
    let messages = [];
    for (let field in error.errors) {
      messages.push(error.errors[field].message);
    }
    return res.status(400).json({ status: false, msg: `Erro de validação: ${messages.join(' ')}` });
  } else if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    const value = error.keyValue[field];
    return res.status(409).json({ status: false, msg: `O campo '${field}' com valor '${value}' já está em uso.` });
  } else {
    console.error(error);
    return res.status(500).json({ status: false, msg: 'Ocorreu um erro interno no servidor.' });
  }
}

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

            return handleErrors(res, error);
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
            return handleErrors(res, error);
        }
    }

    static async logout(req, res) {
        try {
            return res.status(200).json({
                status: true,
                message: "Logout realizado com sucesso.",
            });
        }catch(e){
            return handleErrors(res, e);
        } 
    }

    static async readAll(req, res) {
        try {
            const funcionarios = await Funcionario.find().populate('departamento', 'nome').sort('nome');
            return res.status(200).json({ status: true, funcionarios });
        } catch (error) {
            return handleErrors(res, error);
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
            return handleErrors(res, error);
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
            return handleErrors(res, error);
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
            return handleErrors(res, error);
        }
    }

    /**
     * @summary Solicita a redefinição de senha.
     * @description Verifica o usuário por CPF e data de nascimento, gera um código de 6 dígitos,
     * armazena seu hash no banco com expiração de 15 minutos e o envia por e-mail.
     * @param {object} req - A requisição Express.
     * @param {object} res - A resposta Express.
     * @returns {object} Retorna uma resposta JSON indicando sucesso ou falha.
     */
    static async requestPasswordReset(req, res) {
        try {
            const { credential, birthdate } = req.body;
            if (!credential || !birthdate) {
                return res.status(400).json({ status: false, msg: 'CPF e Data de Nascimento são obrigatórios.' });
            }

            const cpfSemMascara = credential.replace(/\D/g, '');

            // Busca o funcionário e seleciona os campos de reset de senha
            const funcionario = await Funcionario.findOne({
                CPF: cpfSemMascara,
                dataNascimento: new Date(birthdate)
            }).select('+resetPasswordToken +resetPasswordExpires');

            // IMPORTANTE: Para evitar enumeração de usuários, sempre retorne uma mensagem de sucesso genérica.
            // A lógica interna prossegue apenas se o funcionário for encontrado.
            if (funcionario) {
                // Gera um código numérico de 6 dígitos
                const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

                // Armazena o HASH do código e a data de expiração (15 minutos)
                funcionario.resetPasswordToken = await bcrypt.hash(resetCode, 10);
                funcionario.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutos

                await funcionario.save();

                // Envia o e-mail com o código (NÃO o hash)
                const mensagem = `Olá, ${funcionario.nome}.\n\nVocê solicitou a redefinição de sua senha no sistema RastreiaProd.\n\nUse o seguinte código de verificação para redefinir sua senha: ${resetCode}\n\nEste código é válido por 15 minutos.\n\nSe você não solicitou esta alteração, por favor, ignore este e-mail.\n\nAtenciosamente,\nEquipe RastreiaProd`;

                await sendEmail({
                    email: funcionario.email,
                    subject: 'Código de Recuperação de Senha - RastreiaProd',
                    message: mensagem,
                });
            }

            // Resposta genérica para o cliente
            return res.status(200).json({
                status: true,
                msg: 'Se os dados estiverem corretos, um e-mail com o código de recuperação foi enviado.',
                userId: funcionario ? funcionario._id : null // Envia o ID para o frontend poder redirecionar
            });

        } catch (error) {
            return handleErrors(res, error);
        }
    }

    /**
     * @summary Verifica o código de redefinição de senha.
     * @description Valida o código de 6 dígitos enviado pelo usuário contra o hash armazenado e sua data de expiração.
     * @param {object} req - A requisição Express.
     * @param {object} res - A resposta Express.
     * @returns {object} Retorna um status de sucesso se o código for válido.
     */
    static async verifyResetCode(req, res) {
        try {
            const { userId, code } = req.body;

            if (!userId || !code) {
                return res.status(400).json({ status: false, msg: 'ID do usuário e código são obrigatórios.' });
            }

            const funcionario = await Funcionario.findById(userId).select('+resetPasswordToken +resetPasswordExpires');

            if (!funcionario) {
                return res.status(404).json({ status: false, msg: 'Usuário não encontrado.' });
            }

            // Verifica se o token existe e não expirou
            if (!funcionario.resetPasswordToken || !funcionario.resetPasswordExpires || Date.now() > funcionario.resetPasswordExpires) {
                return res.status(400).json({ status: false, msg: 'Código de verificação inválido ou expirado. Por favor, solicite um novo.' });
            }

            // Compara o código enviado com o hash armazenado
            const isCodeValid = await bcrypt.compare(code, funcionario.resetPasswordToken);

            if (!isCodeValid) {
                return res.status(400).json({ status: false, msg: 'Código de verificação inválido.' });
            }

            // Se o código for válido, removemos o token para que ele não possa ser usado novamente para verificar,
            // mas mantemos a data de expiração como um sinal de que a redefinição foi autorizada.
            // A data de expiração original servirá como um "token de autorização" de uso único.
            funcionario.resetPasswordToken = undefined;
            await funcionario.save();

            return res.status(200).json({ status: true, msg: 'Código verificado com sucesso.' });

        } catch (error) {
            return handleErrors(res, error);
        }
    }

    /**
     * @summary Redefine a senha do usuário.
     * @description Valida se a redefinição foi autorizada (verificando a ausência do token e a validade da expiração)
     * e atualiza a senha do usuário.
     * @param {object} req - A requisição Express.
     * @param {object} res - A resposta Express.
     * @returns {object} Retorna uma resposta JSON indicando sucesso ou falha.
     */
    static async resetPassword(req, res) {
        try {
            const { userId, newPassword, confirmPassword } = req.body;

            // Validações de entrada
            if (!userId || !newPassword || !confirmPassword) {
                return res.status(400).json({ status: false, msg: 'Todos os campos são obrigatórios.' });
            }
            if (newPassword !== confirmPassword) {
                return res.status(400).json({ status: false, msg: 'As senhas não coincidem.' });
            }
            if (newPassword.length < 8) {
                return res.status(400).json({ status: false, msg: 'A nova senha deve ter pelo menos 8 caracteres.' });
            }

            // Busca o usuário incluindo os campos de token que normalmente não são selecionados
            const funcionario = await Funcionario.findById(userId).select('+resetPasswordToken +resetPasswordExpires +senha');

            if (!funcionario) {
                return res.status(404).json({ status: false, msg: 'Usuário não encontrado.' });
            }

            // A autorização para redefinir a senha é confirmada se o token foi consumido (undefined)
            // mas a data de expiração ainda é válida.
            if (funcionario.resetPasswordToken || !funcionario.resetPasswordExpires || Date.now() > funcionario.resetPasswordExpires) {
                return res.status(400).json({ status: false, msg: 'Autorização para redefinir a senha é inválida ou expirou. Por favor, verifique o código novamente.' });
            }

            // Tudo certo, atualiza a senha
            funcionario.senha = newPassword; // O pre-save hook do Mongoose irá hashear
            funcionario.resetPasswordExpires = undefined; // Invalida a data de expiração

            await funcionario.save();

            await sendEmail({
                email: funcionario.email,
                subject: 'Sua senha foi redefinida - RastreiaProd',
                message: `Olá, ${funcionario.nome}.\n\nSua senha no sistema RastreiaProd foi alterada com sucesso.\n\nSe você não realizou esta alteração, entre em contato com o suporte imediatamente.\n\nAtenciosamente,\nEquipe RastreiaProd`,
            });

            return res.status(200).json({ status: true, msg: 'Senha alterada com sucesso!' });

        } catch (error) {
            return handleErrors(res, error);
        }
    }
}