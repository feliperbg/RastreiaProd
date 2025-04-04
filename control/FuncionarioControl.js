const express = require('express');
const Funcionario = require('../model/Funcionario');
const TokenJWT = require('../model/TokenJWT');

module.exports = class FuncionarioControl {
    async login(request, response) {
        const funcionario = new Funcionario();
        funcionario.credencial = request.body.Funcionario.credencial;
        funcionario.senha = request.body.Funcionario.senha;
    
        const logou = await funcionario.login();
        
        if (logou) {
            const payloadToken = {
                credencialFuncionario: funcionario.credencial,
                idFuncionario: funcionario.idFuncionario,
                role: funcionario.role,
            };

            const jwt = new TokenJWT();
            const token_string = jwt.gerarToken(payloadToken);

            // 🔒 Envia o token como cookie HTTPOnly (seguro e invisível ao JS do navegador)
            response.cookie("authToken", token_string, {
                httpOnly: true,
                maxAge: 1000 * 60 * 60 * 24 * 30, // 30 dias
                sameSite: "Lax", // Evita CSRF básico
                secure: false // Coloque `true` se estiver usando HTTPS
            });

            const objResposta = {
                status: true,
                cod: 1,
                msg: 'Logado com sucesso',
                Funcionario: {
                    idFuncionario: funcionario.idFuncionario,
                    credencialFuncionario: funcionario.credencial,
                    role: funcionario.role,
                }
            };

            return response.status(200).send(objResposta);
        } else {
            return response.status(401).send({
                status: false,
                msg: 'Usuário ou senha inválidos',
            });
        }
    }
};
