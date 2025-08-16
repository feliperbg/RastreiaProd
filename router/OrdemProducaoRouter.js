const express = require('express');
const path = require('path');
const OrdemControl = require('../control/OrdemProducaoControl');
const JWTMiddleware = require('../middleware/TokenJWTMiddleware');

module.exports = class OrdemProducaoRouter {
    constructor() {
        this.router = express.Router();
        this.ordemControl = new OrdemControl();
        this.jwtMiddleware = new JWTMiddleware();
        this.createRoutes();
    }

    createRoutes() {
        // Rota estática
        this.router.get('/', (req, res) => {
            res.render('main/ordem-producao');
        });

        this.router.get('/editar-ordem/:id', (req, res) => {
            // Verifica se o token existe na requisição
            res.sendFile(path.join(__dirname, '..', 'view', 'edit', 'editar-ordem-producao.html')); // Caminho absoluto
        });

        this.router.get('/adicionar-ordem', (req, res) => {
            res.sendFile(path.join(__dirname, '..', 'view', 'add', 'adicionar-ordem-producao.html'));
        });

        // Rotas protegidas por JWT (forma correta)
        this.router.post('/',
            (req, res) => this.ordemControl.create(req, res)
        );

        this.router.get('/readALL',
            (req, res, next) => this.jwtMiddleware.validate(req, res, next),
            (req, res) => this.ordemControl.readAll(req, res)
        );

        this.router.get('/:id',
            (req, res, next) => this.jwtMiddleware.validate(req, res, next),
            (req, res) => this.ordemControl.readByID(req, res)
        );

        this.router.delete('/:id',
            (req, res, next) => this.jwtMiddleware.validate(req, res, next),
            (req, res) => this.ordemControl.delete(req, res)
        );

        this.router.put('/:id',
            (req, res, next) => this.jwtMiddleware.validate(req, res, next),
            (req, res) => this.ordemControl.update(req, res)
        );

        // routes/ordens.js
        this.router.get('/json', async (req, res) => {
            (req, res) => this.ordemControl.update(req, res),
            (req, res) => this.ordemControl.readAllJSON(req, res)
        });

        return this.router;
    }
}