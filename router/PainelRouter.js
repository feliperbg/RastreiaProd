// Arquivo: router/PainelRouter.js
const express = require('express');
const apiRouter = express.Router(); // Renomeado para apiRouter para consistência

// Importações
const PainelController = require('../control/PainelControl');
const TokenJWTMiddleware = require('../middleware/TokenJWTMiddleware');

// Instancia o middleware de JWT
const jwtMiddleware = new TokenJWTMiddleware();

// --- ROTAS DA API PARA O DASHBOARD ---
// Montadas em /api/painel no arquivo principal da aplicação
apiRouter.get('/cards', jwtMiddleware.validate.bind(jwtMiddleware), PainelController.getDashboardCards);
apiRouter.get('/ordens-status-chart', jwtMiddleware.validate.bind(jwtMiddleware), PainelController.getOrdensStatusChart);
apiRouter.get('/recentes', jwtMiddleware.validate.bind(jwtMiddleware), PainelController.getRecentOrdens);
apiRouter.get('/ordens-finalizadas-chart', jwtMiddleware.validate.bind(jwtMiddleware), PainelController.getOrdensFinalizadasChart);
apiRouter.get('/tempo-medio-etapas-chart', jwtMiddleware.validate.bind(jwtMiddleware), PainelController.getTempoMedioEtapasChart);

// Exporta apenas o apiRouter, pois não há views
module.exports = { apiRouter };