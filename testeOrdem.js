// Exemplo para testar API de Ordem de Produção
// Salve como testeOrdemProducao.js e rode com: node testeOrdemProducao.js

const axios = require('axios');

const API_URL = 'http://localhost:8081/ordem-producao'; // ajuste se necessário
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwOi8vbG9jYWxob3N0IiwiYXVkIjoiaHR0cDovL2xvY2FsaG9zdCIsInN1YiI6ImFjZXNzb19zaXN0ZW1hIiwiaWF0IjoxNzQ3MjE3NjkzLCJleHAiOjE3NDk4MDk2OTMsIm5iZiI6MTc0NzIxNzY5MywianRpIjoiZmUzNmQyNzBkNjUzNzRmOGExMmFmYzQyMTk2MGU4MTUiLCJjcmVkZW5jaWFsRnVuY2lvbmFyaW8iOjcsImlkRnVuY2lvbmFyaW8iOiI2ODBhZTkwZjljMGRiMzZjZDJlODM4ZTkifQ.NObEyNszePuZS8f-thajqU4ZCadiXLQvuGg9his8Dew'; // coloque seu token JWT válido

// Exemplo de dados para criar uma ordem
const novaOrdem = {
  status: 0,
  produto: '6813cc1c0dbcb4be6ac4fa53', // Substitua por um ObjectId válido de produto
  etapa: ['6827178d7563a533b9fd2b71'],
  funcionarioAtivo: ['680ae90f9c0db36cd2e838e9','682483e66e0e03bb87aceae8'],
  timestampProducao: { inicio: new Date() }
};

async function testarAPI() {
  try {
    // 1. Criar ordem
    const criar = await axios.post(API_URL, novaOrdem, {
      headers: { Authorization: `Bearer ${AUTH_TOKEN}` }
    });
    console.log('Criada:', criar.data);

    const ordemId = criar.data.ordem.id;

    // 2. Listar todas as ordens
    const listar = await axios.get(`${API_URL}/readALL`, {
      headers: { Authorization: `Bearer ${AUTH_TOKEN}` }
    });
    console.log('Lista:', listar.data);

    // 3. Buscar ordem por ID
    const buscar = await axios.get(`${API_URL}/${ordemId}`, {
      headers: { Authorization: `Bearer ${AUTH_TOKEN}` }
    });
    console.log('Buscar por ID:', buscar.data);

    // 4. Atualizar ordem
    const atualizar = await axios.put(`${API_URL}/${ordemId}`, {
      status: 1
    }, {
      headers: { Authorization: `Bearer ${AUTH_TOKEN}` }
    });
    console.log('Atualizada:', atualizar.data);

    // 5. Deletar ordem
    const deletar = await axios.delete(`${API_URL}/${ordemId}`, {
      headers: { Authorization: `Bearer ${AUTH_TOKEN}` }
    });
    console.log('Deletada:', deletar.data);

  } catch (err) {
    if (err.response) {
      console.error('Erro:', err.response.data);
    } else {
      console.error('Erro:', err.message);
    }
  }
}

testarAPI();