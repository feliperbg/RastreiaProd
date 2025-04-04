const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const cors = require('cors');
const FuncionarioRouter = require('./router/FuncionarioRouter');
const BancoMongoose = require("./model/BancoMongoose");
const verificaLoginRouter = require('./router/VerificaLoginRouter');
const logoutRouter = require('./router/LogoutRouter.js');

const app = express();
const Banco = new BancoMongoose();
const portaServico = 8081;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'view')));
app.use(cookieParser()); // Habilita cookies
app.use(cors({ credentials: true, origin: "http://localhost:8081" }));
app.use(verificaLoginRouter);
app.use(logoutRouter);
// Rotas
const funcionarioRouter = new FuncionarioRouter();
app.use('/login', funcionarioRouter.createRoutes());

app.listen(portaServico, () => {
    console.log(`API rodando no endereço: http://localhost:${portaServico}/`);
    Banco.getConexao();
});
