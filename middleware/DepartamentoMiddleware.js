module.exports = class DepartamentoMiddleware {
    static validateCreate(req, res, next) {
        const { nome } = req.body;

        if (nome != null && nome !== '' && nome.length > 3) { //
            return next();
        }

        return res.status(400).json({
            status: false,
            msg: `Campo Nome obrigatório faltando ou inválido.` //
        });
    }


    static validateUpdate(req, res, next) {
        const { nome } = req.body;

        // Se o campo 'nome' foi enviado, valida ele
        if (nome != null && (nome === '' || nome.length <= 3)) {
            return res.status(400).json({
                status: false,
                msg: `O campo Nome não pode ser vazio e deve ter mais de 3 caracteres.`
            });
        }
        
        next();
    }
};