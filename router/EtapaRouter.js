const express = require('express');
const path = require('path');
const EtapaControl = require('../control/EtapaControl'); // Controller das etapas
const JWTMiddleware = require('../middleware/TokenJWTMiddleware'); // Middleware de validação JWT

module.exports = class EtapaRouter {
    constructor() {
        this.router = express.Router();
        this.etapaControl = new EtapaControl(); // Instancia o controller de etapas
        this.jwtMiddleware = new JWTMiddleware(); // Instancia o middleware JWT
        this.createRoutes();
    }

    createRoutes() {
        // Rota estática para mostrar a página de etapas
        this.router.get('/', (req, res) => {
            res.render('etapa.ejs');
        });

        // Rota para editar uma etapa, que renderiza a página de edição
        this.router.get('/editar-etapa/:id', (req, res) => {
            res.sendFile(path.join(__dirname, '..', 'view', 'edit', 'editar-etapa.html')); // Caminho para o arquivo HTML de edição
        });

        // Rota para criar uma nova etapa, protegida por JWT
        this.router.post('/', 
            (req, res) => this.etapaControl.create(req, res) // Chama o método create no controlador de etapas
        );

        // Rota para ler todas as etapas, protegida por JWT
        this.router.get('/readALL', 
            (req, res, next) => this.jwtMiddleware.validate(req, res, next), // Valida o JWT
            (req, res) => this.etapaControl.readAll(req, res) // Chama o método readAll no controlador de etapas
        );
        
        // Rota para cadastrar uma nova etapa, que renderiza a página de cadastro
        this.router.get('/cadastro-etapa', (req, res) => {
            res.sendFile(path.join(__dirname, '..', 'view', 'add', 'adicionar-etapa.html')); // Caminho para o arquivo HTML de cadastro
        });

        // Rota para ler uma etapa específica, protegida por JWT
        this.router.get('/:id', 
            (req, res, next) => this.jwtMiddleware.validate(req, res, next), // Valida o JWT
            (req, res) => this.etapaControl.readByID(req, res) // Chama o método readByID no controlador de etapas
        );

        // Rota para deletar uma etapa, protegida por JWT
        this.router.delete('/:id', 
            (req, res, next) => this.jwtMiddleware.validate(req, res, next), // Valida o JWT
            (req, res) => this.etapaControl.delete(req, res) // Chama o método delete no controlador de etapas
        );

        // Rota para atualizar uma etapa, protegida por JWT
        this.router.put('/:id', 
            (req, res, next) => this.jwtMiddleware.validate(req, res, next), // Valida o JWT
            (req, res) => this.etapaControl.update(req, res) // Chama o método update no controlador de etapas
        );

        // Rota para retornar um JSON com todas as etapas
        this.router.get('/json', async (req, res) => {
            (req, res) => this.etapaControl.readAllJSON(req, res); // Chama o método readAllJSON no controlador de etapas
        });

        return this.router;
    }
}
