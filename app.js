const express = require('express');
const FuncionarioRouter = require('./router/FuncionarioRouter');
const BancoMongoose = require("./model/BancoMongoose");
const logoutRouter = require('./router/LogoutRouter.js');
const app = express();
const path = require('path');
const Banco = new BancoMongoose();
const funcionarioRouter = new FuncionarioRouter();
const portaServico = 8081;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));  // Para assets (CSS, JS, imagens)
app.use(express.static(path.join(__dirname, 'view')));    // Para arquivos HTML
// app.use(logoutRouter); // Descomente quando precisar usar

// Rotas
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'view', 'login.html')); // Caminho absoluto
});

app.use('/funcionario', funcionarioRouter.createRoutes());

// Rota de fallback para SPA (opcional)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'view', 'login.html'));
});

app.listen(portaServico, () => {
    console.log(`API rodando no endereço: http://localhost:${portaServico}/`);
    Banco.getConexao();
    console.log('Diretório atual:', __dirname);
    console.log('Caminho completo:', path.join(__dirname, 'view', 'login.html'));
});