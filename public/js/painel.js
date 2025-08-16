/**
 * Função helper para fazer requisições à API com o token de autorização.
 * @param {string} url - A URL do endpoint da API.
 * @returns {Promise<any>} - A promessa com os dados da resposta.
 */
async function fetchWithAuth(url) {
    const token = localStorage.getItem('token');
    if (!token) {
        exibirMensagem("Sessão expirada. Faça login novamente.", "error");
        window.location.href = '/login'; // Redireciona para o login se não houver token
        return;
    }

    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            // Se a resposta for 401 (Não Autorizado), o token pode ter expirado
            if (response.status === 401) {
                 exibirMensagem("Sessão expirada. Faça login novamente.", "error");
                 localStorage.removeItem('token'); // Limpa o token inválido
                 window.location.href = '/login';
            }
            throw new Error(`Erro na API: ${response.statusText}`);
        }
        
        return await response.json();

    } catch (error) {
        console.error(`Falha ao buscar dados de ${url}:`, error);
        exibirMensagem(`Não foi possível carregar os dados: ${error.message}`, 'error');
    }
}


/**
 * Busca e renderiza os dados para os cards principais do dashboard.
 */
async function buscarDadosCards() {
    const response = await fetchWithAuth('/painel/cards');
    if (response && response.status) {
        renderizarCards(response.data);
    }
}

/**
 * Busca e renderiza os dados para o gráfico de status de ordens.
 */
async function buscarStatusOrdens() {
    const response = await fetchWithAuth('/painel/ordens-status-chart');
    if (response && response.status) {
        renderizarGraficoStatusOrdens(response.data);
    }
}

/**
 * Busca e renderiza as últimas ordens de produção.
 */
async function buscarOrdensRecentes() {
    const response = await fetchWithAuth('/painel/recentes');
    if (response && response.status) {
        renderizarOrdensRecentes(response.data);
    }
}

/**
 * Atualiza os elementos HTML dos cards com os dados recebidos da API.
 * @param {object} data - Objeto com os totais de cada card.
 */
function renderizarCards(data) {
    document.getElementById('card-produtos-count').textContent = data.produtos || 0;
    document.getElementById('card-componentes-count').textContent = data.componentes || 0;
    document.getElementById('card-ordens-pendentes-count').textContent = data.ordensPendentes || 0;
    document.getElementById('card-ordens-andamento-count').textContent = data.ordensEmAndamento || 0;
}


/**
 * Renderiza o gráfico de status de ordens com os dados da API.
 * @param {object} chartData - Objeto contendo labels e datasets para o gráfico.
 */
function renderizarGraficoStatusOrdens(chartData) {
    const ctx = document.getElementById('graficoStatusOrdens');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: chartData.labels,
            datasets: [{
                data: chartData.datasets,
                backgroundColor: ['#28a745', '#ffc107', '#17a2b8'] // Cores para Concluída, Pendente, Em Andamento
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Status das Ordens de Produção'
                }
            }
        }
    });
}

/**
 * Renderiza a lista de atividades recentes (últimas ordens).
 * @param {Array} ordens - Array de objetos de ordens de produção.
 */
function renderizarOrdensRecentes(ordens) {
    const container = document.getElementById('recent-orders-list');
    if (!container) return;

    container.innerHTML = ''; // Limpa a lista antes de renderizar

    if (ordens.length === 0) {
        container.innerHTML = '<li class="list-group-item">Nenhuma atividade recente.</li>';
        return;
    }

    ordens.forEach(ordem => {
        const statusClass = getStatusClass(ordem.status);
        const dataFormatada = new Date(ordem.updatedAt).toLocaleDateString('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        });

        const listItem = `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                <div>
                    <strong>${ordem.produto.codigo || 'N/A'}</strong> - ${ordem.produto.nome || 'Produto não encontrado'}
                    <small class="d-block text-muted">Atualizado em: ${dataFormatada}</small>
                </div>
                <span class="badge ${statusClass}">${ordem.status}</span>
            </li>
        `;
        container.innerHTML += listItem;
    });
}

/**
 * Retorna uma classe de cor do Bootstrap baseada no status da ordem.
 * @param {string} status - O status da ordem.
 * @returns {string} - A classe CSS.
 */
function getStatusClass(status) {
    switch (status) {
        case 'Pendente': return 'bg-warning text-dark';
        case 'Em Andamento': return 'bg-info text-dark';
        case 'Concluída': return 'bg-success';
        case 'Cancelada': return 'bg-danger';
        default: return 'bg-secondary';
    }
}


/**
 * Função principal para inicializar o dashboard, buscando todos os dados.
 */
function inicializarDashboard() {
    // Busca os dados em paralelo para carregar o dashboard mais rápido
    Promise.all([
        buscarDadosCards(),
        buscarStatusOrdens(),
        buscarOrdensRecentes()
    ]);
}


// --- PONTO DE ENTRADA ---
// Roda o script principal quando o DOM estiver completamente carregado.
document.addEventListener("DOMContentLoaded", function () {
    const loginAutomatico = localStorage.getItem("loginAutomatico");
    if (loginAutomatico) {
        exibirMensagem("Login realizado com sucesso!", "sucesso");
        localStorage.removeItem("loginAutomatico");
    }

    // Inicializa o dashboard com dados reais da API
    inicializarDashboard();
});