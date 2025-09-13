// Arquivo: app.js
const express = require('express');
const path = require('path');
const Banco = require('./model/BancoMongoose');
<<<<<<< HEAD
const { cleanTempFolder } = require('./utils/cleanup.js');
=======
>>>>>>> ff2dd710be6e4a6cc7c0c39e0af8f4843f5f7417

const app = express();

// --- CONFIGURAÇÕES DO EXPRESS ---
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('views', path.join(__dirname, 'view'));
app.set('view engine', 'ejs');

// --- IMPORTAÇÃO DOS ROUTERS ---
const { viewRouter: produtoViewRouter, apiRouter: produtoApiRouter } = require('./router/ProdutoRouter');
const { viewRouter: componenteViewRouter, apiRouter: componenteApiRouter } = require('./router/ComponenteRouter');
const { viewRouter: etapaViewRouter, apiRouter: etapaApiRouter } = require('./router/EtapaRouter');
const { viewRouter: funcionarioViewRouter, apiRouter: funcionarioApiRouter } = require('./router/FuncionarioRouter');
const { viewRouter: ordemProducaoViewRouter, apiRouter: ordemProducaoApiRouter } = require('./router/OrdemProducaoRouter');
const { apiRouter: painelApiRouter } = require('./router/PainelRouter');
const { viewRouter: departamentoViewRouter, apiRouter: departamentoApiRouter } = require('./router/DepartamentoRouter');
const { env } = require('process');


// --- ROTAS DE VIEWS (FRONTEND) ---

// Rota para a PÁGINA de login (pública)
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'view', 'login.html')); // Verifique o caminho/nome do seu arquivo
});

app.use('/produtos', produtoViewRouter);
app.use('/componentes', componenteViewRouter);
app.use('/etapas', etapaViewRouter);
app.use('/funcionarios', funcionarioViewRouter);
app.use('/ordens-producao', ordemProducaoViewRouter);
app.use('/departamentos', departamentoViewRouter);
app.get('/painel', (req, res) => res.render('main/painel'));

// Rota raiz redireciona para a página de login por padrão
app.get('/', (req, res) => res.redirect('/login'));


// --- ROTAS DE API (BACKEND) ---
app.use('/api/funcionarios', funcionarioApiRouter); 
app.use('/api/produtos', produtoApiRouter);
app.use('/api/componentes', componenteApiRouter);
app.use('/api/etapas', etapaApiRouter);
app.use('/api/ordens-producao', ordemProducaoApiRouter);
app.use('/api/departamentos', departamentoApiRouter);
app.use('/api/painel', painelApiRouter);


// --- INICIALIZAÇÃO DO SERVIDOR ---
async function startServer() {
  await Banco.connect();
  app.listen(process.env.PORT, '0.0.0.0', () => {
    console.log(`✅ Servidor rodando no endereço: http://localhost:${process.env.PORT}`);
<<<<<<< HEAD
    // 1. Executa a limpeza uma vez quando o servidor inicia
    console.log('[CLEANUP] Executando limpeza inicial da pasta temp...');
    cleanTempFolder();

    // 2. Agenda a limpeza para rodar a cada hora (3600000 milissegundos)
    const cleanupInterval = 3600 * 1000; 
    setInterval(() => {
        console.log('[CLEANUP] Executando limpeza agendada da pasta temp...');
        cleanTempFolder();
    }, cleanupInterval);
=======
>>>>>>> ff2dd710be6e4a6cc7c0c39e0af8f4843f5f7417
  });
}

startServer().catch(err => {
    console.error("❌ Falha ao iniciar o servidor:", err);
});