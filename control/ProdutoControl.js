const Produto = require('../model/ProdutosTabela');

module.exports = class ProdutoControl {
    async add(req, res, next) {
        try {
            const novoProduto = await Produto.create(req.body);
            res.status(201).json({ status: true, produto: novoProduto });
        } catch (error) {
            if (error.name === 'ValidationError') error.statusCode = 400;
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const produto = await Produto.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
            if (!produto) {
                const error = new Error('Produto não encontrado.');
                error.statusCode = 404;
                return next(error);
            }
            res.status(200).json({ status: true, produto });
        } catch (error) {
            if (error.name === 'ValidationError') error.statusCode = 400;
            next(error);
        }
    }

    async getById(req, res, next) {
        try {
            const produto = await Produto.findById(req.params.id).populate('componentes.componente').populate('etapas.etapa');
            if (!produto) {
                const error = new Error('Produto não encontrado.');
                error.statusCode = 404;
                return next(error);
            }
            res.status(200).json({ status: true, produto });
        } catch (error) {
            next(error);
        }
    }

    async getAll(req, res, next) {
        try {
            const produtos = await Produto.find({});
            res.status(200).json({ status: true, produtos });
        } catch (error) {
            next(error);
        }
    }

    async delete(req, res, next) {
        try {
            const produto = await Produto.findByIdAndDelete(req.params.id);
            if (!produto) {
                const error = new Error('Produto não encontrado.');
                error.statusCode = 404;
                return next(error);
            }
            res.status(200).json({ status: true, msg: "Produto removido." });
        } catch (error) {
            next(error);
        }
    }
};