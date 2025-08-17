// Arquivo: app.js
const express = require('express');
const path = require('path');
const BancoMongoose = require('./model/BancoMongoose');
const TokenJWTMiddleware = require('./middleware/TokenJWTMiddleware');

const produtoRouter = require('./router/ProdutoRouter');
const componenteRouter = require('./router/ComponenteRouter');
const etapaRouter = require('./router/EtapaRouter');
const funcionarioRouter = require('./router/FuncionarioRouter');
const ordemProducaoRouter = require('./router/OrdemProducaoRouter');
const painelRouter = require('./router/PainelRouter');

const app = express();
const port = 8081;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'view'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Conexão com o banco de dados
const Banco = new BancoMongoose();

const jwtMiddleware = new TokenJWTMiddleware();
// Rotas
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'view', 'login.html'));
});
app.get('/', (req, res) => {
  res.redirect('/login');
});
app.get('/painel', (req, res) => {
    res.render('painel');
});
app.get('/verifica-login', jwtMiddleware.validate.bind(jwtMiddleware), (req, res) => {
  return res.status(200).json({ status: true, msg: "Usuário autenticado" });
});

app.use('/produto', produtoRouter);
app.use('/componente', componenteRouter);
app.use('/etapa', etapaRouter);
app.use('/funcionario', funcionarioRouter);
app.use('/ordem-producao', ordemProducaoRouter);
app.use('/painel', painelRouter);

app.listen(port, '0.0.0.0', () => {
    console.log(`API rodando no endereço: http://localhost:${port}/`);
    Banco.getConexao();
});