// Arquivo: router/ProdutoRouter.js

const express = require('express');
const router = express.Router(); // Usamos diretamente o Router do Express

// Importa o Controller e os Middlewares
const ProdutoController = require('../control/ProdutoControl');
const TokenJWTMiddleware = require('../middleware/TokenJWTMiddleware');
const MongoIdMiddleware = require('../middleware/MongoIdMiddleware');
const ProdutoMiddleware = require('../middleware/ProdutoMiddleware');

// Instancia apenas o middleware de JWT se ele guardar algum estado, senão pode ser estático também
const jwtMiddleware = new TokenJWTMiddleware();

// --- ROTAS DA API ---

// Rota para renderizar a página principal de produtos
router.get('/', (req, res) => {
    // Aqui você pode adicionar lógica se precisar buscar dados antes de renderizar
    res.render('main/produto'); 
});

// Criar um Produto
router.post(
    '/',
    jwtMiddleware.validate.bind(jwtMiddleware), // Protege a rota
    ProdutoMiddleware.validateCreate, // Valida os campos obrigatórios
    ProdutoController.create
);

// Ler todos os Produtos
router.get(
    '/readAll', // Mantive sua rota original
    jwtMiddleware.validate.bind(jwtMiddleware),
    ProdutoController.readAll
);

// Ler um Produto pelo ID
router.get(
    '/:id',
    jwtMiddleware.validate.bind(jwtMiddleware),
    MongoIdMiddleware.validate, // Valida se o ID tem formato válido
    ProdutoController.readByID
);

// Atualizar um Produto
router.put(
    '/:id',
    jwtMiddleware.validate.bind(jwtMiddleware),
    MongoIdMiddleware.validate, // Valida o ID
    ProdutoController.update
);

// Deletar um Produto
router.delete(
    '/:id',
    jwtMiddleware.validate.bind(jwtMiddleware),
    MongoIdMiddleware.validate, // Valida o ID
    ProdutoController.delete
);


// Exporta apenas o router configurado
module.exports = router;