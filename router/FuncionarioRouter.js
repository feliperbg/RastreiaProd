const express = require('express');
const FuncionarioControl = require('../control/FuncionarioControl');

module.exports = class FuncionarioRouter {
    constructor() {
        this._router = express.Router();
        this._funcionarioControl = new FuncionarioControl();
    }

    createRoutes() {
        // POST para fazer login (chamando o controller)
        this._router.post('/login', (req, res) => {
            console.log('POST /funcionario/login foi chamado');
            this._funcionarioControl.login(req, res);
        });                     
    
        return this._router;
    }
};
