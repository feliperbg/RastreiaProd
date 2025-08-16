const express = require('express');
const router = express.Router();

const OrdemProducaoController = require('../control/OrdemProducaoControl');
const TokenJWTMiddleware = require('../middleware/TokenJWTMiddleware');
const MongoIdMiddleware = require('../middleware/MongoIdMiddleware');
const OrdemProducaoMiddleware = require('../middleware/OrdemProducaoMiddleware'); // <-- IMPORTAR

const jwtMiddleware = new TokenJWTMiddleware();

// Rota de Renderização
router.get('/', (req, res) => res.render('main/ordem-producao'));

// --- ROTAS DA API ---
// ADICIONADO MIDDLEWARE DE VALIDAÇÃO NA ROTA POST
router.post('/', jwtMiddleware.validate.bind(jwtMiddleware), OrdemProducaoMiddleware.validateCreate, OrdemProducaoController.create);

router.get('/readAll', jwtMiddleware.validate.bind(jwtMiddleware), OrdemProducaoController.readAll);
router.get('/:id', jwtMiddleware.validate.bind(jwtMiddleware), MongoIdMiddleware.validate, OrdemProducaoController.readByID);
router.put('/:id', jwtMiddleware.validate.bind(jwtMiddleware), MongoIdMiddleware.validate, OrdemProducaoController.update);
router.delete('/:id', jwtMiddleware.validate.bind(jwtMiddleware), MongoIdMiddleware.validate, OrdemProducaoController.delete);

module.exports = router;