const express = require('express');
const path = require('path');
const BancoMongoose = require("./model/BancoMongoose");
const JWTMiddleware = require('./middleware/TokenJWTMiddleware');

// --- IMPORTAÇÃO DAS ROTAS ---
const funcionarioRouter = require('./router/FuncionarioRouter');
const componenteRouter = require('./router/ComponenteRouter');
const produtoRouter = require('./router/ProdutoRouter');
const etapaRouter = require('./router/EtapaRouter');
const ordemProducaoRouter = require('./router/OrdemProducaoRouter');
const painelRouter = require('./router/PainelRouter');

const app = express();
const Banco = new BancoMongoose();
const jwt = new JWTMiddleware();
const portaServico = 8081;

app.use(express.json());

// --- CONFIGURAÇÕES DE VIEW E ARQUIVOS ESTÁTICOS ---
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'view'));
app.use(express.static(path.join(__dirname, 'public')));

//----------------------- RENDERIZAÇÃO DE PÁGINAS ESTÁTICAS -----------------------
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'view', 'login.html'));
});

app.get('/', (req, res) => {
    res.redirect('/login');
});

app.get('/painel', (req, res) => {
    res.render('painel');
});

app.get('/verifica-login', jwt.validate.bind(jwt), (req, res) => {
  return res.status(200).json({ status: true, msg: "Usuário autenticado" });
});

//------------------------- REGISTRO DAS ROTAS NA APLICAÇÃO -------------------------
app.use('/funcionario', funcionarioRouter);
app.use('/componente', componenteRouter);
app.use('/produto', produtoRouter);
app.use('/etapa', etapaRouter);
app.use('/ordem-producao', ordemProducaoRouter);
app.use('/painel', painelRouter);

// --- INICIALIZAÇÃO DO SERVIDOR ---
app.listen(portaServico, '0.0.0.0', () => {
    console.log(`API rodando no endereço: http://localhost:${portaServico}/`);
    Banco.getConexao();
});