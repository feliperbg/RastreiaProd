// Arquivo: middleware/ComponenteMiddleware.js

module.exports = class ComponenteMiddleware {
    static validateCreate(req, res, next) {
        const { nome, codigo, quantidade, preco } = req.body;

        if (nome && codigo && quantidade != null && preco != null) {
            return next(); // Todos os campos obrigatórios estão presentes
        }

        let camposFaltando = [];
        if (!nome) camposFaltando.push('nome');
        if (!codigo) camposFaltando.push('codigo');
        if (quantidade == null) camposFaltando.push('quantidade');
        if (preco == null) camposFaltando.push('preco');

        return res.status(400).json({
            status: false,
            msg: `Campos obrigatórios faltando: ${camposFaltando.join(', ')}.`
        });
    }
};