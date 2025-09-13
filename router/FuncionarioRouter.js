// Arquivo: router/FuncionarioRouter.js
const express = require('express');
const path = require('path');

// Routers para Frontend e Backend
const viewRouter = express.Router();
const apiRouter = express.Router();

// Controladores e Middlewares
const FuncionarioController = require('../control/FuncionarioControl');
const FuncionarioMiddleware = require('../middleware/FuncionarioMiddleware');
const MongoIdMiddleware = require('../middleware/MongoIdMiddleware');
const TokenJWTMiddleware = require('../middleware/TokenJWTMiddleware');

const jwtMiddleware = new TokenJWTMiddleware();
const viewPath = path.join(__dirname, '..', 'view');

// --- ROTAS DE RENDERIZAÇÃO (VIEWS) ---
// Montadas em /funcionarios no arquivo principal da aplicação
viewRouter.get('/', (req, res) => res.render('main/funcionario'));
viewRouter.get('/adicionar', (req, res) => { res.sendFile(path.join(viewPath, 'add', 'adicionar-funcionario.html')); });
viewRouter.get('/:id/editar', (req, res) => { res.sendFile(path.join(viewPath, 'edit', 'editar-funcionario.html')); });

// --- ROTAS DA API ---
// Montadas em /api/funcionarios no arquivo principal da aplicação
apiRouter.post('/login', FuncionarioMiddleware.validateLogin, FuncionarioController.login); // Rota de login pública
apiRouter.post('/logout', jwtMiddleware.validate.bind(jwtMiddleware), FuncionarioController.logout); // Rota de logout protegida
apiRouter.post('/', jwtMiddleware.validate.bind(jwtMiddleware), FuncionarioMiddleware.validateCreate, FuncionarioController.create);
apiRouter.get('/', jwtMiddleware.validate.bind(jwtMiddleware), FuncionarioController.readAll);
apiRouter.get('/:id', jwtMiddleware.validate.bind(jwtMiddleware), MongoIdMiddleware.validateParam('id'), FuncionarioController.readByID);
apiRouter.put('/:id', jwtMiddleware.validate.bind(jwtMiddleware), MongoIdMiddleware.validateParam('id'), FuncionarioMiddleware.validateUpdate, FuncionarioController.update);
apiRouter.delete('/:id', jwtMiddleware.validate.bind(jwtMiddleware), MongoIdMiddleware.validateParam('id'), FuncionarioController.delete);

module.exports = { viewRouter, apiRouter };