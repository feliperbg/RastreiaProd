// Arquivo: middleware/EtapaMiddleware.js

module.exports = class EtapaMiddleware {
    static validateCreate(req, res, next) {
        const { nome, ordem } = req.body;

        if (nome && ordem != null) {
            return next();
        }

        let camposFaltando = [];
        if (!nome) camposFaltando.push('nome');
        if (ordem == null) camposFaltando.push('ordem');

        return res.status(400).json({
            status: false,
            msg: `Campos obrigatórios faltando: ${camposFaltando.join(', ')}.`
        });
    }
};