const express = require('express');
const router = express.Router();
const path = require('path');

const FuncionarioController = require('../control/FuncionarioControl');
const TokenJWTMiddleware = require('../middleware/TokenJWTMiddleware');
const MongoIdMiddleware = require('../middleware/MongoIdMiddleware');
const FuncionarioMiddleware = require('../middleware/FuncionarioMiddleware'); // <-- IMPORTAR

const jwtMiddleware = new TokenJWTMiddleware();
const viewPath = path.join(__dirname, '..', 'view');

// Rotas de Renderização
router.get('/', (req, res) => res.render('main/funcionario'));
router.get('/adicionar-funcionario', (req, res) => res.sendFile(path.join(viewPath, 'add', 'adicionar-funcionario.html')));
router.get('/editar-funcionario/:id', (req, res) => res.sendFile(path.join(viewPath, 'edit', 'editar-funcionario.html')));

// --- ROTAS DA API ---
router.post('/login', FuncionarioController.login);

// ADICIONADO MIDDLEWARE DE VALIDAÇÃO NA ROTA POST
router.post('/', jwtMiddleware.validate.bind(jwtMiddleware), FuncionarioMiddleware.validateCreate, FuncionarioController.create);

router.get('/readAll', jwtMiddleware.validate.bind(jwtMiddleware), FuncionarioController.readAll);
router.get('/:id', jwtMiddleware.validate.bind(jwtMiddleware), MongoIdMiddleware.validate, FuncionarioController.readByID);
router.put('/:id', jwtMiddleware.validate.bind(jwtMiddleware), MongoIdMiddleware.validate, FuncionarioController.update);
router.delete('/:id', jwtMiddleware.validate.bind(jwtMiddleware), MongoIdMiddleware.validate, FuncionarioController.delete);

module.exports = router;