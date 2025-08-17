// Arquivo: testes/testAPIEtapas.js
const axios = require('axios');

// --- CONFIGURAÇÕES ---
const BASE_URL = 'http://localhost:8081/etapa'; // A URL base da sua API de etapas

// !! IMPORTANTE !! Cole aqui o seu token JWT válido
const TOKEN_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwOi8vbG9jYWxob3N0IiwiYXVkIjoiaHR0cDovL2xvY2FsaG9zdCIsInN1YiI6ImFjZXNzb19zaXN0ZW1hIiwiaWF0IjoxNzU1MzE0NzA1LCJleHAiOjE3NTc5MDY3MDUsIm5iZiI6MTc1NTMxNDcwNSwianRpIjoiY2E2OWRkMjZlOGU3YjFiZmQyZmY2NmI3YmEzNWE1ZjciLCJjcmVkZW5jaWFsRnVuY2lvbmFyaW8iOjMsImlkRnVuY2lvbmFyaW8iOiI2ODBjMWEyOTQ0ZTgxOTczNzc3NjAwZDQifQ.3wGial7GK93ivhZ2YLEaGPL3Zw1z701EVj0oEgk3WCY';

const AUTH_HEADER = {
    headers: { 'Authorization': `Bearer ${TOKEN_JWT}` }
};

// --- DADOS DE EXEMPLO ---
const novaEtapaData = {
    nome: "Etapa de Teste API",
    sequencias: 99, // Usando um número alto para não conflitar
    departamentoResponsavel: "QA",
    procedimentos: "Rodar scripts de teste automatizados."
};

const etapaAtualizadaData = {
    nome: "Etapa de Teste API (ATUALIZADA)",
    departamentoResponsavel: "Engenharia de Testes"
};

// --- FUNÇÕES DE TESTE ---

async function testarCriacao() {
    console.log('--- Iniciando Teste de Criação de Etapa (POST) ---');
    try {
        const response = await axios.post(BASE_URL, novaEtapaData, AUTH_HEADER);
        console.log('✅ Sucesso! Etapa criada:');
        console.log(response.data);
        return response.data.etapa._id;
    } catch (error) {
        console.error('❌ Falha no Teste de Criação:', error.response ? error.response.data : error.message);
        return null;
    }
}

async function testarLeituraTodos() {
    console.log('\n--- Iniciando Teste de Leitura de Todas as Etapas (GET /readAll) ---');
    try {
        const response = await axios.get(`${BASE_URL}/readAll`, AUTH_HEADER);
        console.log(`✅ Sucesso! Encontradas ${response.data.etapas.length} etapas.`);
    } catch (error) {
        console.error('❌ Falha no Teste de Leitura de Todos:', error.response ? error.response.data : error.message);
    }
}

async function testarLeituraPorId(id) {
    console.log(`\n--- Iniciando Teste de Leitura de Etapa por ID (${id}) ---`);
    if (!id) {
        console.error('⚠️ Teste pulado: ID da etapa não fornecido.');
        return;
    }
    try {
        const response = await axios.get(`${BASE_URL}/${id}`, AUTH_HEADER);
        console.log('✅ Sucesso! Etapa encontrada:');
        console.log(response.data.etapa);
    } catch (error) {
        console.error('❌ Falha no Teste de Leitura por ID:', error.response ? error.response.data : error.message);
    }
}

async function testarAtualizacao(id) {
    console.log(`\n--- Iniciando Teste de Atualização de Etapa (${id}) ---`);
    if (!id) {
        console.error('⚠️ Teste pulado: ID da etapa não fornecido.');
        return;
    }
    try {
        const response = await axios.put(`${BASE_URL}/${id}`, etapaAtualizadaData, AUTH_HEADER);
        console.log('✅ Sucesso! Etapa atualizada:');
        console.log(response.data.etapa);
    } catch (error) {
        console.error('❌ Falha no Teste de Atualização:', error.response ? error.response.data : error.message);
    }
}

async function testarDelecao(id) {
    console.log(`\n--- Iniciando Teste de Deleção de Etapa (${id}) ---`);
    if (!id) {
        console.error('⚠️ Teste pulado: ID da etapa não fornecido.');
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
    console.log('INICIANDO SUÍTE DE TESTES DA API DE ETAPAS');
    console.log('============================================');
    if (TOKEN_JWT === 'COLE_SEU_TOKEN_AQUI') {
        console.error("\n❌ ERRO FATAL: O token JWT não foi definido.");
        return;
    }

    const idDaNovaEtapa = await testarCriacao();
    await testarLeituraTodos();
    await testarLeituraPorId(idDaNovaEtapa);
    await testarAtualizacao(idDaNovaEtapa);
    //await testarDelecao(idDaNovaEtapa);
    await testarLeituraTodos();

    console.log('\nFIM DA SUÍTE DE TESTES DE ETAPAS');
}

rodarTodosOsTestes();