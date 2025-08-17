// Arquivo: testes/testAPIFuncionarios.js
const axios = require('axios');

// --- CONFIGURAÇÕES ---
const BASE_URL = 'http://localhost:8081/funcionario'; // A URL base da sua API de funcionários

// !! IMPORTANTE !! Cole aqui o seu token JWT válido (de um usuário admin, se necessário para criar outros)
const TOKEN_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwOi8vbG9jYWxob3N0IiwiYXVkIjoiaHR0cDovL2xvY2FsaG9zdCIsInN1YiI6ImFjZXNzb19zaXN0ZW1hIiwiaWF0IjoxNzU1MzE0NzA1LCJleHAiOjE3NTc5MDY3MDUsIm5iZiI6MTc1NTMxNDcwNSwianRpIjoiY2E2OWRkMjZlOGU3YjFiZmQyZmY2NmI3YmEzNWE1ZjciLCJjcmVkZW5jaWFsRnVuY2lvbmFyaW8iOjMsImlkRnVuY2lvbmFyaW8iOiI2ODBjMWEyOTQ0ZTgxOTczNzc3NjAwZDQifQ.3wGial7GK93ivhZ2YLEaGPL3Zw1z701EVj0oEgk3WCY';

const AUTH_HEADER = {
    headers: { 'Authorization': `Bearer ${TOKEN_JWT}` }
};

// --- DADOS DE EXEMPLO ---
const emailUnico = `felipe@gmail.com`;
const novoFuncionarioData = {
    nome: "Funcionário Teste API",
    email: emailUnico,
    senha: "senha123",
    CPF: `${Date.now()}`.slice(-11), // CPF único para teste
    role: "operador",
    turno: "Manhã"
};

const funcionarioAtualizadoData = {
    nome: "Funcionário Teste (NOME ATUALIZADO)",
    role: "supervisor",
    turno: "Tarde"
};

// --- FUNÇÕES DE TESTE ---

// Teste de LOGIN (POST /login)
async function testarLogin() {
    console.log('\n--- Iniciando Teste de Login (POST /login) ---');
    try {
        const response = await axios.post(`${BASE_URL}/login`, {
            email: novoFuncionarioData.email,
            senha: novoFuncionarioData.senha
        });
        console.log('✅ Sucesso! Login realizado, token recebido:');
        console.log(response.data.token);
    } catch (error) {
        console.error('❌ Falha no Teste de Login:', error.response ? error.response.data : error.message);
    }
}

async function testarCriacao() {
    console.log('--- Iniciando Teste de Criação de Funcionário (POST) ---');
    try {
        const response = await axios.post(BASE_URL, novoFuncionarioData, AUTH_HEADER);
        console.log('✅ Sucesso! Funcionário criado:');
        console.log(response.data);
        return response.data.funcionario._id;
    } catch (error) {
        console.error('❌ Falha no Teste de Criação:', error.response ? error.response.data : error.message);
        return null;
    }
}

async function testarLeituraTodos() {
    console.log('\n--- Iniciando Teste de Leitura de Todos os Funcionários (GET /readAll) ---');
    try {
        const response = await axios.get(`${BASE_URL}/readAll`, AUTH_HEADER);
        console.log(`✅ Sucesso! Encontrados ${response.data.funcionarios.length} funcionários.`);
    } catch (error) {
        console.error('❌ Falha no Teste de Leitura de Todos:', error.response ? error.response.data : error.message);
    }
}

async function testarLeituraPorId(id) {
    console.log(`\n--- Iniciando Teste de Leitura de Funcionário por ID (${id}) ---`);
    if (!id) {
        console.error('⚠️ Teste pulado: ID do funcionário não fornecido.');
        return;
    }
    try {
        const response = await axios.get(`${BASE_URL}/${id}`, AUTH_HEADER);
        console.log('✅ Sucesso! Funcionário encontrado:');
        console.log(response.data.funcionario);
    } catch (error) {
        console.error('❌ Falha no Teste de Leitura por ID:', error.response ? error.response.data : error.message);
    }
}

async function testarAtualizacao(id) {
    console.log(`\n--- Iniciando Teste de Atualização de Funcionário (${id}) ---`);
    if (!id) {
        console.error('⚠️ Teste pulado: ID do funcionário não fornecido.');
        return;
    }
    try {
        const response = await axios.put(`${BASE_URL}/${id}`, funcionarioAtualizadoData, AUTH_HEADER);
        console.log('✅ Sucesso! Funcionário atualizado:');
        console.log(response.data.funcionario);
    } catch (error) {
        console.error('❌ Falha no Teste de Atualização:', error.response ? error.response.data : error.message);
    }
}

async function testarDelecao(id) {
    console.log(`\n--- Iniciando Teste de Deleção de Funcionário (${id}) ---`);
    if (!id) {
        console.error('⚠️ Teste pulado: ID do funcionário não fornecido.');
        return;
    }
    try {
        const response = await axios.delete(`${BASE_URL}/${id}`, AUTH_HEADER);
        console.log('✅ Sucesso! Mensagem do servidor:');
        console.log(response.data);
    } catch (error) {
        console.error('❌ Falha no Teste de Deleção:', error.response ? error.response.data : error.message);
    }
}

// --- EXECUTOR PRINCIPAL ---
async function rodarTodosOsTestes() {
    console.log('\n============================================');
    console.log('INICIANDO SUÍTE DE TESTES DA API DE FUNCIONÁRIOS');
    console.log('============================================');
    if (TOKEN_JWT === 'COLE_SEU_TOKEN_AQUI') {
        console.error("\n❌ ERRO FATAL: O token JWT não foi definido.");
        return;
    }

    const idDoNovoFuncionario = await testarCriacao();
    //await testarLogin(); // Testa o login com o usuário recém-criado
    //await testarLeituraTodos();
    //await testarLeituraPorId(idDoNovoFuncionario);
    //await testarAtualizacao(idDoNovoFuncionario);
    //await testarDelecao(idDoNovoFuncionario);
    //await testarLeituraTodos();
    
    console.log('\nFIM DA SUÍTE DE TESTES DE FUNCIONÁRIOS');
}

rodarTodosOsTestes();