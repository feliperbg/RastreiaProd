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
        const produto = await Produto.findById(produtoId).select('nome').lean();

        if (!produto) {
            return res.status(404).send('Produto não encontrado');
        }
        res.render('main/etapa', { nomeProduto: produto.nome, produtoId: produto._id });
    } catch (error) {
        res.status(500).send('Erro ao carregar a página de etapas.');
    }
});
viewRouter.get('/:produtoId/adicionar', (req, res) => { res.render('add/adicionar-etapa'); });
viewRouter.get('/:id/editar', (req, res) => { res.render('edit/editar-etapa'); });

// --- ROTAS DA API ---
// Adicionado .bind() para garantir o contexto (this) correto nos métodos do controller
apiRouter.post('/', jwtMiddleware.validate.bind(jwtMiddleware), EtapaMiddleware.validateCreate, EtapaController.create.bind(EtapaController));
apiRouter.get('/', jwtMiddleware.validate.bind(jwtMiddleware), EtapaController.readAll.bind(EtapaController));

// --- NOVA ROTA ---
// Rota para buscar o próximo número de sequência disponível para um produto.
apiRouter.get('/produtos/:produtoId/proxima-sequencia', jwtMiddleware.validate.bind(jwtMiddleware), MongoIdMiddleware.validateParam('produtoId'), EtapaController.getProximaSequencia.bind(EtapaController));

apiRouter.get('/produtos/:produtoId/componentes-utilizados', jwtMiddleware.validate.bind(jwtMiddleware), MongoIdMiddleware.validateParam('produtoId'), EtapaController.getComponentesUtilizados.bind(EtapaController));

apiRouter.get('/produtos/:produtoId', jwtMiddleware.validate.bind(jwtMiddleware), MongoIdMiddleware.validateParam('produtoId'), EtapaController.readByProduto.bind(EtapaController));
apiRouter.get('/:id', jwtMiddleware.validate.bind(jwtMiddleware), MongoIdMiddleware.validateParam('id'), EtapaController.readByID.bind(EtapaController));
apiRouter.put('/:id', jwtMiddleware.validate.bind(jwtMiddleware), MongoIdMiddleware.validateParam('id'), EtapaMiddleware.validateUpdate, EtapaController.update.bind(EtapaController));
apiRouter.delete('/:id', jwtMiddleware.validate.bind(jwtMiddleware), MongoIdMiddleware.validateParam('id'), EtapaController.delete.bind(EtapaController));


module.exports = { viewRouter, apiRouter };
