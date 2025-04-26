const express = require('express');
const path = require('path');
const ComponenteControl = require('../control/ComponenteControl');
const JWTMiddleware = require('../middleware/TokenJWTMiddleware');

module.exports = class ComponenteRouter {
    constructor() {
        this.router = express.Router();
        this.componenteControl = new ComponenteControl();
        this.jwtMiddleware = new JWTMiddleware();
        this.createRoutes();
    }

    createRoutes() {
        // Rota estática
        this.router.get('/', (req, res) => {
            res.render('componente');
        });

        // Rotas protegidas por JWT (forma correta)
        this.router.post('/',
            (req, res) => this.componenteControl.create(req, res)
        );

        this.router.get('/readALL',
            (req, res, next) => this.jwtMiddleware.validate(req, res, next),
            (req, res) => this.componenteControl.readAll(req, res)
        );

        this.router.get('/:id',
            (req, res, next) => this.jwtMiddleware.validate(req, res, next),
            (req, res) => this.componenteControl.readByID(req, res)
        );

        this.router.delete('/:id',
            (req, res, next) => this.jwtMiddleware.validate(req, res, next),
            (req, res) => this.componenteControl.delete(req, res)
        );

        this.router.put('/:id',
            (req, res, next) => this.jwtMiddleware.validate(req, res, next),
            (req, res) => this.componenteControl.update(req, res)
        );

        return this.router;
    }
}