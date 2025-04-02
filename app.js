const express = require('express');
const path = require('path');
const FuncionarioRouter = require('./router/FuncionarioRouter');
const BancoMongoose = require("./model/BancoMongoose");


const app = express();
const Banco = new BancoMongoose();
const portaServico = 8081;
app.use(express.json()); 
app.use(express.static(path.join(__dirname, 'view')));

const funcionarioRouter = new FuncionarioRouter();
app.use('/login', funcionarioRouter.createRoutes()); 

app.listen(portaServico, () => {
    console.log(`API rodando no endereço: http://localhost:${portaServico}/`);
    Banco.getConexao();
});

