// Arquivo: router/DepartamentoRouter.js
const express = require('express');
const router = express.Router();
const path = require('path');

const DepartamentoController = require('../control/DepartamentoControl');
const TokenJWTMiddleware = require('../middleware/TokenJWTMiddleware');
const MongoIdMiddleware = require('../middleware/MongoIdMiddleware');
const DepartamentoMiddleware = require('../middleware/DepartamentoMiddleware');

const jwtMiddleware = new TokenJWTMiddleware();
const viewPath = path.join(__dirname, '..', 'view');

router.get('/', (req, res) => {
    res.render('main/departamento'); 
});

 router.get('/editar-departamento/:id', (req, res) => {
    res.sendFile(path.join(viewPath, 'edit', 'editar-departamento.html'));
});

router.get('/adicionar-departamento', (req, res) => {
    res.sendFile(path.join(viewPath, 'add', 'adicionar-departamento.html'));
});

// Criar um Departamento
router.post(
    '/',
    jwtMiddleware.validate.bind(jwtMiddleware),
    DepartamentoMiddleware.validateCreate,
    DepartamentoController.create
);

// Ler todos os Departamentos
router.get(
    '/readAll',
    jwtMiddleware.validate.bind(jwtMiddleware),
    DepartamentoController.readAll
);

// Ler um Departamento pelo ID
router.get(
    '/:id',
    jwtMiddleware.validate.bind(jwtMiddleware),
    MongoIdMiddleware.validateParam('id'),
    DepartamentoController.readById
);

// Atualizar um Departamento
router.put(
    '/:id',
    jwtMiddleware.validate.bind(jwtMiddleware),
    MongoIdMiddleware.validateParam('id'),
    DepartamentoController.update
);

// Deletar um Departamento
router.delete(
    '/:id',
    jwtMiddleware.validate.bind(jwtMiddleware),
    MongoIdMiddleware.validateParam('id'),
    DepartamentoController.delete
);

module.exports = router;