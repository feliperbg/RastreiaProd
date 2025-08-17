// Arquivo: middleware/OrdemProducaoMiddleware.js
const mongoose = require('mongoose');

module.exports = class OrdemProducaoMiddleware {
    static validateCreate(req, res, next) {
        const { produto, quantidade } = req.body;

        if (produto && mongoose.Types.ObjectId.isValid(produto) && quantidade != null) {
           return next();
        }

        let erros = [];
        if (!produto) {
            erros.push('O ID do produto é obrigatório.');
        } else if (!mongoose.Types.ObjectId.isValid(produto)) {
            erros.push('O ID do produto é inválido.');
        }
        if (quantidade == null) {
            erros.push('A quantidade é obrigatória.');
        }

        return res.status(400).json({
            status: false,
            msg: `Erros na requisição: ${erros.join(' ')}`
        });
    }
};