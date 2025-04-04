const express = require('express');
const FuncionarioControl = require('../control/FuncionarioControl');

module.exports = class FuncionarioRouter {
    constructor() {
        this._router = express.Router();
        this._funcionarioControl = new FuncionarioControl();
    }

    createRoutes() {
        this._router.post('/', (req, res) => {
            const { credencial, senha } = req.body;

            // Simulação de login bem-sucedido
            if (credencial === '123456' && senha === 'senha1234') {
                // Criar um token (exemplo simples)
                const dadosUsuario = localStorage.getItem("dados");
                dadosUsuario = JSON.parse(dadosUsuario);
                token = dadosUsuario.token;

                // Configurar o cookie seguro
                res.cookie('auth_token', token, {
                    httpOnly: true, // Impede acesso via JavaScript
                    secure: false, // Altere para true se usar HTTPS
                    sameSite: 'Strict' // Protege contra CSRF
                });

                return res.json({ status: true, msg: "Logado com sucesso" });
            } else {
                return res.status(401).json({ status: false, msg: "Credenciais inválidas" });
            }
        });

        return this._router;
    }
};
