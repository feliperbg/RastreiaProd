// Arquivo: router/EtapaRouter.js
const express = require('express');
const path = require('path');

// Routers para Frontend e Backend
const viewRouter = express.Router();
const apiRouter = express.Router();

// Controladores e Middlewares
const EtapaController = require('../control/EtapaControl');
const EtapaMiddleware = require('../middleware/EtapaMiddleware');
const MongoIdMiddleware = require('../middleware/MongoIdMiddleware');
const TokenJWTMiddleware = require('../middleware/TokenJWTMiddleware');

const jwtMiddleware = new TokenJWTMiddleware();
const viewPath = path.join(__dirname, '..', 'view');

// --- ROTAS DE RENDERIZAÇÃO (VIEWS) ---
// Montadas em /etapas no arquivo principal da aplicação
viewRouter.get('/', (req, res) => res.render('main/etapa'));
viewRouter.get('/adicionar', (req, res) => { res.sendFile(path.join(viewPath, 'add', 'adicionar-etapa.html')); });
viewRouter.get('/:id/editar', (req, res) => { res.sendFile(path.join(viewPath, 'edit', 'editar-etapa.html')); });

// --- ROTAS DA API ---
// Montadas em /api/etapas no arquivo principal da aplicação
apiRouter.post('/', jwtMiddleware.validate.bind(jwtMiddleware), EtapaMiddleware.validateCreate, EtapaController.create);
apiRouter.get('/', jwtMiddleware.validate.bind(jwtMiddleware), EtapaController.readAll);
apiRouter.get('/:id', jwtMiddleware.validate.bind(jwtMiddleware), MongoIdMiddleware.validateParam('id'), EtapaController.readByID);
apiRouter.put('/:id', jwtMiddleware.validate.bind(jwtMiddleware), MongoIdMiddleware.validateParam('id'), EtapaMiddleware.validateUpdate, EtapaController.update);
apiRouter.delete('/:id', jwtMiddleware.validate.bind(jwtMiddleware), MongoIdMiddleware.validateParam('id'), EtapaController.delete);

module.exports = { viewRouter, apiRouter };