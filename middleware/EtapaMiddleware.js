// Arquivo: middleware/EtapaMiddleware.js
module.exports = class EtapaMiddleware {
    static validateCreate(req, res, next) {
        const { nome, sequencias } = req.body;

        if (nome && sequencias != null) {
            return next();
        }

        let camposFaltando = [];
        if (!nome) camposFaltando.push('nome');
        if (sequencias == null) camposFaltando.push('sequencias');

        return res.status(400).json({
            status: false,
            msg: `Campos obrigatórios faltando: ${camposFaltando.join(', ')}.`
        });
    }
};