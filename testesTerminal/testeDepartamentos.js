// Arquivo: testes/testAPIDepartamentos.js
const axios = require('axios');

// --- CONFIGURAÇÕES ---
const BASE_URL = 'http://localhost:8081/departamento'; // A URL base da sua API de departamentos

// !! IMPORTANTE !! Cole aqui o seu token JWT válido
const TOKEN_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwOi8vbG9jYWxob3N0IiwiYXVkIjoiaHR0cDovL2xvY2FsaG9zdCIsInN1YiI6ImFjZXNzb19zaXN0ZW1hIiwiaWF0IjoxNzU2MDc3OTgxLCJleHAiOjE3NTg2Njk5ODEsIm5iZiI6MTc1NjA3Nzk4MSwianRpIjoiYjM5ZWY5NjZlMThmOWFlYWFiYTNmYjBlNGNiODhmZjgiLCJlbWFpbEZ1bmNpb25hcmlvIjoiZmVsaXBlQGdtYWlsLmNvbSIsIl9pZCI6IjY4YTE0NmQ0Yjc1YzQyZTJiOWNkYTAxYSIsInJvbGUiOiJmdW5jaW9uYXJpbyJ9.eATqEDstuZ_-c0FDhpCngcsV-c9ZTXljQDVRIp0rins';

const AUTH_HEADER = {
    headers: { 'Authorization': `Bearer ${TOKEN_JWT}` }
};

// --- DADOS DE EXEMPLO ---
const novoDepartamentoData = {
    nome: "Departamento de Teste API",
    descricao: "Departamento criado para testes automatizados via script."
};

const departamentoAtualizadoData = {
    nome: "Departamento de Teste (ATUALIZADO)",
    descricao: "Descrição foi atualizada pelo script de teste."
};

// --- FUNÇÕES DE TESTE ---

async function testarCriacao() {
    console.log('--- Iniciando Teste de Criação de Departamento (POST) ---');
    try {
        const response = await axios.post(BASE_URL, novoDepartamentoData, AUTH_HEADER);
        console.log('✅ Sucesso! Departamento criado:');
        console.log(response.data);
        return response.data._id; // Retorna o ID do novo departamento
    } catch (error) {
        console.error('❌ Falha no Teste de Criação:', error.response ? error.response.data : error.message);
        return null;
    }
}

async function testarLeituraTodos() {
    console.log('\n--- Iniciando Teste de Leitura de Todos os Departamentos (GET /readAll) ---');
    try {
        const response = await axios.get(`${BASE_URL}/readAll`, AUTH_HEADER);
        console.log(`✅ Sucesso! Encontrados ${response.data.length} departamentos.`);
        // console.log(response.data); // Descomente para ver a lista completa
    } catch (error) {
        console.error('❌ Falha no Teste de Leitura de Todos:', error.response ? error.response.data : error.message);
    }
}

async function testarLeituraPorId(id) {
    console.log(`\n--- Iniciando Teste de Leitura de Departamento por ID (${id}) ---`);
    if (!id) {
        console.error('⚠️ Teste pulado: ID do departamento não fornecido.');
        return;
    }
    try {
        const response = await axios.get(`${BASE_URL}/${id}`, AUTH_HEADER);
        console.log('✅ Sucesso! Departamento encontrado:');
        console.log(response.data);
    } catch (error) {
        console.error('❌ Falha no Teste de Leitura por ID:', error.response ? error.response.data : error.message);
    }
}

async function testarAtualizacao(id) {
    console.log(`\n--- Iniciando Teste de Atualização de Departamento (${id}) ---`);
    if (!id) {
        console.error('⚠️ Teste pulado: ID do departamento não fornecido.');
        return;
    }
    try {
        const response = await axios.put(`${BASE_URL}/${id}`, departamentoAtualizadoData, AUTH_HEADER);
        console.log('✅ Sucesso! Departamento atualizado:');
        console.log(response.data);
    } catch (error) {
        console.error('❌ Falha no Teste de Atualização:', error.response ? error.response.data : error.message);
    }
}

async function testarDelecao(id) {
    console.log(`\n--- Iniciando Teste de Deleção de Departamento (${id}) ---`);
    if (!id) {
        console.error('⚠️ Teste pulado: ID do departamento não fornecido.');
        return;
    }
    try {
        // O status 204 (No Content) é uma resposta de sucesso sem corpo
        await axios.delete(`${BASE_URL}/${id}`, AUTH_HEADER);
        console.log('✅ Sucesso! Departamento deletado (Status 204 No Content).');
    } catch (error) {
        console.error('❌ Falha no Teste de Deleção:', error.response ? error.response.data : error.message);
    }
}

// --- EXECUTOR PRINCIPAL ---
async function rodarTodosOsTestes() {
    console.log('\n==================================================');
    console.log('INICIANDO SUÍTE DE TESTES DA API DE DEPARTAMENTOS');
    console.log('==================================================');
    if (TOKEN_JWT.includes('cole-aqui-o-seu-token')) {
        console.error("\n❌ ERRO FATAL: O token JWT não foi definido. Edite o arquivo e cole seu token.");
        return;
    }

    // Fluxo do teste
    const idDoNovoDepartamento = await testarCriacao();
    await testarLeituraTodos();
    await testarLeituraPorId(idDoNovoDepartamento);
    await testarAtualizacao(idDoNovoDepartamento);
    //await testarDelecao(idDoNovoDepartamento);

    console.log('\n--- Verificando se a deleção funcionou (espera-se 1 departamento a menos) ---');
    await testarLeituraTodos();

    console.log('\nFIM DA SUÍTE DE TESTES DE DEPARTAMENTOS');
}

rodarTodosOsTestes();