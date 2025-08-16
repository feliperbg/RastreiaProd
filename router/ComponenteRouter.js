const express = require('express');
const router = express.Router();
const path = require('path');

const ComponenteController = require('../control/ComponenteControl');
const TokenJWTMiddleware = require('../middleware/TokenJWTMiddleware');
const MongoIdMiddleware = require('../middleware/MongoIdMiddleware');
const ComponenteMiddleware = require('../middleware/ComponenteMiddleware'); // <-- IMPORTAR

const jwtMiddleware = new TokenJWTMiddleware();
const viewPath = path.join(__dirname, '..', 'view');

// Rotas de Renderização
router.get('/', (req, res) => res.render('main/componente'));
router.get('/adicionar-componente', (req, res) => res.sendFile(path.join(viewPath, 'add', 'adicionar-componente.html')));
router.get('/editar-componente/:id', (req, res) => res.sendFile(path.join(viewPath, 'edit', 'editar-componente.html')));

// --- ROTAS DA API ---
// ADICIONADO MIDDLEWARE DE VALIDAÇÃO NA ROTA POST
router.post('/', jwtMiddleware.validate.bind(jwtMiddleware), ComponenteMiddleware.validateCreate, ComponenteController.create);

router.get('/readAll', jwtMiddleware.validate.bind(jwtMiddleware), ComponenteController.readAll);
router.get('/:id', jwtMiddleware.validate.bind(jwtMiddleware), MongoIdMiddleware.validate, ComponenteController.readByID);
router.put('/:id', jwtMiddleware.validate.bind(jwtMiddleware), MongoIdMiddleware.validate, ComponenteController.update);
router.delete('/:id', jwtMiddleware.validate.bind(jwtMiddleware), MongoIdMiddleware.validate, ComponenteController.delete);

module.exports = router;