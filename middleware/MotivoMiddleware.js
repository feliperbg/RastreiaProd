/**
 * Middleware para validar os dados de criação e atualização de Motivos.
 * Não utiliza express-validator.
 */
module.exports = class MotivoMiddleware {
    static validate(req, res, next) {
        const { descricao, tipo } = req.body;
        const errors = [];

        // Validação da Descrição
        if (!descricao || typeof descricao !== 'string' || descricao.trim() === '') {
            errors.push({ descricao: 'A descrição é obrigatória.' });
        } else if (descricao.trim().length < 3) {
            errors.push({ descricao: 'A descrição deve ter no mínimo 3 caracteres.' });
        }

        // Validação do Tipo
        const tiposValidos = ['PAUSA', 'CANCELAMENTO', 'REFUGO', 'OUTRO'];
        if (!tipo || typeof tipo !== 'string' || tipo.trim() === '') {
            errors.push({ tipo: 'O tipo é obrigatório.' });
        } else if (!tiposValidos.includes(tipo.trim().toUpperCase())) {
            errors.push({ tipo: `Tipo de motivo inválido. Valores aceitos: ${tiposValidos.join(', ')}` });
        }

        if (errors.length > 0) {
            return res.status(422).json({
                status: false,
                msg: 'Erro de validação.',
                errors: errors,
            });
        }

        // Limpa e padroniza os dados antes de prosseguir
        req.body.descricao = req.body.descricao.trim();
        req.body.tipo = req.body.tipo.trim().toUpperCase();

        return next();
    }

    static validateCreate = this.validate;
    static validateUpdate = this.validate;
};