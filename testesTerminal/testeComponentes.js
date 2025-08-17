// Arquivo: testes/testAPIComponentes.js
const axios = require('axios');

// --- CONFIGURAÇÕES ---
const BASE_URL = 'http://localhost:8081/componente'; // A URL base da sua API de componentes

// !! IMPORTANTE !! Cole aqui o seu token JWT válido
const TOKEN_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwOi8vbG9jYWxob3N0IiwiYXVkIjoiaHR0cDovL2xvY2FsaG9zdCIsInN1YiI6ImFjZXNzb19zaXN0ZW1hIiwiaWF0IjoxNzU1MzE0NzA1LCJleHAiOjE3NTc5MDY3MDUsIm5iZiI6MTc1NTMxNDcwNSwianRpIjoiY2E2OWRkMjZlOGU3YjFiZmQyZmY2NmI3YmEzNWE1ZjciLCJjcmVkZW5jaWFsRnVuY2lvbmFyaW8iOjMsImlkRnVuY2lvbmFyaW8iOiI2ODBjMWEyOTQ0ZTgxOTczNzc3NjAwZDQifQ.3wGial7GK93ivhZ2YLEaGPL3Zw1z701EVj0oEgk3WCY';

const AUTH_HEADER = {
    headers: { 'Authorization': `Bearer ${TOKEN_JWT}` }
};

// --- DADOS DE EXEMPLO ---
const novoComponenteData = {
    nome: "Componente de Teste API",
    codigo: `COMP-API-${Date.now()}`,
    descricao: "Componente criado via script de teste.",
    quantidade: 200,
    precoUnidade: 1.25,
    Lote: "LOTE-API-2024"
};

const componenteAtualizadoData = {
    nome: "Componente ATUALIZADO via API",
    quantidade: 250,
    precoUnidade: 1.30
};

// --- FUNÇÕES DE TESTE ---

async function testarCriacao() {
    console.log('--- Iniciando Teste de Criação de Componente (POST) ---');
    try {
        const response = await axios.post(BASE_URL, novoComponenteData, AUTH_HEADER);
        console.log('✅ Sucesso! Componente criado:');
        console.log(response.data);
        return response.data.componente._id;
    } catch (error) {
        console.error('❌ Falha no Teste de Criação:', error.response ? error.response.data : error.message);
        return null;
    }
}

async function testarLeituraTodos() {
    console.log('\n--- Iniciando Teste de Leitura de Todos os Componentes (GET /readAll) ---');
    try {
        const response = await axios.get(`${BASE_URL}/readAll`, AUTH_HEADER);
        console.log(`✅ Sucesso! Encontrados ${response.data.componentes.length} componentes.`);
    } catch (error) {
        console.error('❌ Falha no Teste de Leitura de Todos:', error.response ? error.response.data : error.message);
    }
}

async function testarLeituraPorId(id) {
    console.log(`\n--- Iniciando Teste de Leitura de Componente por ID (${id}) ---`);
    if (!id) {
        console.error('⚠️ Teste pulado: ID do componente não fornecido.');
        return;
    }
    try {
        const response = await axios.get(`${BASE_URL}/${id}`, AUTH_HEADER);
        console.log('✅ Sucesso! Componente encontrado:');
        console.log(response.data.componente);
    } catch (error) {
        console.error('❌ Falha no Teste de Leitura por ID:', error.response ? error.response.data : error.message);
    }
}

async function testarAtualizacao(id) {
    console.log(`\n--- Iniciando Teste de Atualização de Componente (${id}) ---`);
    if (!id) {
        console.error('⚠️ Teste pulado: ID do componente não fornecido.');
        return;
    }
    try {
        const response = await axios.put(`${BASE_URL}/${id}`, componenteAtualizadoData, AUTH_HEADER);
        console.log('✅ Sucesso! Componente atualizado:');
        console.log(response.data.componente);
    } catch (error) {
        console.error('❌ Falha no Teste de Atualização:', error.response ? error.response.data : error.message);
    }
}

async function testarDelecao(id) {
    console.log(`\n--- Iniciando Teste de Deleção de Componente (${id}) ---`);
    if (!id) {
        console.error('⚠️ Teste pulado: ID do componente não fornecido.');
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
    console.log('INICIANDO SUÍTE DE TESTES DA API DE COMPONENTES');
    console.log('============================================');
    if (TOKEN_JWT === 'COLE_SEU_TOKEN_AQUI') {
        console.error("\n❌ ERRO FATAL: O token JWT não foi definido.");
        return;
    }

    const idDoNovoComponente = await testarCriacao();
    await testarLeituraTodos();
    await testarLeituraPorId(idDoNovoComponente);
    await testarAtualizacao(idDoNovoComponente);
    //await testarDelecao(idDoNovoComponente);
    await testarLeituraTodos();
    
    console.log('\nFIM DA SUÍTE DE TESTES DE COMPONENTES');
}

rodarTodosOsTestes();