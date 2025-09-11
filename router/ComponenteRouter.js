// Arquivo: router/ComponenteRouter.js
const express = require('express');
const path = require('path');

// Routers para Frontend e Backend
const viewRouter = express.Router();
const apiRouter = express.Router();

// Controladores e Middlewares
const ComponenteController = require('../control/ComponenteControl');
const ComponenteMiddleware = require('../middleware/ComponenteMiddleware');
const MongoIdMiddleware = require('../middleware/MongoIdMiddleware');
const TokenJWTMiddleware = require('../middleware/TokenJWTMiddleware');

const jwtMiddleware = new TokenJWTMiddleware();
const viewPath = path.join(__dirname, '..', 'view');

// --- ROTAS DE RENDERIZAÇÃO (VIEWS) ---
// Montadas em /componentes no arquivo principal da aplicação
viewRouter.get('/', (req, res) => res.render('main/componente'));
viewRouter.get('/adicionar', (req, res) => { res.sendFile(path.join(viewPath, 'add', 'adicionar-componente.html')); });
viewRouter.get('/:id/editar', (req, res) => { res.sendFile(path.join(viewPath, 'edit', 'editar-componente.html')); });

// --- ROTAS DA API ---
// Montadas em /api/componentes no arquivo principal da aplicação
apiRouter.post('/', jwtMiddleware.validate.bind(jwtMiddleware), ComponenteMiddleware.validateCreate, ComponenteController.create);
apiRouter.get('/', jwtMiddleware.validate.bind(jwtMiddleware), ComponenteController.readAll);
apiRouter.get('/:id', jwtMiddleware.validate.bind(jwtMiddleware), MongoIdMiddleware.validateParam('id'), ComponenteController.readByID);
apiRouter.put('/:id', jwtMiddleware.validate.bind(jwtMiddleware), MongoIdMiddleware.validateParam('id'), ComponenteMiddleware.validateUpdate, ComponenteController.update);
apiRouter.delete('/:id', jwtMiddleware.validate.bind(jwtMiddleware), MongoIdMiddleware.validateParam('id'), ComponenteController.delete);

module.exports = { viewRouter, apiRouter };