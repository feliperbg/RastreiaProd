const OrdemProducao = require('../model/OrdemProducao');

module.exports = class OrdemProducaoControl {
    /**
     * Cria uma nova ordem de produção
     */
    async create(request, response) {
        try {
            const {
                status,
                produto,
                etapa,
                funcionarioAtivo,
                timestampProducao
            } = request.body;

            const novaOrdem = new OrdemProducao(
                status,
                produto,
                etapa || [],
                funcionarioAtivo || [],
                timestampProducao || {}
            );

            const criada = await novaOrdem.create();

            if (criada) {
                return response.status(201).send({
                    status: true,
                    msg: 'Ordem de produção criada com sucesso',
                    ordem: {
                        id: novaOrdem.idOrdem,
                        produto: novaOrdem.produto
                    }
                });
            } else {
                return response.status(500).send({
                    status: false,
                    msg: 'Erro ao criar ordem de produção'
                });
            }
        } catch (error) {
            console.error('Erro ao criar ordem de produção:', error);
            return response.status(500).send({
                status: false,
                msg: 'Erro interno ao criar ordem de produção'
            });
        }
    }

    /**
     * Lista todas as ordens de produção
     */
    async readAll(request, response) {
        try {
            const ordem = new OrdemProducao();
            const ordens = await ordem.readAll();

            return response.status(200).send({
                status: true,
                ordens: ordens,
            });
        } catch (error) {
            console.error('Erro ao listar ordens de produção:', error);
            return response.status(500).send({
                status: false,
                msg: 'Erro ao listar ordens de produção'
            });
        }
    }

    /**
     * Obtém uma ordem de produção específica por ID
     */
    async readByID(request, response) {
        try {
            const { id } = request.params;
            const ordem = new OrdemProducao();
            const encontrada = await ordem.readByID(id);

            if (encontrada) {
                return response.status(200).send({
                    status: true,
                    ordem: encontrada
                });
            } else {
                return response.status(404).send({
                    status: false,
                    msg: 'Ordem de produção não encontrada'
                });
            }
        } catch (error) {
            console.error('Erro ao buscar ordem de produção:', error);
            return response.status(500).send({
                status: false,
                msg: 'Erro ao buscar ordem de produção'
            });
        }
    }

    /**
     * Atualiza uma ordem de produção existente
     */
    async update(request, response) {
        try {
            const { id } = request.params;
            const dadosAtualizacao = request.body;

            const ordem = new OrdemProducao();
            await ordem.readByID(id);

            // Atualiza apenas os campos permitidos
            if (dadosAtualizacao.status !== undefined) ordem.status = dadosAtualizacao.status;
            if (dadosAtualizacao.produto) ordem.produto = dadosAtualizacao.produto;
            if (dadosAtualizacao.etapa) ordem.etapa = dadosAtualizacao.etapa;
            if (dadosAtualizacao.funcionarioAtivo) ordem.funcionarioAtivo = dadosAtualizacao.funcionarioAtivo;
            if (dadosAtualizacao.timestampProducao) ordem.timestampProducao = dadosAtualizacao.timestampProducao;

            const atualizado = await ordem.update();

            if (atualizado) {
                return response.status(200).send({
                    status: true,
                    msg: 'Ordem de produção atualizada com sucesso'
                });
            } else {
                return response.status(500).send({
                    status: false,
                    msg: 'Erro ao atualizar ordem de produção'
                });
            }
        } catch (error) {
            console.error('Erro ao atualizar ordem de produção:', error);
            return response.status(500).send({
                status: false,
                msg: 'Erro interno ao atualizar ordem de produção'
            });
        }
    }

    /**
     * Remove uma ordem de produção
     */
    async delete(request, response) {
        try {
            const { id } = request.params;
            const ordem = new OrdemProducao();
            ordem.idOrdem = id;

            const deletada = await ordem.delete();

            if (deletada) {
                return response.status(200).send({
                    status: true,
                    msg: 'Ordem de produção removida com sucesso'
                });
            } else {
                return response.status(404).send({
                    status: false,
                    msg: 'Ordem de produção não encontrada'
                });
            }
        } catch (error) {
            console.error('Erro ao remover ordem de produção:', error);
            return response.status(500).send({
                status: false,
                msg: 'Erro ao remover ordem de produção'
            });
        }
    }
};