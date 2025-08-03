const express = require('express');
const path = require('path');
const FuncionarioControl = require('../control/FuncionarioControl');
const JWTMiddleware = require('../middleware/TokenJWTMiddleware');

module.exports = class FuncionarioRouter {
    constructor() {
        this.router = express.Router();
        this.funcionarioControl = new FuncionarioControl();
        this.jwtMiddleware = new JWTMiddleware();
        this.createRoutes();
    }

    createRoutes() {
        // Rota estática
        this.router.get('/', (req, res) => {
            res.render('funcionario');
        });

        // Login (sem autenticação)
        this.router.post('/login', (req, res) => {
            console.log('POST /funcionario/login foi chamado');
            this.funcionarioControl.login(req, res);
        });

        // Logout
        this.router.post('/logout', (req, res) => {
            console.log('POST /funcionario/logout foi chamado');
            this.funcionarioControl.logout(req, res);
        });

        // Rota para esqueceu senha
        this.router.get('/esqueceu-senha', (req, res) => {
            console.log('GET /funcionario/esqueceu-senha foi chamado');
            res.sendFile(path.join(__dirname, '..', 'view', 'esqueceuSenha.html'));
        });
        
        this.router.get('/adicionar-funcionario',
            (req, res) => {
                console.log('GET /funcionario/adicionar-funcionario foi chamado');
                res.sendFile(path.join(__dirname, '..', 'view', 'add', 'adicionar-funcionario.html'));
            }
        );

       this.router.get('/editar-funcionario/:id',
            (req, res) => {
                console.log('GET /funcionario/editar-funcionario foi chamado');
                res.sendFile(path.join(__dirname, '..', 'view', 'edit' , 'editar-funcionario.html'));
            }
        );

        // Rotas protegidas por JWT (forma correta)
        this.router.get('/perfil/:id',
            (req, res, next) => this.jwtMiddleware.validate(req, res, next),
            (req, res) => this.funcionarioControl.readByID(req, res)
        );

        this.router.get('/readALL',
            (req, res, next) => this.jwtMiddleware.validate(req, res, next),
            (req, res) => this.funcionarioControl.readAll(req, res)
        );

        this.router.get('/:id',
            (req, res, next) => this.jwtMiddleware.validate(req, res, next),
            (req, res) => this.funcionarioControl.readByID(req, res)
        );

        this.router.post('/',
            (req, res) => this.funcionarioControl.create(req, res)
        );

        this.router.delete('/:id',
            (req, res, next) => this.jwtMiddleware.validate(req, res, next),
            (req, res) => this.funcionarioControl.delete(req, res)
        );

        this.router.put('/:id',
            (req, res, next) => this.jwtMiddleware.validate(req, res, next),
            (req, res) => this.funcionarioControl.update(req, res)
        );
        return this.router;
    }
}