const express = require('express');
const router = express.Router();
const path = require('path');

const Produto = require('../model/Produto');
const EtapaController = require('../control/EtapaControl');
const TokenJWTMiddleware = require('../middleware/TokenJWTMiddleware');
const MongoIdMiddleware = require('../middleware/MongoIdMiddleware');

const jwtMiddleware = new TokenJWTMiddleware();
const viewPath = path.join(__dirname, '..', 'view');

// --- ROTAS DE RENDERIZAÇÃO DE PÁGINAS ---
router.get('/produto/:produtoId', MongoIdMiddleware.validateParam('produtoId'), async (req, res) => {
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
router.get('/adicionar-etapa/:produtoId', (req, res) => res.sendFile(path.join(viewPath, 'add', 'adicionar-etapa.html')));
router.get('/editar-etapa/:id', (req, res) => res.sendFile(path.join(viewPath, 'edit', 'editar-etapa.html')));


// --- ROTAS DA API ---
router.post('/', jwtMiddleware.validate.bind(jwtMiddleware), EtapaController.create);

router.get('/readAll', jwtMiddleware.validate.bind(jwtMiddleware), EtapaController.readAll);

router.get('/produto/etapas/:produtoId', jwtMiddleware.validate.bind(jwtMiddleware), MongoIdMiddleware.validateParam('produtoId'), EtapaController.readByProduto);

router.get('/:id', jwtMiddleware.validate.bind(jwtMiddleware), MongoIdMiddleware.validateParam('id'), EtapaController.readByID);

router.put('/:id', jwtMiddleware.validate.bind(jwtMiddleware), MongoIdMiddleware.validateParam('id'), EtapaController.update);

router.delete('/:id', jwtMiddleware.validate.bind(jwtMiddleware), MongoIdMiddleware.validateParam('id'), EtapaController.delete);

module.exports = router;