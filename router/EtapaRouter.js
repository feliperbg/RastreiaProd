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
// Rota de Renderização
router.get('/', (req, res) => res.render('main/etapa'));
router.get('/editar-etapa/:id', (req, res) => { res.sendFile(path.join(viewPath, 'edit', 'editar-etapa.html')); });
router.get('/adicionar-etapa', (req, res) => { res.sendFile(path.join(viewPath, 'add', 'adicionar-etapa.html')); });

// --- ROTAS DA API ---
router.post('/', jwtMiddleware.validate.bind(jwtMiddleware), EtapaMiddleware.validateCreate, EtapaController.create);
router.get('/readAll', jwtMiddleware.validate.bind(jwtMiddleware), EtapaController.readAll);
router.get('/:id', jwtMiddleware.validate.bind(jwtMiddleware), MongoIdMiddleware.validateParam('id'), EtapaController.readByID);
router.put('/:id', jwtMiddleware.validate.bind(jwtMiddleware), MongoIdMiddleware.validateParam('id'), EtapaController.update);
router.delete('/:id', jwtMiddleware.validate.bind(jwtMiddleware), MongoIdMiddleware.validateParam('id'), EtapaController.delete);
router.get('/produto/:produtoId', EtapaController.listarPorProduto)

module.exports = router;