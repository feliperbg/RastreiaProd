const express = require('express');
const router = express.Router();

const EtapaController = require('../control/EtapaControl');
const TokenJWTMiddleware = require('../middleware/TokenJWTMiddleware');
const MongoIdMiddleware = require('../middleware/MongoIdMiddleware');
const EtapaMiddleware = require('../middleware/EtapaMiddleware'); // <-- IMPORTAR

const jwtMiddleware = new TokenJWTMiddleware();

// Rota de Renderização
router.get('/', (req, res) => res.render('main/etapa'));

// --- ROTAS DA API ---
// ADICIONADO MIDDLEWARE DE VALIDAÇÃO NA ROTA POST
router.post('/', jwtMiddleware.validate.bind(jwtMiddleware), EtapaMiddleware.validateCreate, EtapaController.create);

router.get('/readAll', jwtMiddleware.validate.bind(jwtMiddleware), EtapaController.readAll);
router.get('/:id', jwtMiddleware.validate.bind(jwtMiddleware), MongoIdMiddleware.validate, EtapaController.readByID);
router.put('/:id', jwtMiddleware.validate.bind(jwtMiddleware), MongoIdMiddleware.validate, EtapaController.update);
router.delete('/:id', jwtMiddleware.validate.bind(jwtMiddleware), MongoIdMiddleware.validate, EtapaController.delete);

module.exports = router;