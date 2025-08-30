// Arquivo: router/OrdemProducaoRouter.js
const express = require('express');
const router = express.Router();
const path = require('path');

const OrdemProducaoController = require('../control/OrdemProducaoControl');
const TokenJWTMiddleware = require('../middleware/TokenJWTMiddleware');
const MongoIdMiddleware = require('../middleware/MongoIdMiddleware');
const OrdemProducaoMiddleware = require('../middleware/OrdemProducaoMiddleware');

const jwtMiddleware = new TokenJWTMiddleware();
const viewPath = path.join(__dirname, '..', 'view');

// --- ROTAS DE RENDERIZAÇÃO ---
router.get('/', (req, res) => res.render('main/ordem-producao'));
router.get('/editar-ordem-producao/:id', (req, res) => { res.sendFile(path.join(viewPath, 'edit', 'editar-ordem-producao.html')); });
router.get('/adicionar-ordem-producao', (req, res) => { res.sendFile(path.join(viewPath, 'add', 'adicionar-ordem-producao.html')); });

// Para renderizar a tela de gestão da OP
router.get('/gestao-op/:id', (req, res) => { res.sendFile(path.join(viewPath,'main', 'gestao-op.html')); });


// --- ROTAS DA API ---
router.post('/', jwtMiddleware.validate.bind(jwtMiddleware), OrdemProducaoMiddleware.validateCreate, OrdemProducaoController.create);
router.get('/readAll', jwtMiddleware.validate.bind(jwtMiddleware), OrdemProducaoController.readAll);
router.get('/:id', jwtMiddleware.validate.bind(jwtMiddleware),MongoIdMiddleware.validateParam('id'), OrdemProducaoController.readByID);
router.put('/:id', jwtMiddleware.validate.bind(jwtMiddleware),MongoIdMiddleware.validateParam('id'), OrdemProducaoController.update);
router.delete('/:id', jwtMiddleware.validate.bind(jwtMiddleware),MongoIdMiddleware.validateParam('id'), OrdemProducaoController.delete);

// ROTAS NOVAS: Para iniciar e finalizar uma etapa
// Valida os parâmetros 'id' E 'etapaId'
router.post(
    '/:id/etapa/:etapaId/iniciar',
    jwtMiddleware.validate.bind(jwtMiddleware),
    MongoIdMiddleware.validateParams(['id', 'etapaId']), 
    OrdemProducaoController.iniciarEtapa
);

// Valida os parâmetros 'id' E 'etapaId'
router.post(
    '/:id/etapa/:etapaId/finalizar',
    jwtMiddleware.validate.bind(jwtMiddleware),
    MongoIdMiddleware.validateParams(['id', 'etapaId']),
    OrdemProducaoController.finalizarEtapa
);

module.exports = router;