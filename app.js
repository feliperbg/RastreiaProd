const express = require('express');
const path = require('path');
const BancoMongoose = require("./model/BancoMongoose");
const FuncionariosRouter = require('./router/FuncionarioRouter');
const ComponentesRouter = require('./router/ComponenteRouter');
const ProdutosRouter = require('./router/ProdutoRouter');

const app = express();
const Banco = new BancoMongoose();

const FuncionarioRouter = new FuncionariosRouter();
const ComponenteRouter = new ComponentesRouter();
const ProdutoRouter = new ProdutosRouter();
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

app.use('/funcionario', FuncionarioRouter.createRoutes());

app.use('/componente', ComponenteRouter.createRoutes());

app.use('/produto', ProdutoRouter.createRoutes());


app.listen(portaServico, '0.0.0.0', () => {
    console.log(`API rodando no endereço: http://localhost:${portaServico}/`);
    Banco.getConexao();
});

