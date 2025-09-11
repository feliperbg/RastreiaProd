// Arquivo: router/DepartamentoRouter.js
const express = require('express');
const path = require('path');

// Routers para Frontend e Backend
const viewRouter = express.Router();
const apiRouter = express.Router();

// Controladores e Middlewares
const DepartamentoController = require('../control/DepartamentoControl');
const DepartamentoMiddleware = require('../middleware/DepartamentoMiddleware');
const MongoIdMiddleware = require('../middleware/MongoIdMiddleware');
const TokenJWTMiddleware = require('../middleware/TokenJWTMiddleware');

const jwtMiddleware = new TokenJWTMiddleware();
const viewPath = path.join(__dirname, '..', 'view');

// --- ROTAS DE RENDERIZAÇÃO (VIEWS) ---
// Montadas em /departamentos no arquivo principal da aplicação
viewRouter.get('/', (req, res) => res.render('main/departamento'));
viewRouter.get('/adicionar', (req, res) => { res.sendFile(path.join(viewPath, 'add', 'adicionar-departamento.html')); });
viewRouter.get('/:id/editar', (req, res) => { res.sendFile(path.join(viewPath, 'edit', 'editar-departamento.html')); });

// --- ROTAS DA API ---
// Montadas em /api/departamentos no arquivo principal da aplicação
apiRouter.post('/', jwtMiddleware.validate.bind(jwtMiddleware), DepartamentoMiddleware.validateCreate, DepartamentoController.create);
apiRouter.get('/', jwtMiddleware.validate.bind(jwtMiddleware), DepartamentoController.readAll);
apiRouter.get('/:id', jwtMiddleware.validate.bind(jwtMiddleware), MongoIdMiddleware.validateParam('id'), DepartamentoController.readById);
apiRouter.put('/:id', jwtMiddleware.validate.bind(jwtMiddleware), MongoIdMiddleware.validateParam('id'), DepartamentoMiddleware.validateUpdate, DepartamentoController.update);
apiRouter.delete('/:id', jwtMiddleware.validate.bind(jwtMiddleware), MongoIdMiddleware.validateParam('id'), DepartamentoController.delete);

module.exports = { viewRouter, apiRouter };