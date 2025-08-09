const express = require('express');
const path = require('path');
const FuncionarioControl = require('../control/FuncionarioControl');
const JWTMiddleware = require('../middleware/TokenJWTMiddleware');

module.exports = class FuncionarioRouter {
    constructor() {
        this.router = express.Router();
        this.funcionarioController = new FuncionarioControl();
        this.jwtMiddleware = new JWTMiddleware();
    }

    createRoutes() {
        // Rotas públicas (sem autenticação)
        this.router.post('/login', (req, res, next) => this.funcionarioController.login(req, res, next));
        this.router.post('/logout', this.jwtMiddleware.validate.bind(this.jwtMiddleware), (req, res, next) => this.funcionarioController.logout(req, res, next));
        
        // Rota de verificação de login
        this.router.get('/verifica-login', 
            this.jwtMiddleware.validate.bind(this.jwtMiddleware), 
            (req, res) => {
                return res.status(200).json({ status: true, msg: "Usuário autenticado" });
            }
        );

        // Rota para a API (deve vir antes do render da página)
        this.router.get('/lista', 
            this.jwtMiddleware.validate.bind(this.jwtMiddleware), 
            (req, res, next) => this.funcionarioController.getAll(req, res, next)
        );

        // Demais rotas da API
        this.router.get('/buscar/:id', this.jwtMiddleware.validate.bind(this.jwtMiddleware), (req, res, next) => this.funcionarioController.getById(req, res, next));
        this.router.post('/novo', this.jwtMiddleware.validate.bind(this.jwtMiddleware), (req, res, next) => this.funcionarioController.add(req, res, next));
        this.router.put('/editar/:id', this.jwtMiddleware.validate.bind(this.jwtMiddleware), (req, res, next) => this.funcionarioController.update(req, res, next));
        this.router.delete('/remover/:id', this.jwtMiddleware.validate.bind(this.jwtMiddleware), (req, res, next) => this.funcionarioController.delete(req, res, next));

        // Rota para renderizar a página de edição
        this.router.get('/editar/:id',
            (req, res) => {
                res.render('edit/editar-funcionario', {
                    id: req.params.id
                });
            }
        );
        // Rota para renderizar a página (deve vir por último)
        this.router.get('/',
            (req, res) => {
                res.render('funcionario');
            }
        );

        return this.router;
    }
};