const express = require('express');
const path = require('path');
const ProdutoControl = require('../control/ProdutoControl');
const JWTMiddleware = require('../middleware/TokenJWTMiddleware');

module.exports = class ProdutoRouter {
    constructor() {
        this.router = express.Router();
        this.produtoControl = new ProdutoControl();
        this.jwtMiddleware = new JWTMiddleware();
        this.viewPath = path.join(__dirname, '..', 'view');
        this.createRoutes();
    }

    createRoutes() {
        // Páginas estáticas
        this.router.get('/', (req, res) => {
            res.render('produto');
        });

        this.router.get('/editar-produto/:id', (req, res) => {
            res.sendFile(path.join(this.viewPath, 'edit', 'editar-produto.html'));
        });

        this.router.get('/adicionar-produto', (req, res) => {
            res.sendFile(path.join(this.viewPath, 'add', 'adicionar-produto.html'));
        });

        // Rotas de API protegidas
        this.router.post('/',
            (req, res) => this.produtoControl.create(req, res)
        );

        this.router.get('/readALL',
            this.jwtMiddleware.validate.bind(this.jwtMiddleware),
            (req, res) => this.produtoControl.readAll(req, res)
        );

        this.router.get('/:id',
            this.jwtMiddleware.validate.bind(this.jwtMiddleware),
            (req, res) => this.produtoControl.readByID(req, res)
        );

        this.router.delete('/:id',
            this.jwtMiddleware.validate.bind(this.jwtMiddleware),
            (req, res) => this.produtoControl.delete(req, res)
        );

        this.router.put('/:id',
            this.jwtMiddleware.validate.bind(this.jwtMiddleware),
            (req, res) => this.produtoControl.update(req, res)
        );

        // Retorna todos em JSON
        this.router.get('/json',
            this.jwtMiddleware.validate.bind(this.jwtMiddleware), // Se precisar proteger
            (req, res) => this.produtoControl.readAllJSON(req, res)
        );

        return this.router;
    }
};
