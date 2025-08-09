const express = require('express');
const OrdemProducaoControl = require('../control/OrdemProducaoControl');
const JWTMiddleware = require('../middleware/TokenJWTMiddleware');

module.exports = class OrdemProducaoRouter {
    constructor() {
        this.router = express.Router();
        this.ordemProducaoController = new OrdemProducaoControl();
        this.jwtMiddleware = new JWTMiddleware();
    }

    createRoutes() {
        this.router.post('/', this.jwtMiddleware.validate.bind(this.jwtMiddleware), (req, res, next) => this.ordemProducaoController.add(req, res, next));
        this.router.put('/:id', this.jwtMiddleware.validate.bind(this.jwtMiddleware), (req, res, next) => this.ordemProducaoController.update(req, res, next));
        this.router.get('/:id', this.jwtMiddleware.validate.bind(this.jwtMiddleware), (req, res, next) => this.ordemProducaoController.getById(req, res, next));
        this.router.get('/', this.jwtMiddleware.validate.bind(this.jwtMiddleware), (req, res, next) => this.ordemProducaoController.getAll(req, res, next));
        this.router.delete('/:id', this.jwtMiddleware.validate.bind(this.jwtMiddleware), (req, res, next) => this.ordemProducaoController.delete(req, res, next));
        return this.router;
    }
};