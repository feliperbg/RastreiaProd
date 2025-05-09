const express = require('express');
const path = require('path');
const ProdutoControl = require('../control/ProdutoControl');
const JWTMiddleware = require('../middleware/TokenJWTMiddleware');

module.exports = class ProdutoRouter {
    constructor() {
        this.router = express.Router();
        this.produtoControl = new ProdutoControl();
        this.jwtMiddleware = new JWTMiddleware();
        this.createRoutes();
    }

    createRoutes() {
        // Rota estática
        this.router.get('/', (req, res) => {
            res.render('produto');
        });

        this.router.get('/editar-produto/:id', (req, res) => {
            // Verifica se o token existe na requisição
            res.sendFile(path.join(__dirname, 'view', 'editar-produto.html')); // Caminho absoluto
        });
        // Rotas protegidas por JWT (forma correta)
        this.router.post('/',
            (req, res) => this.produtoControl.create(req, res)
        );

        this.router.get('/readALL',
            (req, res, next) => this.jwtMiddleware.validate(req, res, next),
            (req, res) => this.produtoControl.readAll(req, res)
        );

        this.router.get('/:id',
            (req, res, next) => this.jwtMiddleware.validate(req, res, next),
            (req, res) => this.produtoControl.readByID(req, res)
        );

        this.router.delete('/:id',
            (req, res, next) => this.jwtMiddleware.validate(req, res, next),
            (req, res) => this.produtoControl.delete(req, res)
        );

        this.router.put('/:id',
            (req, res, next) => this.jwtMiddleware.validate(req, res, next),
            (req, res) => this.produtoControl.update(req, res)
        );

        // routes/produtos.js
        this.router.get('/json', async (req, res) => {
            (req, res) => this.produtoControl.update(req, res),
            (req, res) => this.produtoControl.readAllJSON(req, res)
            
        });
        this.router.get('/cadastro-produto', (req, res) => {
            res.sendFile(path.join(__dirname, '..', 'view', 'adicionarProduto.html'));
        });
  

        return this.router;
    }
}