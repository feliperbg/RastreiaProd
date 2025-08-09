const Etapa = require('../model/EtapasTabela');

module.exports = class EtapaControl {
    // Criação de uma nova etapa
    async add(req, res, next) {
        try {
            const novaEtapa = await Etapa.create(req.body);
            res.status(201).json({ status: true, etapa: novaEtapa });
        } catch (error) {
            if (error.name === 'ValidationError') error.statusCode = 400;
            next(error);
        }
    }

    // Atualiza os dados de uma etapa
    async update(req, res, next) {
        try {
            const etapa = await Etapa.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
            if (!etapa) {
                const error = new Error('Etapa não encontrada.');
                error.statusCode = 404;
                return next(error);
            }
            res.status(200).json({ status: true, etapa });
        } catch (error) {
            if (error.name === 'ValidationError') error.statusCode = 400;
            next(error);
        }
    }

    // Retorna uma etapa específica pelo ID
    async getById(req, res, next) {
        try {
            const etapa = await Etapa.findById(req.params.id);
            if (!etapa) {
                const error = new Error('Etapa não encontrada.');
                error.statusCode = 404;
                return next(error);
            }
            res.status(200).json({ status: true, etapa });
        } catch (error) {
            next(error);
        }
    }

    // Retorna todas as etapas
    async getAll(req, res, next) {
        try {
            const etapas = await Etapa.find({});
            res.status(200).json({ status: true, etapas });
        } catch (error) {
            next(error);
        }
    }

    // Deleta uma etapa pelo ID
    async delete(req, res, next) {
        try {
            const etapa = await Etapa.findByIdAndDelete(req.params.id);
            if (!etapa) {
                const error = new Error('Etapa não encontrada.');
                error.statusCode = 404;
                return next(error);
            }
            res.status(200).json({ status: true, msg: "Etapa removida." });
        } catch (error) {
            next(error);
        }
    }
};
