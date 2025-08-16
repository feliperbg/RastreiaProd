// routes/PainelRouter.js
const express = require('express');
const path = require('path');
const PainelControl = require('../control/PainelControl');
const JWTMiddleware = require('../middleware/TokenJWTMiddleware');

module.exports = class PainelRouter {
    constructor() {
        this.router = express.Router();
        this.painelController = new PainelControl();
        this.jwtMiddleware = new JWTMiddleware();
        this.viewPath = path.join(__dirname, '..', 'view');
        this.createRoutes();
    }

    createRoutes() {
        // Página principal do painel (se houver)
        // this.router.get('/', (req, res) => {
        //     res.render('painel');
        // });

        // Rotas de API do painel
        this.router.get('/kanban',
            this.jwtMiddleware.validate.bind(this.jwtMiddleware),
            (req, res) => this.painelController.getKanban(req, res)
        );

        this.router.get('/etapas',
            this.jwtMiddleware.validate.bind(this.jwtMiddleware),
            (req, res) => this.painelController.getEtapasFinalizadas(req, res)
        );

        this.router.get('/tempo-etapas',
            this.jwtMiddleware.validate.bind(this.jwtMiddleware),
            (req, res) => this.painelController.getTempoEtapas(req, res)
        );

        this.router.get('/status-ordens',
            this.jwtMiddleware.validate.bind(this.jwtMiddleware),
            (req, res) => this.painelController.getStatusOrdens(req, res)
        );

        return this.router;
    }
};
