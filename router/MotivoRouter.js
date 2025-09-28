const express = require('express');
const path = require('path');

// Routers para Frontend e Backend
const viewRouter = express.Router();
const apiRouter = express.Router();

// Controladores e Middlewares
const MotivoController = require('../control/MotivoControl');
const MotivoMiddleware = require('../middleware/MotivoMiddleware');
const MongoIdMiddleware = require('../middleware/MongoIdMiddleware');
const TokenJWTMiddleware = require('../middleware/TokenJWTMiddleware');

const jwtMiddleware = new TokenJWTMiddleware();

// --- ROTAS DE RENDERIZAÇÃO (VIEWS) ---
// Montadas em /motivos no arquivo principal da aplicação
viewRouter.get('/', (req, res) => res.render('main/motivo'));

// --- ROTAS DA API ---
// Montadas em /api/motivos no arquivo principal da aplicação
apiRouter.post('/', jwtMiddleware.validate.bind(jwtMiddleware), MotivoMiddleware.validateCreate, MotivoController.create);
apiRouter.get('/', jwtMiddleware.validate.bind(jwtMiddleware), MotivoController.readAll);
apiRouter.get('/tipo/:tipo', jwtMiddleware.validate.bind(jwtMiddleware), MotivoController.readByTipo);
apiRouter.get('/:id', jwtMiddleware.validate.bind(jwtMiddleware), MongoIdMiddleware.validateParam('id'), MotivoController.readByID);
apiRouter.put('/:id', jwtMiddleware.validate.bind(jwtMiddleware), MongoIdMiddleware.validateParam('id'), MotivoMiddleware.validateUpdate, MotivoController.update);
apiRouter.delete('/:id', jwtMiddleware.validate.bind(jwtMiddleware), MongoIdMiddleware.validateParam('id'), MotivoController.delete);

module.exports = { viewRouter, apiRouter };