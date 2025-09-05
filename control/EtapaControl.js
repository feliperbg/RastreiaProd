const Etapa = require('../model/Etapa');
const Produto = require('../model/Produto');

module.exports = class EtapaController {

    /**
     * Cria uma nova etapa e a associa a um produto.
     */
    static async create(req, res) {
        try {
            const { produto: produtoId, ...etapaData } = req.body;

            if (!produtoId) {
                return res.status(400).json({ status: false, msg: 'O ID do produto é obrigatório.' });
            }

            const novaEtapa = await Etapa.create({ ...etapaData, produto: produtoId });

            // Adiciona a nova etapa ao array de etapas do produto correspondente
            await Produto.findByIdAndUpdate(produtoId, { $push: { etapas: novaEtapa._id } });

            return res.status(201).json({ status: true, msg: 'Etapa criada e associada ao produto com sucesso!', etapa: novaEtapa });
        } catch (error) {
            console.error("Erro ao criar etapa:", error);
            return res.status(500).json({ status: false, msg: 'Erro interno no servidor.', error: error.message });
        }
    }

    /**
     * Lista todas as etapas de todos os produtos.
     */
    static async readAll(req, res) {
        try {
            const etapas = await Etapa.find().populate('produto', 'nome');
            return res.status(200).json({ status: true, etapas });
        } catch (error) {
            return res.status(500).json({ status: false, msg: 'Erro ao listar etapas.' });
        }
    }

    /**
     * Lista todas as etapas de um produto específico.
     */
    static async readByProduto(req, res) {
        try {
            const { produtoId } = req.params;
            const etapas = await Etapa.find({ produto: produtoId })
                .populate('departamentoResponsavel', 'nome')
                .populate('componenteConclusao', 'nome')
                .populate('funcionariosResponsaveis', 'nome')
                .sort('sequencias');
            return res.status(200).json({ status: true, etapas });
        } catch (error) {
            return res.status(500).json({ status: false, msg: 'Erro ao listar etapas do produto.' });
        }
    }

    /**
     * Busca uma única etapa pelo seu ID.
     */
    static async readByID(req, res) {
        try {
            const { id } = req.params;
            const etapa = await Etapa.findById(id)
                .populate('componenteConclusao', 'nome')
                .populate('funcionariosResponsaveis', 'nome')
                .populate('departamentoResponsavel', 'nome');

            if (!etapa) {
                return res.status(404).json({ status: false, msg: 'Etapa não encontrada.' });
            }
            return res.status(200).json({ status: true, etapa });
        } catch (error) {
            return res.status(500).json({ status: false, msg: 'Erro ao buscar etapa.', error: error.message });
        }
    }

    /**
     * Atualiza uma etapa existente.
     */
    static async update(req, res) {
        try {
            const { id } = req.params;
            const dadosAtualizacao = req.body;

            // Impede que o campo 'produto' seja alterado nesta rota
            delete dadosAtualizacao.produto;

            const etapaAtualizada = await Etapa.findByIdAndUpdate(id, dadosAtualizacao, { new: true, runValidators: true });

            if (!etapaAtualizada) {
                return res.status(404).json({ status: false, msg: 'Etapa não encontrada.' });
            }

            return res.status(200).json({ status: true, msg: 'Etapa atualizada com sucesso!', etapa: etapaAtualizada });
        } catch (error) {
            console.error("Erro ao atualizar etapa:", error);
            if (error.name === 'ValidationError') {
                return res.status(400).json({ status: false, msg: error.message });
            }
            return res.status(500).json({ status: false, msg: 'Erro interno no servidor.' });
        }
    }

    /**
     * Deleta uma etapa e a remove da lista do produto associado.
     */
    static async delete(req, res) {
        try {
            const { id } = req.params;
            const etapaDeletada = await Etapa.findByIdAndDelete(id);

            if (!etapaDeletada) {
                return res.status(404).json({ status: false, msg: 'Etapa não encontrada.' });
            }
            await Produto.findByIdAndUpdate(etapaDeletada.produto, { $pull: { etapas: id } });
            return res.status(200).json({ status: true, msg: 'Etapa removida com sucesso!' });
        } catch (error) {
            return res.status(500).json({ status: false, msg: 'Erro ao remover etapa.' });
        }
    }
}