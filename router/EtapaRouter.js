// Arquivo: router/EtapaRouter.js
const express = require('express');
const router = express.Router();
const path = require('path');

const EtapaController = require('../control/EtapaControl');
const TokenJWTMiddleware = require('../middleware/TokenJWTMiddleware');
const MongoIdMiddleware = require('../middleware/MongoIdMiddleware');
const EtapaMiddleware = require('../middleware/EtapaMiddleware');

const jwtMiddleware = new TokenJWTMiddleware();
const viewPath = path.join(__dirname, '..', 'view');

// Rota para RENDERIZAR a página de listagem de etapas de um produto
router.get('/produto/:produtoId', MongoIdMiddleware.validateParam('produtoId'), EtapaController.listarPorProdutoView);
// Rota para RENDERIZAR a página de ADIÇÃO de etapa para um produto específico
router.get('/adicionar-etapa/:produtoId', MongoIdMiddleware.validateParam('produtoId'), (req, res) => res.sendFile(path.join(viewPath, 'add', 'adicionar-etapa.html')));

// Rota para RENDERIZAR a página de EDIÇÃO de uma etapa
router.get('/editar-etapa/:id', MongoIdMiddleware.validateParam('id'), (req, res) => res.sendFile(path.join(viewPath, 'edit', 'editar-etapa.html')));



// --- ROTAS DA API ---
router.post('/', jwtMiddleware.validate.bind(jwtMiddleware), EtapaMiddleware.validateCreate, EtapaController.create);
router.get('/readAll', jwtMiddleware.validate.bind(jwtMiddleware), EtapaController.readAll);
router.get('/:id', jwtMiddleware.validate.bind(jwtMiddleware), MongoIdMiddleware.validateParam('id'), EtapaController.readByID);
router.put('/:id', jwtMiddleware.validate.bind(jwtMiddleware), MongoIdMiddleware.validateParam('id'), EtapaController.update);
router.delete('/:id', jwtMiddleware.validate.bind(jwtMiddleware), MongoIdMiddleware.validateParam('id'), EtapaController.delete);
router.get('/api/produto/:produtoId', jwtMiddleware.validate.bind(jwtMiddleware), MongoIdMiddleware.validateParam('produtoId'), EtapaController.getEtapasPorProdutoAPI);

module.exports = router;