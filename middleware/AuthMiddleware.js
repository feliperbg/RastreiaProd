module.exports = class AuthMiddleware {
    static checkRole(rolesPermitidas) {
        return (req, res, next) => {
            // req.user é anexado pelo TokenJWTMiddleware
            const { role } = req.user; 

            if (!rolesPermitidas.includes(role)) {
                return res.status(403).json({ 
                    status: false, 
                    msg: 'Acesso negado. Você não tem permissão para esta ação.' 
                });
            }
            next(); // Permissão concedida
        };
    }
}