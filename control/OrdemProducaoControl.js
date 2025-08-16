const OrdemProducao = require('../model/OrdemProducao');
const Produto = require('../model/Produto');

module.exports = class OrdemProducaoController {
    static async create(req, res) {
        try {
            const { produtoId, quantidade } = req.body;

            // Lógica para verificar se há componentes suficientes pode ser adicionada aqui
            // Ex: buscar o produto, seus componentes necessários vs. estoque de componentes

            const novaOrdem = await OrdemProducao.create({ produto: produtoId, quantidade });
            return res.status(201).json({ status: true, msg: 'Ordem de produção criada!', ordem: novaOrdem });
        } catch (error) {
            return res.status(400).json({ status: false, msg: error.message });
        }
    }

    static async readAll(req, res) {
        try {
            const ordens = await OrdemProducao.find()
                .populate('produto', 'nome codigo')
                .populate('etapaAtual', 'nome')
                .sort('-createdAt');
            return res.status(200).json({ status: true, ordens });
        } catch (error) {
            return res.status(500).json({ status: false, msg: 'Erro ao listar ordens de produção.' });
        }
    }

    static async readByID(req, res) {
        try {
            const { id } = req.params;
            const ordem = await OrdemProducao.findById(id)
                .populate('produto')
                .populate('etapaAtual');

            if (!ordem) {
                return res.status(404).json({ status: false, msg: 'Ordem de produção não encontrada.' });
            }

            return res.status(200).json({ status: true, ordem });
        } catch (error) {
            return res.status(500).json({ status: false, msg: 'Erro ao buscar ordem de produção.' });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const dadosAtualizacao = req.body;

            const ordemAtualizada = await OrdemProducao.findByIdAndUpdate(id, dadosAtualizacao, { new: true, runValidators: true });

            if (!ordemAtualizada) {
                return res.status(404).json({ status: false, msg: 'Ordem de produção não encontrada.' });
            }

            return res.status(200).json({ status: true, msg: 'Ordem atualizada!', ordem: ordemAtualizada });
        } catch (error) {
            return res.status(400).json({ status: false, msg: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            // Em um sistema real, talvez seja melhor "cancelar" do que deletar
            const ordemDeletada = await OrdemProducao.findByIdAndDelete(id);

            if (!ordemDeletada) {
                return res.status(404).json({ status: false, msg: 'Ordem de produção não encontrada.' });
            }

            return res.status(200).json({ status: true, msg: 'Ordem removida!' });
        } catch (error) {
            return res.status(500).json({ status: false, msg: 'Erro ao remover ordem de produção.' });
        }
    }
}