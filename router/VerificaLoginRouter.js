const express = require('express');
const verificarToken = require('../middleware/verificarToken');
const router = express.Router();

router.get('/verifica-login', verificarToken, (req, res) => {
    return res.status(200).send({
        status: true,
        msg: "Login ainda válido",
        funcionario: {
            idFuncionario: req.funcionario.idFuncionario,
            credencialFuncionario: req.funcionario.credencialFuncionario,
            role: req.funcionario.role
        }
    });
});

module.exports = router;
// Este código define uma rota GET para verificar o status de login do usuário.
