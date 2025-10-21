// Arquivo: router/FuncionarioRouter.js
const express = require('express');
const path = require('path');
const multer = require('multer');
const fs = require('fs'); // Importe o módulo 'fs'
const AuthMiddleware = require('../middleware/AuthMiddleware');

// --- Configuração do Multer ---
// Define o diretório de destino para os uploads temporários
const uploadDest = path.join(__dirname, '..', 'public', 'imagens', 'temp');

// Garante que o diretório de destino exista
if (!fs.existsSync(uploadDest)) {
    fs.mkdirSync(uploadDest, { recursive: true });
}

// Configura o multer para salvar os arquivos no destino especificado
const upload = multer({ dest: uploadDest });

// Routers
const viewRouter = express.Router();
const apiRouter = express.Router();

// Controladores e Middlewares
const FuncionarioController = require('../control/FuncionarioControl');
const FuncionarioMiddleware = require('../middleware/FuncionarioMiddleware');
const MongoIdMiddleware = require('../middleware/MongoIdMiddleware');
const TokenJWTMiddleware = require('../middleware/TokenJWTMiddleware');

const jwtMiddleware = new TokenJWTMiddleware();
const viewPath = path.join(__dirname, '..', 'view');

// --- ROTAS DE RENDERIZAÇÃO (VIEWS) ---
viewRouter.get('/', (req, res) => res.render('main/funcionario'));
viewRouter.get('/adicionar', (req, res) => { res.render('add/adicionar-funcionario'); });
viewRouter.get('/:id/editar', (req, res) => { res.render('edit/editar-funcionario'); });
viewRouter.get('/resetar-senha', (req, res) => { res.render('resetarSenha', { userId: req.query.id }); });
viewRouter.get('/esqueceu-senha', (req, res) => { res.render('esqueceuSenha'); });

// --- ROTAS DA API ---
apiRouter.post('/login', FuncionarioMiddleware.validateLogin, FuncionarioController.login);
apiRouter.post('/logout', jwtMiddleware.validate.bind(jwtMiddleware), FuncionarioController.logout);
apiRouter.post(
    '/',
    jwtMiddleware.validate.bind(jwtMiddleware),
    AuthMiddleware.checkRole(['administrador']),
    upload.single('imagem'), // O multer agora salva o arquivo em 'public/imagens/temp'
    FuncionarioMiddleware.validateCreate,
    FuncionarioController.create
);
apiRouter.get('/', jwtMiddleware.validate.bind(jwtMiddleware), FuncionarioController.readAll);
apiRouter.get('/:id', jwtMiddleware.validate.bind(jwtMiddleware), MongoIdMiddleware.validateParam('id'), FuncionarioController.readByID);
apiRouter.put('/:id', jwtMiddleware.validate.bind(jwtMiddleware), AuthMiddleware.checkRole(['administrador']), MongoIdMiddleware.validateParam('id'), FuncionarioMiddleware.validateUpdate, FuncionarioController.update);
apiRouter.delete('/:id', jwtMiddleware.validate.bind(jwtMiddleware), AuthMiddleware.checkRole(['administrador']), MongoIdMiddleware.validateParam('id'), FuncionarioController.delete);
apiRouter.post('/request-password-reset', FuncionarioController.requestPasswordReset);
apiRouter.post('/verify-reset-code', FuncionarioController.verifyResetCode);
apiRouter.post('/reset-password', FuncionarioController.resetPassword);

module.exports = { viewRouter, apiRouter };