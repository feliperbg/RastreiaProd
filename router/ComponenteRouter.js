const express = require('express');
const ComponenteControl = require('../control/ComponenteControl');
const JWTMiddleware = require('../middleware/TokenJWTMiddleware');

module.exports = class ComponenteRouter {
    constructor() {
        this.router = express.Router();
        this.componenteController = new ComponenteControl();
        this.jwtMiddleware = new JWTMiddleware();
    }

    createRoutes() {
        this.router.post('/', this.jwtMiddleware.validate.bind(this.jwtMiddleware), (req, res, next) => this.componenteController.add(req, res, next));
        this.router.put('/:id', this.jwtMiddleware.validate.bind(this.jwtMiddleware), (req, res, next) => this.componenteController.update(req, res, next));
        this.router.get('/:id', this.jwtMiddleware.validate.bind(this.jwtMiddleware), (req, res, next) => this.componenteController.getById(req, res, next));
        this.router.get('/', this.jwtMiddleware.validate.bind(this.jwtMiddleware), (req, res, next) => this.componenteController.getAll(req, res, next));
        this.router.delete('/:id', this.jwtMiddleware.validate.bind(this.jwtMiddleware), (req, res, next) => this.componenteController.delete(req, res, next));
        return this.router;
    }
};