// Arquivo: testes/testAPIOrdensProducao.js
const axios = require('axios');
const { STATUS_ORDEM_MAP } = require('../model/constantes');

// --- CONFIGURAÇÕES ---
const BASE_URL = 'http://localhost:8081/ordem-producao'; // A URL base da sua API

// !! IMPORTANTE !! Cole aqui o seu token JWT válido
const TOKEN_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwOi8vbG9jYWxob3N0IiwiYXVkIjoiaHR0cDovL2xvY2FsaG9zdCIsInN1YiI6ImFjZXNzb19zaXN0ZW1hIiwiaWF0IjoxNzU1MzE0NzA1LCJleHAiOjE3NTc5MDY3MDUsIm5iZiI6MTc1NTMxNDcwNSwianRpIjoiY2E2OWRkMjZlOGU3YjFiZmQyZmY2NmI3YmEzNWE1ZjciLCJjcmVkZW5jaWFsRnVuY2lvbmFyaW8iOjMsImlkRnVuY2lvbmFyaW8iOiI2ODBjMWEyOTQ0ZTgxOTczNzc3NjAwZDQifQ.3wGial7GK93ivhZ2YLEaGPL3Zw1z701EVj0oEgk3WCY';

const AUTH_HEADER = {
    headers: { 'Authorization': `Bearer ${TOKEN_JWT}` }
};

// --- DADOS DE EXEMPLO ---
// !! IMPORTANTE !! Substitua pelo ID de um PRODUTO que exista no seu banco de dados
const ID_PRODUTO_EXEMPLO = '68a11f442be846e803f65326';
const novaOrdemData = {
    statusNumero: 0, // 0: aberta
    produto: ID_PRODUTO_EXEMPLO,
    quantidade: 10
};

const ordemAtualizadaData = {
    statusNumero: 1, // 1: em andamento
    // Apenas atualizando o status neste exemplo
};

// --- FUNÇÕES DE TESTE ---

async function testarCriacao() {
    console.log('--- Iniciando Teste de Criação de Ordem de Produção (POST) ---');
    if (ID_PRODUTO_EXEMPLO === 'ID_DE_UM_PRODUTO_REAL') {
        console.error('❌ Teste de Criação abortado: Forneça um ID de produto válido.');
        return null;
    }
    try {
        const response = await axios.post(BASE_URL, novaOrdemData , AUTH_HEADER);
        console.log('✅ Sucesso! Ordem de Produção criada:');
        console.log(response.data);
        return response.data.ordem._id;
    } catch (error) {
        console.error('❌ Falha no Teste de Criação:', error.response ? error.response.data : error.message);
        return null;
    }
}

async function testarLeituraTodos() {
    console.log('\n--- Iniciando Teste de Leitura de Todas as Ordens (GET /readAll) ---');
    try {
        const response = await axios.get(`${BASE_URL}/readAll`, AUTH_HEADER);
        console.log(`✅ Sucesso! Encontradas ${response.data.ordens.length} ordens.`);
    } catch (error) {
        console.error('❌ Falha no Teste de Leitura de Todos:', error.response ? error.response.data : error.message);
    }
}

async function testarLeituraPorId(id) {
    console.log(`\n--- Iniciando Teste de Leitura de Ordem por ID (${id}) ---`);
    if (!id) {
        console.error('⚠️ Teste pulado: ID da ordem não fornecido.');
        return;
    }
    try {
        const response = await axios.get(`${BASE_URL}/${id}`, AUTH_HEADER);
        console.log('✅ Sucesso! Ordem encontrada:');
        console.log(response.data.ordem);
    } catch (error) {
        console.error('❌ Falha no Teste de Leitura por ID:', error.response ? error.response.data : error.message);
    }
}

async function testarAtualizacao(id) {
    console.log(`\n--- Iniciando Teste de Atualização de Ordem (${id}) ---`);
    if (!id) {
        console.error('⚠️ Teste pulado: ID da ordem não fornecido.');
        return;
    }
    try {
        const response = await axios.put(`${BASE_URL}/${id}`, ordemAtualizadaData, AUTH_HEADER);
        console.log('✅ Sucesso! Ordem atualizada:');
        console.log(response.data.ordem);
    } catch (error) {
        console.error('❌ Falha no Teste de Atualização:', error.response ? error.response.data : error.message);
    }
}

async function testarDelecao(id) {
    console.log(`\n--- Iniciando Teste de Deleção de Ordem (${id}) ---`);
    if (!id) {
        console.error('⚠️ Teste pulado: ID da ordem não fornecido.');
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
    console.log('INICIANDO SUÍTE DE TESTES DA API DE ORDENS DE PRODUÇÃO');
    console.log('============================================');
    if (TOKEN_JWT === 'COLE_SEU_TOKEN_AQUI') {
        console.error("\n❌ ERRO FATAL: O token JWT não foi definido.");
        return;
    }

    const idDaNovaOrdem = await testarCriacao();
    await testarLeituraTodos();
    await testarLeituraPorId(idDaNovaOrdem);
    await testarAtualizacao(idDaNovaOrdem);
    //await testarDelecao(idDaNovaOrdem);
    await testarLeituraTodos();

    console.log('\nFIM DA SUÍTE DE TESTES DE ORDENS DE PRODUÇÃO');
}

rodarTodosOsTestes();