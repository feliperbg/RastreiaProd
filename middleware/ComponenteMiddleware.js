// Arquivo: middleware/ComponenteMiddleware.js
module.exports = class ComponenteMiddleware {
    static validateCreate(req, res, next) {
        const { nome, codigo, quantidade, precoUnidade } = req.body;

        if (nome && codigo && quantidade != null && precoUnidade != null) {
            return next(); // Todos os campos obrigatórios estão presentes
        }

        let camposFaltando = [];
        if (!nome) camposFaltando.push('nome');
        if (!codigo) camposFaltando.push('codigo');
        if (quantidade == null) camposFaltando.push('quantidade');
        if (precoUnidade == null) camposFaltando.push('precoUnidade');

        return res.status(400).json({
            status: false,
            msg: `Campos obrigatórios faltando: ${camposFaltando.join(', ')}.`
        });
    }
};