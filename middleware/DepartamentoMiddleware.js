module.exports = class DepartamentoMiddleware {
    static validateCreate(req, res, next) {
        const {nome} = req.body;

        if (nome != null && nome != '' && nome != undefined & nome.length > 3) {
            return next();
        }

        return res.status(400).json({
            status: false,
            msg: `Campo Nome obrigatório faltando.`
        });
    }
};