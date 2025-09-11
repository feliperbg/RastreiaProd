// Arquivo: router/OrdemProducaoRouter.js
const express = require('express');
const path = require('path');

// Routers para Frontend e Backend
const viewRouter = express.Router();
const apiRouter = express.Router();

// Controladores e Middlewares
const OrdemProducaoController = require('../control/OrdemProducaoControl');
const TokenJWTMiddleware = require('../middleware/TokenJWTMiddleware');
const MongoIdMiddleware = require('../middleware/MongoIdMiddleware');
const OrdemProducaoMiddleware = require('../middleware/OrdemProducaoMiddleware');

const jwtMiddleware = new TokenJWTMiddleware();
const viewPath = path.join(__dirname, '..', 'view');

// --- ROTAS DE RENDERIZAÇÃO (VIEWS) ---
viewRouter.get('/', (req, res) => res.render('main/ordem-producao'));
viewRouter.get('/adicionar', (req, res) => { res.sendFile(path.join(viewPath, 'add', 'adicionar-ordem-producao.html')); });
viewRouter.get('/:id/editar', (req, res) => { res.sendFile(path.join(viewPath, 'edit', 'editar-ordem-producao.html')); });
viewRouter.get('/:id/gestao', (req, res) => { res.sendFile(path.join(viewPath,'main', 'gestao-op.html')); });


// --- ROTAS DA API ---
// Montadas em /api/ordens-producao no arquivo principal da aplicação
apiRouter.post('/', jwtMiddleware.validate.bind(jwtMiddleware), OrdemProducaoMiddleware.validateCreate, OrdemProducaoController.create);
apiRouter.get('/', jwtMiddleware.validate.bind(jwtMiddleware), OrdemProducaoController.readAll);
apiRouter.get('/:id', jwtMiddleware.validate.bind(jwtMiddleware), MongoIdMiddleware.validateParam('id'), OrdemProducaoController.readByID);
apiRouter.put('/:id', jwtMiddleware.validate.bind(jwtMiddleware), MongoIdMiddleware.validateParam('id'), OrdemProducaoController.update);

// --- ROTAS DE AÇÃO (CANCELAR, PAUSAR, RETOMAR) ---
apiRouter.patch('/:id/cancelar', jwtMiddleware.validate.bind(jwtMiddleware), MongoIdMiddleware.validateParam('id'), OrdemProducaoController.cancelar);
apiRouter.patch('/:id/pausar', jwtMiddleware.validate.bind(jwtMiddleware), MongoIdMiddleware.validateParam('id'), OrdemProducaoController.pausar);
apiRouter.patch('/:id/retomar', jwtMiddleware.validate.bind(jwtMiddleware), MongoIdMiddleware.validateParam('id'), OrdemProducaoController.retomar);

// --- ROTAS DE ETAPA ---
apiRouter.post('/:id/etapa/:etapaId/iniciar', jwtMiddleware.validate.bind(jwtMiddleware), MongoIdMiddleware.validateParams(['id', 'etapaId']), OrdemProducaoController.iniciarEtapa);
apiRouter.post('/:id/etapa/:etapaId/finalizar', jwtMiddleware.validate.bind(jwtMiddleware), MongoIdMiddleware.validateParams(['id', 'etapaId']), OrdemProducaoController.finalizarEtapa);

module.exports = { viewRouter, apiRouter };