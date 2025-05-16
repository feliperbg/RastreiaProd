const Produto = require('../model/Produto');
const TokenJWT = require('../model/TokenJWT');
const bcrypt = require('bcrypt');

module.exports = class ProdutoControl {
    /**
     * Cria um novo produto
     * @param {Object} request - Objeto de requisição HTTP
     * @param {Object} response - Objeto de resposta HTTP
     */
    async create(request, response) {
        try {
            const {
                Produto: {
                    nome,
                    codigo,
                    descricao,
                    componentesNecessarios,
                    validade,
                    precoMontagem,
                    precoVenda,
                    dimensoes,
                    quantidade,
                    etapas
                }
            } = request.body;
            // Cria o novo produto
            const novoProduto = new Produto(
                nome,
                codigo,
                descricao,
                componentesNecessarios,
                validade,
                precoMontagem,
                precoVenda,
                dimensoes,
                quantidade || [],
                etapas || 'produto'
            );

            const criado = await novoProduto.create();
            
            if (criado) {
                return response.status(201).send({
                    status: true,
                    msg: 'Produto criado com sucesso',
                    produto: {
                        nome: novoProduto.nome
                    }
                });
            } else {
                return response.status(500).send({
                    status: false,
                    msg: 'Erro ao criar produto'
                });
            }
        } catch (error) {
            console.error('Erro ao criar produto:', error);
            return response.status(500).send({
                status: false,
                msg: 'Erro interno ao criar produto'
            });
        }
    }

    /**
     * Lista todos os produtos
     * @param {Object} request - Objeto de requisição HTTP
     * @param {Object} response - Objeto de resposta HTTP
     */
    async readAll(request, response) {
        try {
            const produto = new Produto();
            const produtos = await produto.readAll();

            return response.status(200).send({
                status: true,
                produtos: produtos,
            });
        } catch (error) {
            console.error('Erro ao listar produtos:', error);
            return response.status(500).send({
                status: false,
                msg: 'Erro ao listar produtos'
            });
        }
    }

    /**
     * Obtém um produto específico por ID
     * @param {Object} request - Objeto de requisição HTTP
     * @param {Object} response - Objeto de resposta HTTP
     */
    async readByID(request, response) {
        try {
            const { id } = request.params;
            const produto = new Produto();
            const encontrado = await produto.readByID(id);
            
            if (encontrado) {
                // Remove informações sensíveis antes de retornar
                const produtoSanitizado = {
                    id: encontrado._id,
                    nome: encontrado.nome,
                    codigo: encontrado.codigo,
                    descricao: encontrado.descricao,
                    componentesNecessarios: encontrado.componentesNecessarios,
                    dataEntrada: encontrado.dataEntrada,
                    validade: encontrado.validade,
                    precoMontagem: encontrado.precoMontagem,
                    precoVenda: encontrado.precoVenda,
                    dimensoes: encontrado.dimensoes,
                    quantidade: encontrado.quantidade,
                    etapas: encontrado.etapas
                };
                
                return response.status(200).send({
                    status: true,
                    produto: produtoSanitizado
                });
            } else {
                return response.status(404).send({
                    status: false,
                    msg: 'Produto não encontrado'
                });
            }
        } catch (error) {
            console.error('Erro ao buscar produto:', error);
            return response.status(500).send({
                status: false,
                msg: 'Erro ao buscar produto'
            });
        }
    }

    /**
     * Atualiza um produto existente
     * @param {Object} request - Objeto de requisição HTTP
     * @param {Object} response - Objeto de resposta HTTP
     */
    async update(request, response) {
        try {
            const { id } = request.params;
            const dadosAtualizacao = request.body;
            
            const produto = new Produto();
            // Primeiro busca o produto para ter os dados atuais
            await produto.readByID(id);
            
            // Atualiza apenas os campos permitidos
            if (dadosAtualizacao.nome) produto.nome = dadosAtualizacao.nome;
            if (dadosAtualizacao.codigo) produto.codigo = dadosAtualizacao.codigo;
            if (dadosAtualizacao.descricao) produto.descricao = dadosAtualizacao.descricao;
            if (dadosAtualizacao.componentesNecessarios) produto.componentesNecessarios = dadosAtualizacao.componentesNecessarios;
            if (dadosAtualizacao.validade) produto.validade = dadosAtualizacao.validade;
            if (dadosAtualizacao.precoMontagem) produto.precoMontagem = dadosAtualizacao.precoMontagem;
            if (dadosAtualizacao.precoVenda) produto.precoVenda = dadosAtualizacao.precoVenda;
            if (dadosAtualizacao.dimensoes) produto.dimensoes = dadosAtualizacao.dimensoes;
            if (dadosAtualizacao.quantidade) produto.quantidade = dadosAtualizacao.quantidade;
            if (dadosAtualizacao.etapas) produto.etapas = dadosAtualizacao.etapas;
            
            const atualizado = await produto.update();
            
            if (atualizado) {
                return response.status(200).send({
                    status: true,
                    msg: 'Produto atualizado com sucesso'
                });
            } else {
                return response.status(500).send({
                    status: false,
                    msg: 'Erro ao atualizar produto'
                });
            }
        } catch (error) {
            console.error('Erro ao atualizar produto:', error);
            return response.status(500).send({
                status: false,
                msg: 'Erro interno ao atualizar produto'
            });
        }
    }

    /**
     * Remove um produto
     * @param {Object} request - Objeto de requisição HTTP
     * @param {Object} response - Objeto de resposta HTTP
     */
    async delete(request, response) {
        try {
            const { id } = request.params;
            const produto = new Produto();
            produto._idProduto = id;
            
            const deletado = await produto.delete();
            
            if (deletado) {
                return response.status(200).send({
                    status: true,
                    msg: 'Produto removido com sucesso'
                });
            } else {
                return response.status(404).send({
                    status: false,
                    msg: 'Produto não encontrado'
                });
            }
        } catch (error) {
            console.error('Erro ao remover produto:', error);
            return response.status(500).send({
                status: false,
                msg: 'Erro ao remover produto'
            });
        }
    }
    async readAllJSON(request, response) {
        try {
            const produtos = await Produtos.find().lean();
            res.status(200).json(produtos);
        } catch (error) {
            res.status(500).json({ erro: 'Erro ao buscar produtos.' });
        }
    }
};