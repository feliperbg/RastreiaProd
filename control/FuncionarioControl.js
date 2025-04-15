const Funcionario = require('../model/Funcionario');
const TokenJWT = require('../model/TokenJWT');
const bcrypt = require('bcrypt');

module.exports = class FuncionarioControl {
    /**
     * Realiza o login de um funcionário
     * @param {Object} request - Objeto de requisição HTTP
     * @param {Object} response - Objeto de resposta HTTP
     */

    async login(request, response) {
        console.log("BODY RECEBIDO:", request.body);

        const funcionario = new Funcionario();
        funcionario.credencial = request.body.Funcionario.credencial;
        funcionario.senha = request.body.Funcionario.senha;

        const logou = await funcionario.login();
        console.log("LOGIN SUCESSO?", logou);

        if (logou) {
            // Busca os dados completos do funcionário
            const funcionarioCompleto = await funcionario.readByID(funcionario._idFuncionario);
            
            const payloadToken = {
                credencialFuncionario: funcionario.credencial,
                idFuncionario: funcionario._idFuncionario,
                role: funcionarioCompleto.role,
                permissoes: funcionarioCompleto.permissoes
            };

            const jwt = new TokenJWT();
            const token_string = jwt.gerarToken(payloadToken);

            const objResposta = {
                status: true,
                msg: 'Logado com sucesso',
                funcionario: {
                    id: funcionario._idFuncionario,
                    nome: funcionarioCompleto.nome,
                    credencial: funcionario.credencial,
                    role: funcionarioCompleto.role,
                    permissoes: funcionarioCompleto.permissoes
                },
                token: token_string
            };
            return response.status(200).send(objResposta);

        } else {
            return response.status(401).send({
                status: false,
                msg: 'Credencial ou senha inválidos',
            });
        }
    }

    /**
     * Realiza o logout do sistema
     * @param {Object} request - Objeto de requisição HTTP
     * @param {Object} response - Objeto de resposta HTTP
     */
    async logout(request, response) {
        try {
            // Em uma implementação real, você poderia invalidar o token aqui
            return response.status(200).send({
                status: true,
                msg: "Logout realizado com sucesso."
            });
        } catch (error) {
            console.error('Erro no logout:', error);
            return response.status(500).send({
                status: false,
                msg: 'Erro durante o logout'
            });
        }
    }

    /**
     * Cria um novo funcionário
     * @param {Object} request - Objeto de requisição HTTP
     * @param {Object} response - Objeto de resposta HTTP
     */
    async create(request, response) {
        try {
            const {
                nome,
                turno,
                senha,
                CPF,
                email,
                telefone,
                credencial,
                dataNascimento,
                permissoes,
                role
            } = request.body;

            // Verifica se a credencial já existe
            const funcionario = new Funcionario();
            const credencialExiste = await funcionario.isFuncionarioByCredencial(credencial);
            
            if (credencialExiste) {
                return response.status(400).send({
                    status: false,
                    msg: 'Já existe um funcionário com esta credencial'
                });
            }

            // Cria o novo funcionário
            const novoFuncionario = new Funcionario(
                nome,
                turno,
                senha,
                CPF,
                email,
                telefone,
                credencial,
                dataNascimento,
                permissoes || [],
                role || 'funcionario'
            );

            const criado = await novoFuncionario.create();
            
            if (criado) {
                return response.status(201).send({
                    status: true,
                    msg: 'Funcionário criado com sucesso',
                    funcionario: {
                        nome: novoFuncionario.nome,
                        credencial: novoFuncionario.credencial,
                        role: novoFuncionario.role
                    }
                });
            } else {
                return response.status(500).send({
                    status: false,
                    msg: 'Erro ao criar funcionário'
                });
            }
        } catch (error) {
            console.error('Erro ao criar funcionário:', error);
            return response.status(500).send({
                status: false,
                msg: 'Erro interno ao criar funcionário'
            });
        }
    }

    /**
     * Lista todos os funcionários
     * @param {Object} request - Objeto de requisição HTTP
     * @param {Object} response - Objeto de resposta HTTP
     */
    async listAll(request, response) {
        try {
            const funcionario = new Funcionario();
            const funcionarios = await funcionario.readAll();
            
            // Remove informações sensíveis antes de retornar
            const funcionariosSanitizados = funcionarios.map(f => ({
                id: f._id,
                nome: f.nome,
                email: f.email,
                turno: f.turno,
                role: f.role,
                credencial: f.credencial
            }));

            return response.status(200).send({
                status: true,
                funcionarios: funcionariosSanitizados
            });
        } catch (error) {
            console.error('Erro ao listar funcionários:', error);
            return response.status(500).send({
                status: false,
                msg: 'Erro ao listar funcionários'
            });
        }
    }

    /**
     * Obtém um funcionário específico por ID
     * @param {Object} request - Objeto de requisição HTTP
     * @param {Object} response - Objeto de resposta HTTP
     */
    async getById(request, response) {
        try {
            const { id } = request.params;
            const funcionario = new Funcionario();
            const encontrado = await funcionario.readByID(id);
            
            if (encontrado) {
                // Remove informações sensíveis antes de retornar
                const funcionarioSanitizado = {
                    id: encontrado._id,
                    nome: encontrado.nome,
                    email: encontrado.email,
                    turno: encontrado.turno,
                    role: encontrado.role,
                    credencial: encontrado.credencial,
                    permissoes: encontrado.permissoes,
                    dataNascimento: encontrado.dataNascimento,
                    telefone: encontrado.telefone
                };
                
                return response.status(200).send({
                    status: true,
                    funcionario: funcionarioSanitizado
                });
            } else {
                return response.status(404).send({
                    status: false,
                    msg: 'Funcionário não encontrado'
                });
            }
        } catch (error) {
            console.error('Erro ao buscar funcionário:', error);
            return response.status(500).send({
                status: false,
                msg: 'Erro ao buscar funcionário'
            });
        }
    }

    /**
     * Atualiza um funcionário existente
     * @param {Object} request - Objeto de requisição HTTP
     * @param {Object} response - Objeto de resposta HTTP
     */
    async update(request, response) {
        try {
            const { id } = request.params;
            const dadosAtualizacao = request.body;
            
            const funcionario = new Funcionario();
            // Primeiro busca o funcionário para ter os dados atuais
            await funcionario.readByID(id);
            
            // Atualiza apenas os campos permitidos
            if (dadosAtualizacao.nome) funcionario.nome = dadosAtualizacao.nome;
            if (dadosAtualizacao.turno) funcionario.turno = dadosAtualizacao.turno;
            if (dadosAtualizacao.senha) funcionario.senha = dadosAtualizacao.senha;
            if (dadosAtualizacao.email) funcionario.email = dadosAtualizacao.email;
            if (dadosAtualizacao.telefone) funcionario.telefone = dadosAtualizacao.telefone;
            if (dadosAtualizacao.dataNascimento) funcionario.dataNascimento = dadosAtualizacao.dataNascimento;
            if (dadosAtualizacao.permissoes) funcionario.permissoes = dadosAtualizacao.permissoes;
            if (dadosAtualizacao.role) funcionario.role = dadosAtualizacao.role;
            
            const atualizado = await funcionario.update();
            
            if (atualizado) {
                return response.status(200).send({
                    status: true,
                    msg: 'Funcionário atualizado com sucesso'
                });
            } else {
                return response.status(500).send({
                    status: false,
                    msg: 'Erro ao atualizar funcionário'
                });
            }
        } catch (error) {
            console.error('Erro ao atualizar funcionário:', error);
            return response.status(500).send({
                status: false,
                msg: 'Erro interno ao atualizar funcionário'
            });
        }
    }

    /**
     * Remove um funcionário
     * @param {Object} request - Objeto de requisição HTTP
     * @param {Object} response - Objeto de resposta HTTP
     */
    async delete(request, response) {
        try {
            const { id } = request.params;
            const funcionario = new Funcionario();
            funcionario._idFuncionario = id;
            
            const deletado = await funcionario.delete();
            
            if (deletado) {
                return response.status(200).send({
                    status: true,
                    msg: 'Funcionário removido com sucesso'
                });
            } else {
                return response.status(404).send({
                    status: false,
                    msg: 'Funcionário não encontrado'
                });
            }
        } catch (error) {
            console.error('Erro ao remover funcionário:', error);
            return response.status(500).send({
                status: false,
                msg: 'Erro ao remover funcionário'
            });
        }
    }
};