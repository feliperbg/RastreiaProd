const express = require('express');
const FuncionarioRouter = require('./router/FuncionarioRouter');
const BancoMongoose = require("./model/BancoMongoose");
const app = express();
const path = require('path');
const Banco = new BancoMongoose();
const funcionarioRouter = new FuncionarioRouter();
const portaServico = 8081;


app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));  // Para assets (CSS, JS, imagens)
app.use(express.static(path.join(__dirname, 'dist')));    // Pasta do AdminLTE
app.use(express.static(path.join(__dirname, 'view')));    // Para arquivos HTML

// Rotas
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'view', 'login.html')); // Caminho absoluto
});
app.get('/painel', (req, res) => {
    res.sendFile(path.join(__dirname, 'view', 'painel.html')); // Caminho absoluto
});

app.use('/funcionario', funcionarioRouter.createRoutes());

//app.use('/componentes', componentesRouter.createRoutes());

//app.use('/produtos', produtosRouter.createRoutes());


app.listen(portaServico, '0.0.0.0', () => {
    console.log(`API rodando no endereço: http://localhost:${portaServico}/`);
    Banco.getConexao();
});

