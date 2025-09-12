// Arquivo: router/EtapaRouter.js
const express = require('express');
const path = require('path');

// Routers para Frontend e Backend
const viewRouter = express.Router();
const apiRouter = express.Router();

// Controladores e Middlewares
const Produto = require('../model/Produto');
const EtapaController = require('../control/EtapaControl');
const EtapaMiddleware = require('../middleware/EtapaMiddleware');
const MongoIdMiddleware = require('../middleware/MongoIdMiddleware');
const TokenJWTMiddleware = require('../middleware/TokenJWTMiddleware');

const jwtMiddleware = new TokenJWTMiddleware();
const viewPath = path.join(__dirname, '..', 'view');

// --- ROTAS DE RENDERIZAÇÃO (VIEWS) ---
// Montadas em /etapas no arquivo principal da aplicação
viewRouter.get('/produtos/:produtoId', MongoIdMiddleware.validateParam('produtoId'), async (req, res) => {
    try {
        const { produtoId } = req.params;
        // Busca o produto pelo ID para obter o nome
        const produto = await Produto.findById(produtoId).select('nome').lean();

        if (!produto) {
            // Se o produto não for encontrado, pode renderizar uma página de erro 404
            return res.status(404).send('Produto não encontrado');
        }
        // Renderiza a página EJS passando o nome e o ID do produto
        res.render('main/etapa', { nomeProduto: produto.nome, produtoId: produto._id });
    } catch (error) {
        res.status(500).send('Erro ao carregar a página de etapas.');
    }
});
viewRouter.get('/adicionar', (req, res) => { res.sendFile(path.join(viewPath, 'add', 'adicionar-etapa.html')); });
viewRouter.get('/:id/editar', (req, res) => { res.sendFile(path.join(viewPath, 'edit', 'editar-etapa.html')); });

// --- ROTAS DA API ---
// Montadas em /api/etapas no arquivo principal da aplicação
apiRouter.post('/', jwtMiddleware.validate.bind(jwtMiddleware), EtapaMiddleware.validateCreate, EtapaController.create);
apiRouter.get('/', jwtMiddleware.validate.bind(jwtMiddleware), EtapaController.readAll);
apiRouter.get('/:id', jwtMiddleware.validate.bind(jwtMiddleware), MongoIdMiddleware.validateParam('id'), EtapaController.readByID);
apiRouter.put('/:id', jwtMiddleware.validate.bind(jwtMiddleware), MongoIdMiddleware.validateParam('id'), EtapaMiddleware.validateUpdate, EtapaController.update);
apiRouter.delete('/:id', jwtMiddleware.validate.bind(jwtMiddleware), MongoIdMiddleware.validateParam('id'), EtapaController.delete);
apiRouter.get('/produtos/:produtoId', jwtMiddleware.validate.bind(jwtMiddleware), MongoIdMiddleware.validateParam('produtoId'), EtapaController.readByProduto);

module.exports = { viewRouter, apiRouter };