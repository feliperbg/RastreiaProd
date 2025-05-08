const express = require('express');
const path = require('path');
const BancoMongoose = require("./model/BancoMongoose");
const FuncionariosRouter = require('./router/FuncionarioRouter');
const ComponentesRouter = require('./router/ComponenteRouter');
const ProdutosRouter = require('./router/ProdutoRouter');
const JWTMiddleware = require('./middleware/TokenJWTMiddleware');


const app = express();
const Banco = new BancoMongoose();

const FuncionarioRouter = new FuncionariosRouter();
const ComponenteRouter = new ComponentesRouter();
const ProdutoRouter = new ProdutosRouter();
const jwt = new JWTMiddleware();
const portaServico = 8081;
app.use(express.json());
 
// Configurações do EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'view')); // Define o diretório de views para o EJS

// Arquivos estáticos (CSS, JS, imagens, etc.)
app.use(express.static(path.join(__dirname, 'public')));  // Para assets (CSS, JS, imagens)

app.get('/', (req, res) => {
    // Verifica se o token existe na requisição
    res.sendFile(path.join(__dirname, 'view', 'login.html')); // Caminho absoluto
});

app.get('/editar-funcionario', (req, res) => {
    // Verifica se o token existe na requisição
    res.sendFile(path.join(__dirname, 'view', 'editar-funcionario.html')); // Caminho absoluto
});


app.get('/editar-componente', (req, res) => {
    // Verifica se o token existe na requisição
    res.sendFile(path.join(__dirname, 'view', 'editar-componente.html')); // Caminho absoluto
});

app.get('/editar-produto', (req, res) => {
    // Verifica se o token existe na requisição
    res.sendFile(path.join(__dirname, 'view', 'editar-produto.html')); // Caminho absoluto
});

app.get('/painel', (req, res) => {
    res.render('painel'); // Caminho absoluto
});

app.get('/verifica-login', jwt.validate, (req, res) => {
    // Verifica se o token existe na requisição
    return res.status(200).json({ status: true, msg: "Usuário autenticado" });
});

app.use('/funcionario', FuncionarioRouter.createRoutes());

app.use('/componente', ComponenteRouter.createRoutes());

app.use('/produto', ProdutoRouter.createRoutes());




app.listen(portaServico, '0.0.0.0', () => {
    console.log(`API rodando no endereço: http://localhost:${portaServico}/`);
    Banco.getConexao();
});

