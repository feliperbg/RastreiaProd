// Arquivo: router/PainelRouter.js

const express = require('express');
const router = express.Router();

// Importações
const PainelController = require('../control/PainelControl');
const TokenJWTMiddleware = require('../middleware/TokenJWTMiddleware');

// Instancia o middleware de JWT para usar em todas as rotas
const jwtMiddleware = new TokenJWTMiddleware();

// --- ROTAS DA API PARA O DASHBOARD ---

// Rota para buscar os dados dos cards principais
router.get(
    '/cards',
    jwtMiddleware.validate.bind(jwtMiddleware),
    PainelController.getDashboardCards
);

// Rota para buscar os dados do gráfico de status de ordens
router.get(
    '/ordens-status-chart',
    jwtMiddleware.validate.bind(jwtMiddleware),
    PainelController.getOrdensStatusChart
);

// Rota para buscar as últimas ordens de produção
router.get(
    '/recentes',
    jwtMiddleware.validate.bind(jwtMiddleware),
    PainelController.getRecentOrdens
);

router.get(
    '/ordens-finalizadas-chart',
    jwtMiddleware.validate.bind(jwtMiddleware),
    PainelController.getOrdensFinalizadasChart
);

router.get(
    '/tempo-medio-etapas-chart',
    jwtMiddleware.validate.bind(jwtMiddleware),
    PainelController.getTempoMedioEtapasChart
);



module.exports = router;