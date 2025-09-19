// Arquivo: router/ProdutoRouter.js
const express = require('express');
const path = require('path');

// Routers para Frontend e Backend
const viewRouter = express.Router();
const apiRouter = express.Router();

// Controladores e Middlewares
const ProdutoController = require('../control/ProdutoControl');
const ProdutoMiddleware = require('../middleware/ProdutoMiddleware');
const MongoIdMiddleware = require('../middleware/MongoIdMiddleware');
const TokenJWTMiddleware = require('../middleware/TokenJWTMiddleware');

const jwtMiddleware = new TokenJWTMiddleware();
const viewPath = path.join(__dirname, '..', 'view');

// --- ROTAS DE RENDERIZAÇÃO (VIEWS) ---
// Montadas em /produtos no arquivo principal da aplicação
viewRouter.get('/', (req, res) => res.render('main/produto'));
viewRouter.get('/adicionar', (req, res) => { res.render('add/adicionar-produto'); });
viewRouter.get('/:id/editar', (req, res) => { res.render('edit/editar-produto'); });

// --- ROTAS DA API ---
// Montadas em /api/produtos no arquivo principal da aplicação
apiRouter.post('/', jwtMiddleware.validate.bind(jwtMiddleware), ProdutoMiddleware.validateCreate, ProdutoController.create);
apiRouter.get('/', jwtMiddleware.validate.bind(jwtMiddleware), ProdutoController.readAll);
apiRouter.get('/:id', jwtMiddleware.validate.bind(jwtMiddleware), MongoIdMiddleware.validateParam('id'), ProdutoController.readByID);
apiRouter.put('/:id', jwtMiddleware.validate.bind(jwtMiddleware), MongoIdMiddleware.validateParam('id'), ProdutoMiddleware.validateUpdate, ProdutoController.update);
apiRouter.delete('/:id', jwtMiddleware.validate.bind(jwtMiddleware), MongoIdMiddleware.validateParam('id'), ProdutoController.delete);

module.exports = { viewRouter, apiRouter };