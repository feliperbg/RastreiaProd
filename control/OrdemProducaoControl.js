const OrdemProducao = require('../model/OrdemProducaoTabela');

module.exports = class OrdemProducaoControl {
    async add(req, res, next) {
        try {
            const novaOrdem = await OrdemProducao.create(req.body);
            res.status(201).json({ status: true, ordemProducao: novaOrdem });
        } catch (error) {
            if (error.name === 'ValidationError') error.statusCode = 400;
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const ordem = await OrdemProducao.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
            if (!ordem) {
                const error = new Error('Ordem de Produção não encontrada.');
                error.statusCode = 404;
                return next(error);
            }
            res.status(200).json({ status: true, ordemProducao: ordem });
        } catch (error) {
            if (error.name === 'ValidationError') error.statusCode = 400;
            next(error);
        }
    }

    async getById(req, res, next) {
        try {
            const ordem = await OrdemProducao.findById(req.params.id).populate('produto').populate('etapa.etapa').populate('funcionarioAtivo.funcionario');
            if (!ordem) {
                const error = new Error('Ordem de Produção não encontrada.');
                error.statusCode = 404;
                return next(error);
            }
            res.status(200).json({ status: true, ordemProducao: ordem });
        } catch (error) {
            next(error);
        }
    }

    async getAll(req, res, next) {
        try {
            const ordens = await OrdemProducao.find({}).populate('produto');
            res.status(200).json({ status: true, ordensProducao: ordens });
        } catch (error) {
            next(error);
        }
    }

    async delete(req, res, next) {
        try {
            const ordem = await OrdemProducao.findByIdAndDelete(req.params.id);
            if (!ordem) {
                const error = new Error('Ordem de Produção não encontrada.');
                error.statusCode = 404;
                return next(error);
            }
            res.status(200).json({ status: true, msg: "Ordem de Produção removida." });
        } catch (error) {
            next(error);
        }
    }
};