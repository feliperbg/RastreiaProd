// Importa a classe de modelo Componente
const Componente = require('../model/ComponentesTabela');

// Exporta a classe controladora de componentes
module.exports = class ComponenteControl {
    // Método para criar um novo componente
    async add(req, res, next) {
        try {
            const novoComponente = await Componente.create(req.body);
            res.status(201).json({ status: true, componente: novoComponente });
        } catch (error) {
            if (error.name === 'ValidationError') error.statusCode = 400;
            next(error);
        }
    }

    // Método para atualizar um componente existente
    async update(req, res, next) {
        try {
            const componente = await Componente.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
            if (!componente) {
                const error = new Error('Componente não encontrado.');
                error.statusCode = 404;
                return next(error);
            }
            res.status(200).json({ status: true, componente });
        } catch (error) {
            if (error.name === 'ValidationError') error.statusCode = 400;
            next(error);
        }
    }

    // Método para buscar um componente pelo ID
    async getById(req, res, next) {
        try {
            const componente = await Componente.findById(req.params.id);
            if (!componente) {
                const error = new Error('Componente não encontrado.');
                error.statusCode = 404;
                return next(error);
            }
            res.status(200).json({ status: true, componente });
        } catch (error) {
            next(error);
        }
    }

    // Método para buscar todos os componentes
    async getAll(req, res, next) {
        try {
            const componentes = await Componente.find({});
            res.status(200).json({ status: true, componentes });
        } catch (error) {
            next(error);
        }
    }

    // Método para deletar um componente pelo ID
    async delete(req, res, next) {
        try {
            const componente = await Componente.findByIdAndDelete(req.params.id);
            if (!componente) {
                const error = new Error('Componente não encontrado.');
                error.statusCode = 404;
                return next(error);
            }
            res.status(200).json({ status: true, msg: "Componente removido." });
        } catch (error) {
            next(error);
        }
    }
};

