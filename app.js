const express = require('express');
const path = require('path');
const BancoMongoose = require("./model/BancoMongoose");
const FuncionariosRouter = require('./router/FuncionarioRouter');
const ComponentesRouter = require('./router/ComponenteRouter');
const ProdutosRouter = require('./router/ProdutoRouter');
const EtapasRouter = require('./router/EtapaRouter');
const OrdensProducaoRouter = require('./router/OrdemProducaoRouter');
const JWTMiddleware = require('./middleware/TokenJWTMiddleware');
const PainelRouter = require('./router/PainelRouter');
const errorHandler = require('./middleware/errorHandler'); // 1. Importe o middleware


const app = express();
const Banco = new BancoMongoose();

const Painel = new PainelRouter();
const FuncionarioRouter = new FuncionariosRouter();
const ComponenteRouter = new ComponentesRouter();
const ProdutoRouter = new ProdutosRouter();
const EtapaRouter = new EtapasRouter();
const OrdemProducaoRouter = new OrdensProducaoRouter();
const jwt = new JWTMiddleware();
const portaServico = 8081;
app.use(express.json());
 
// Configurações do EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'view')); // Define o diretório de views para o EJS 

// Arquivos estáticos (CSS, JS, imagens, etc.)
app.use(express.static(path.join(__dirname, 'public')));  // Para assets (CSS, JS, imagens)
//-----------------------RENDERS---------------------------------------
app.get('/login', (req, res) => {
    // Verifica se o token existe na requisição
    res.sendFile(path.join(__dirname, 'view', 'login.html')); // Caminho absoluto
});

app.get('/', (req, res) => {
    // Renderiza a página inicial
    res.redirect('/login');
});

app.get('/painel', (req, res) => {
    res.render('painel');
});

app.get('/verifica-login', jwt.validate, (req, res) => {
  // Só chega aqui se o token for válido
  return res.status(200).json({ status: true, msg: "Usuário autenticado" });
});

//-------------------------ROUTERS--------------------------------------
app.use('/funcionario', FuncionarioRouter.createRoutes());

app.use('/componente', ComponenteRouter.createRoutes());

app.use('/produto', ProdutoRouter.createRoutes());

app.use('/etapa', EtapaRouter.createRoutes());

app.use('/ordem-producao', OrdemProducaoRouter.createRoutes());

app.use('/painel', Painel.createRoutes());

// 2. Adicione o middleware de erro NO FINAL
app.use(errorHandler);

app.listen(portaServico, '0.0.0.0', () => {
    console.log(`API rodando no endereço: http://localhost:${portaServico}/`);
    Banco.getConexao(); // Inicia a conexão com o banco de dados
});

