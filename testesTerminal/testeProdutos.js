// Arquivo: testes/testAPIProdutos.js
const axios = require('axios');

// --- CONFIGURAÇÕES ---
const BASE_URL = 'http://localhost:8081/produto'; // A URL base da sua API de produtos

// !! IMPORTANTE !! Cole aqui o seu token JWT válido após fazer login
const TOKEN_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwOi8vbG9jYWxob3N0IiwiYXVkIjoiaHR0cDovL2xvY2FsaG9zdCIsInN1YiI6ImFjZXNzb19zaXN0ZW1hIiwiaWF0IjoxNzU1MzE0NzA1LCJleHAiOjE3NTc5MDY3MDUsIm5iZiI6MTc1NTMxNDcwNSwianRpIjoiY2E2OWRkMjZlOGU3YjFiZmQyZmY2NmI3YmEzNWE1ZjciLCJjcmVkZW5jaWFsRnVuY2lvbmFyaW8iOjMsImlkRnVuY2lvbmFyaW8iOiI2ODBjMWEyOTQ0ZTgxOTczNzc3NjAwZDQifQ.3wGial7GK93ivhZ2YLEaGPL3Zw1z701EVj0oEgk3WCY'; 

// Crie um cabeçalho de autorização que será usado em todas as requisições
const AUTH_HEADER = {
    headers: { 'Authorization': `Bearer ${TOKEN_JWT}` }
};

// --- DADOS DE EXEMPLO ---
// !! IMPORTANTE !! Substitua pelos IDs que existem no seu banco de dados
const ID_COMPONENTE_EXEMPLO = '688ad086c2a888255e11ec86'; // ID de um componente real
const ID_ETAPA_EXEMPLO = '689003326b8772173fc8ebdf';       // ID de uma etapa real

const novoProdutoData = {
    nome: "Produto de Teste API",
    codigo: `TESTE-API-${Date.now()}`, // Código único para evitar erros
    descricao: "Produto criado via script de teste da API.",
    quantidade: 50,
    precoMontagem: 25.50,
    precoVenda: 99.90,
    componentesNecessarios: [
        {
            componente: ID_COMPONENTE_EXEMPLO,
            quantidade: 2
        }
    ],
    etapas: [ID_ETAPA_EXEMPLO]
};

const produtoAtualizadoData = {
    nome: "Produto de Teste ATUALIZADO",
    descricao: "Esta descrição foi atualizada pelo script.",
    quantidade: 75,
    precoVenda: 109.90,
};


// --- FUNÇÕES DE TESTE ---

// 1. Teste de CRIAÇÃO (POST /)
async function testarCriacao() {
    console.log('--- Iniciando Teste de Criação (POST) ---');
    try {
        const response = await axios.post(BASE_URL, novoProdutoData, AUTH_HEADER);
        console.log('✅ Sucesso! Produto criado:');
        console.log(response.data);
        return response.data.produto._id; // Retorna o ID do produto recém-criado
    } catch (error) {
        console.error('❌ Falha no Teste de Criação:');
        console.error(error.response ? error.response.data : error.message);
        return null;
    }
}

// 2. Teste de LEITURA DE TODOS (GET /readAll)
async function testarLeituraTodos() {
    console.log('\n--- Iniciando Teste de Leitura de Todos (GET /readAll) ---');
    try {
        const response = await axios.get(`${BASE_URL}/readAll`, AUTH_HEADER);
        console.log(`✅ Sucesso! Encontrados ${response.data.produtos.length} produtos.`);
        // console.log(response.data.produtos); // Descomente para ver a lista completa
    } catch (error) {
        console.error('❌ Falha no Teste de Leitura de Todos:');
        console.error(error.response ? error.response.data : error.message);
    }
}

// 3. Teste de LEITURA POR ID (GET /:id)
async function testarLeituraPorId(id) {
    console.log(`\n--- Iniciando Teste de Leitura por ID (${id}) ---`);
    if (!id) {
        console.error('⚠️ Teste pulado: ID do produto não fornecido.');
        return;
    }
    try {
        const response = await axios.get(`${BASE_URL}/${id}`, AUTH_HEADER);
        console.log('✅ Sucesso! Produto encontrado:');
        console.log(response.data.produto);
    } catch (error) {
        console.error(`❌ Falha no Teste de Leitura por ID:`);
        console.error(error.response ? error.response.data : error.message);
    }
}

// 4. Teste de ATUALIZAÇÃO (PUT /:id)
async function testarAtualizacao(id) {
    console.log(`\n--- Iniciando Teste de Atualização (${id}) ---`);
    if (!id) {
        console.error('⚠️ Teste pulado: ID do produto não fornecido.');
        return;
    }
    try {
        const response = await axios.put(`${BASE_URL}/${id}`, produtoAtualizadoData, AUTH_HEADER);
        console.log('✅ Sucesso! Produto atualizado:');
        console.log(response.data.produto);
    } catch (error) {
        console.error(`❌ Falha no Teste de Atualização:`);
        console.error(error.response ? error.response.data : error.message);
    }
}

// 5. Teste de DELEÇÃO (DELETE /:id)
async function testarDelecao(id) {
    console.log(`\n--- Iniciando Teste de Deleção (${id}) ---`);
    if (!id) {
        console.error('⚠️ Teste pulado: ID do produto não fornecido.');
        return;
    }
    try {
        const response = await axios.delete(`${BASE_URL}/${id}`, AUTH_HEADER);
        console.log('✅ Sucesso! Mensagem do servidor:');
        console.log(response.data);
    } catch (error) {
        console.error(`❌ Falha no Teste de Deleção:`);
        console.error(error.response ? error.response.data : error.message);
    }
}


// --- EXECUTOR PRINCIPAL ---
async function rodarTodosOsTestes() {
    console.log('============================================');
    console.log('INICIANDO SUÍTE DE TESTES DA API DE PRODUTOS');
    console.log('============================================');

    if (TOKEN_JWT === 'COLE_SEU_TOKEN_AQUI') {
        console.error("\n❌ ERRO FATAL: O token JWT não foi definido. Edite o script e adicione um token válido.");
        return;
    }

    // Roda os testes em sequência
    const idDoNovoProduto = await testarCriacao();
    await testarLeituraTodos();
    await testarLeituraPorId(idDoNovoProduto);
    await testarAtualizacao(idDoNovoProduto);
    //await testarDelecao(idDoNovoProduto);
    
    console.log('\n--- Verificação Final: Listando todos novamente para confirmar a deleção ---');
    await testarLeituraTodos();
    
    console.log('\n============================================');
    console.log('FIM DA SUÍTE DE TESTES');
    console.log('============================================');
}

// Inicia a execução dos testes
rodarTodosOsTestes();