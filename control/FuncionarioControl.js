const express = require('express');
const Funcionario = require('../model/Funcionario');
const TokenJWT = require('../model/TokenJWT');

module.exports = class FuncionarioControl {
    async login(request, response) {
        const funcionario = new Funcionario();
        funcionario.credencial = request.body.Funcionario.credencial;
        funcionario.senha = request.body.Funcionario.senha;
        funcionario.role = request.body.Funcionario.role;
        const logou = await funcionario.login();
                                                                                                                                                                                                                                                                                                                                                    
        if (logou) {
            // Payload para o token JWT
            const payloadToken = {
                credencialFuncionario: funcionario.credencial,
                idFuncionario: funcionario.idFuncionario,
                role: funcionario.role,
            };

            // Gera o token JWT
            const jwt = new TokenJWT();
            const token_string = jwt.gerarToken(payloadToken);

            // Resposta de sucesso
            const objResposta = {
                status: true,
                cod: 1,
                msg: 'Logado com sucesso',
                Funcionario: {
                    idFuncionario: funcionario.idFuncionario,
                    credencialFuncionario: funcionario.credencial,
                    role: funcionario.role,
                },
                token: token_string,
            };
            return response.status(200).send(objResposta);
        } else {
            // Resposta de falha
            const objResposta = {
                status: false,
                msg: 'Usuário ou senha inválidos',
            };
            return response.status(401).send(objResposta);
        }
    }
};