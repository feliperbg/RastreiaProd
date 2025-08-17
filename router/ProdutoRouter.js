// Arquivo: router/ProdutoRouter.js
const express = require('express');
const router = express.Router();
const path = require('path');

const ProdutoController = require('../control/ProdutoControl');
const TokenJWTMiddleware = require('../middleware/TokenJWTMiddleware');
const MongoIdMiddleware = require('../middleware/MongoIdMiddleware');
const ProdutoMiddleware = require('../middleware/ProdutoMiddleware');

const jwtMiddleware = new TokenJWTMiddleware();
const viewPath = path.join(__dirname, '..', 'view');
// Rota para renderizar a página principal de produtos
router.get('/', (req, res) => {
    res.render('main/produto'); 
});
 router.get('/editar-produto/:id', (req, res) => {
    res.sendFile(path.join(viewPath, 'edit', 'editar-produto.html'));
});

router.get('/adicionar-produto', (req, res) => {
    res.sendFile(path.join(viewPath, 'add', 'adicionar-produto.html'));
});

// Criar um Produto
router.post(
    '/',
    jwtMiddleware.validate.bind(jwtMiddleware),
    ProdutoMiddleware.validateCreate,
    ProdutoController.create
);

// Ler todos os Produtos
router.get(
    '/readAll',
    jwtMiddleware.validate.bind(jwtMiddleware),
    ProdutoController.readAll
);

// Ler um Produto pelo ID
router.get(
    '/:id',
    jwtMiddleware.validate.bind(jwtMiddleware),
    MongoIdMiddleware.validateParam('id'),
    ProdutoController.readByID
);

// Atualizar um Produto
router.put(
    '/:id',
    jwtMiddleware.validate.bind(jwtMiddleware),
    MongoIdMiddleware.validateParam('id'),
    ProdutoController.update
);

// Deletar um Produto
router.delete(
    '/:id',
    jwtMiddleware.validate.bind(jwtMiddleware),
    MongoIdMiddleware.validateParam('id'),
    ProdutoController.delete
);

module.exports = router;