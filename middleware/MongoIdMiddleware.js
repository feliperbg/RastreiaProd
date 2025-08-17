// Arquivo: middleware/MongoIdMiddleware.js
const mongoose = require('mongoose');

module.exports = class MongoIdMiddleware {

    /**
     * Valida um único parâmetro de ID na rota.
     * @param {string} paramName - O nome do parâmetro a ser validado (ex: 'id', 'etapaId').
     * @returns {function} - Um middleware do Express.
     */
    static validateParam(paramName) {
        return (req, res, next) => {
            const id = req.params[paramName];
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ status: false, msg: `O ID fornecido para '${paramName}' é inválido.` });
            }
            next();
        };
    }

    /**
     * Valida múltiplos parâmetros de ID na rota.
     * @param {string[]} paramNamesArray - Um array com os nomes dos parâmetros (ex: ['id', 'etapaId']).
     * @returns {function} - Um middleware do Express.
     */
    static validateParams(paramNamesArray) {
        return (req, res, next) => {
            for (const paramName of paramNamesArray) {
                const id = req.params[paramName];
                if (!mongoose.Types.ObjectId.isValid(id)) {
                    return res.status(400).json({ status: false, msg: `O ID fornecido para '${paramName}' é inválido.` });
                }
            }
            next();
        };
    }
};