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
viewRouter.get('/adicionar', (req, res) => { res.render('add/adicionar-ordem-producao'); });
viewRouter.get('/:id/editar', (req, res) => { res.render('edit/editar-ordem-producao'); });
viewRouter.get('/:id/gestao', (req, res) => { res.render('main/gestao-op'); });


// --- ROTAS DA API ---
// Montadas em /api/ordens-producao no arquivo principal da aplicação
// Adicionado .bind(OrdemProducaoController) a todos os métodos estáticos do controller
apiRouter.post('/', jwtMiddleware.validate.bind(jwtMiddleware), OrdemProducaoMiddleware.validateCreate, OrdemProducaoController.create.bind(OrdemProducaoController));
apiRouter.get('/', jwtMiddleware.validate.bind(jwtMiddleware), OrdemProducaoController.readAll.bind(OrdemProducaoController));
apiRouter.get('/:id', jwtMiddleware.validate.bind(jwtMiddleware), MongoIdMiddleware.validateParam('id'), OrdemProducaoController.readByID.bind(OrdemProducaoController));
apiRouter.put('/:id', jwtMiddleware.validate.bind(jwtMiddleware), MongoIdMiddleware.validateParam('id'), OrdemProducaoController.update.bind(OrdemProducaoController));

// --- ROTAS DE AÇÃO (CANCELAR) ---
apiRouter.patch('/:id/cancelar', jwtMiddleware.validate.bind(jwtMiddleware), MongoIdMiddleware.validateParam('id'), OrdemProducaoController.cancelar.bind(OrdemProducaoController));

// --- ROTAS DE ETAPA ---
apiRouter.post('/:id/etapa/:etapaId/iniciar', jwtMiddleware.validate.bind(jwtMiddleware), MongoIdMiddleware.validateParams(['id', 'etapaId']), OrdemProducaoController.iniciarEtapa.bind(OrdemProducaoController));
apiRouter.post('/:id/etapa/:etapaId/finalizar', jwtMiddleware.validate.bind(jwtMiddleware), MongoIdMiddleware.validateParams(['id', 'etapaId']), OrdemProducaoController.finalizarEtapa.bind(OrdemProducaoController));
apiRouter.patch('/:id/etapa/:etapaId/pausar', jwtMiddleware.validate.bind(jwtMiddleware), MongoIdMiddleware.validateParams(['id', 'etapaId']), OrdemProducaoController.pausarEtapa.bind(OrdemProducaoController));
apiRouter.patch('/:id/etapa/:etapaId/retomar', jwtMiddleware.validate.bind(jwtMiddleware), MongoIdMiddleware.validateParams(['id', 'etapaId']), OrdemProducaoController.retomarEtapa.bind(OrdemProducaoController));
apiRouter.patch('/:id/refugo', jwtMiddleware.validate.bind(jwtMiddleware), MongoIdMiddleware.validateParam('id'), OrdemProducaoController.atualizarRefugo.bind(OrdemProducaoController));
module.exports = { viewRouter, apiRouter };
