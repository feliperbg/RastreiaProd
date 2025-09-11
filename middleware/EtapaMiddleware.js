// Arquivo: middleware/EtapaMiddleware.js
module.exports = class EtapaMiddleware {
    static validateCreate(req, res, next) {
        const { nome, sequencias } = req.body;

        if (nome && sequencias != null) { //
            return next();
        }

        let camposFaltando = [];
        if (!nome) camposFaltando.push('nome'); //
        if (sequencias == null) camposFaltando.push('sequencias'); //

        return res.status(400).json({
            status: false,
            msg: `Campos obrigatórios faltando: ${camposFaltando.join(', ')}.` //
        });
    }


    static validateUpdate(req, res, next) {
        const { nome, sequencias } = req.body;

        if (nome === '') {
             return res.status(400).json({ status: false, msg: 'O campo "nome" não pode ser vazio.' });
        }
        if (sequencias != null && isNaN(Number(sequencias))) {
            return res.status(400).json({ status: false, msg: 'O campo "sequencias" deve ser um número.' });
        }

        next();
    }
};