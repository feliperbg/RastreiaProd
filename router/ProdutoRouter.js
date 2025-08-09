const express = require('express');
const ProdutoControl = require('../control/ProdutoControl');
const JWTMiddleware = require('../middleware/TokenJWTMiddleware');

module.exports = class ProdutoRouter {
    constructor() {
        this.router = express.Router();
        this.produtoController = new ProdutoControl();
        this.jwtMiddleware = new JWTMiddleware();
    }

    createRoutes() {
        this.router.post('/', this.jwtMiddleware.validate.bind(this.jwtMiddleware), (req, res, next) => this.produtoController.add(req, res, next));
        this.router.put('/:id', this.jwtMiddleware.validate.bind(this.jwtMiddleware), (req, res, next) => this.produtoController.update(req, res, next));
        this.router.get('/:id', this.jwtMiddleware.validate.bind(this.jwtMiddleware), (req, res, next) => this.produtoController.getById(req, res, next));
        this.router.get('/', this.jwtMiddleware.validate.bind(this.jwtMiddleware), (req, res, next) => this.produtoController.getAll(req, res, next));
        this.router.delete('/:id', this.jwtMiddleware.validate.bind(this.jwtMiddleware), (req, res, next) => this.produtoController.delete(req, res, next));
        return this.router;
    }
};
