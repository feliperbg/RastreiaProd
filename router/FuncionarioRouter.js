const express = require('express');
const FuncionarioControl = require('../control/FuncionarioControl');


module.exports = class FuncionariRouter {
    constructor() {
        this._router = express.Router();
        this._funcionarioControl =  new FuncionarioControl();
    }
    createRoutes() {
        this._router.post('/',
            this._funcionarioControl.login
        );
        return this._router;
    }
}