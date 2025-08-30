// Arquivo: public/js/painel.js

document.addEventListener("DOMContentLoaded", function () {
    const loginAutomatico = localStorage.getItem("loginAutomatico");
    if (loginAutomatico) {
        exibirMensagem("Login realizado com sucesso!", "sucesso");
        localStorage.removeItem("loginAutomatico");
    }

    // =================================================================================
    // FUNÇÕES DE RENDERIZAÇÃO
    // =================================================================================

    function renderKanban(boards) {
        const container = document.getElementById('kanban-container');
        if (!container) return;
        container.innerHTML = '';

        boards.forEach(board => {
            const columnWrapper = document.createElement('div');
            columnWrapper.className = 'col-12 col-md-6 col-lg-3';
            
            const columnCard = document.createElement('div');
            columnCard.className = 'kanban-board-card';

            const header = document.createElement('div');
            header.className = `kanban-header text-white ${board.class}`;
            header.innerHTML = `<strong>${board.title}</strong> <span class="badge bg-light text-dark ms-2">${board.items.length}</span>`;

            const body = document.createElement('div');
            body.className = 'kanban-column p-2';
            body.id = `kanban-col-${board.id}`;

            if (board.items.length > 0) {
                // --- MODIFICAÇÃO PRINCIPAL AQUI ---
                // 1. Converte a classe de background (ex: 'bg-primary') em classe de borda (ex: 'border-primary')
                const borderClass = board.class.replace('bg-', 'border-');

                board.items.forEach(item => {
                    const taskCard = document.createElement('div');
                    // 2. Adiciona a nova classe de borda dinâmica ao card
                    taskCard.className = `task-card ${borderClass}`; 
                    taskCard.setAttribute('role', 'button');

                    // O restante do seu código para criar o conteúdo do card permanece o mesmo...
                    let cardContent = `<div class="task-card-body"> ... </div>`; // (código omitido por brevidade)
                    taskCard.innerHTML = `
                        <div class="task-card-body">
                            <div class="task-title">${item.title}</div>
                            ${(item.etapa || item.funcionario) ? `
                            <div class="task-subtitle">
                                ${item.etapa ? `<span><i class="fas fa-cogs me-1"></i> ${item.etapa}</span>` : ''}
                                ${item.funcionario ? `<span class="ms-3"><i class="fas fa-user me-1"></i> ${item.funcionario}</span>` : ''}
                            </div>
                            ` : ''}
                        </div>`;

                    taskCard.addEventListener('click', () => {
                        if (item.link) {
                            window.location.href = item.link;
                        } else {
                            exibirMensagem('Tarefa sem link definido.', "error");
                        }
                    });
                    body.appendChild(taskCard);
                });
            } else {
                body.innerHTML = '<p class="text-muted small text-center mt-2">Nenhuma ordem aqui.</p>';
            }

            columnCard.appendChild(header);
            columnCard.appendChild(body);
            columnWrapper.appendChild(columnCard);
            container.appendChild(columnWrapper);
        });
    }

    function renderLineChart(elementId, label, labels, data) {
        const ctx = document.getElementById(elementId);
        if (!ctx) return;
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: label,
                    data: data,
                    borderColor: '#0dcaf0',
                    backgroundColor: 'rgba(13,202,240,0.2)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }

    function renderBarChart(elementId, label, labels, data) {
        const ctx = document.getElementById(elementId);
        if (!ctx) return;

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels, 
                datasets: [{
                    label: label,
                    data: data,
                    backgroundColor: '#ffc107',
                    borderColor: '#e6ac00', // Opcional: melhora a estética
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.raw;
                            }
                        }
                    }
                }
            }
        });
    }

    function renderDoughnutChart(elementId, labels, data, colors) {
        const ctx = document.getElementById(elementId);
        if (!ctx) return;
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }

    function renderizarCards(data) {
        console.log(data);
        document.getElementById('card-produtos-count').textContent = data.produtos || 0;
        document.getElementById('card-componentes-count').textContent = data.componentes || 0;
        document.getElementById('card-ordens-pendentes-count').textContent = data.ordensPendentes || 0;
        document.getElementById('card-ordens-andamento-count').textContent = data.ordensEmAndamento || 0;
    }

    // =================================================================================
    // LÓGICA DE BUSCA E TRANSFORMAÇÃO DE DADOS
    // =================================================================================

    async function fetchWithAuth(url) {
        const token = localStorage.getItem('authToken');
        if (!token) {
            exibirMensagem("Sessão expirada. Faça login novamente.", "error");
            window.location.href = '/';
            throw new Error("Token não encontrado");
        }
        try {
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                if (response.status === 401) {
                    exibirMensagem("Sessão expirada. Faça login novamente.", "error");
                    localStorage.removeItem('authToken');
                    window.location.href = '/';
                }
                throw new Error(`Erro na API: ${response.statusText}`);
            }
            const result = await response.json();
            if (!result.status) {
                throw new Error(result.msg || 'A API retornou um erro de status.');
            }
            return result.data || result;
        } catch (error) {
            console.error(`Falha ao buscar dados de ${url}:`, error);
            exibirMensagem(`Não foi possível carregar os dados: ${error.message}`, 'error');
            return null;
        }
    }

    async function buscarDadosParaKanban() {
        // Simula o fetch, substitua pela sua chamada real
        const ordensResponse = await fetchWithAuth('/ordem-producao/readAll');
        if (!ordensResponse || !ordensResponse.ordens) return [];

        const kanbanData = [
            { id: '_todo', title: 'Pendente', class: 'bg-warning', items: [] },
            { id: '_doing', title: 'Em Andamento', class: 'bg-primary', items: [] },
            { id: '_done', title: 'Concluída', class: 'bg-success', items: [] },
            { id: '_canceled', title: 'Cancelada', class: 'bg-danger', items: [] }
        ];

        const statusMap = {
            'Pendente': '_todo',
            'Em Andamento': '_doing',
            'Concluída': '_done',
            'Cancelada': '_canceled'
        };

        ordensResponse.ordens.forEach(ordem => {
            const column = kanbanData.find(b => b.id === statusMap[ordem.status]);

            if (column) {
                const etapaAtivaObj = ordem.etapaAtual.find(e => e.status.toLowerCase() !== 'concluída');
                const nomeEtapa = etapaAtivaObj && etapaAtivaObj.etapa ? etapaAtivaObj.etapa.nome : '';
                const nomeFuncionario = (ordem.funcionarioAtivo && ordem.funcionarioAtivo.length > 0 && ordem.funcionarioAtivo[0].funcionario) 
                                        ? ordem.funcionarioAtivo[0].funcionario.nome 
                                        : '';

                column.items.push({
                    funcionario: nomeFuncionario,
                    etapa: nomeEtapa,
                    title: `OP-${ordem._id.slice(-6).toUpperCase()} - ${ordem.produto.nome}`,
                    link: `/ordem-producao/gestao-op/${ordem._id}`,
                });
            }
        });
        return kanbanData;
    }

    async function buscarDadosGraficoEtapasFinalizadas() {
        const response = await fetchWithAuth('/painel/ordens-finalizadas-chart');
        if (!response) return { labels: [], data: [] };
        return { labels: response.labels, data: response.datasets };
    }

    async function buscarDadosGraficoTempo() {
        const response = await fetchWithAuth('/painel/tempo-medio-etapas-chart');
        if (!response) return { labels: [], data: [] };
        return { labels: response.labels, data: response.datasets };
    }

    async function buscarDadosGraficoStatus() {
        const response = await fetchWithAuth('/painel/ordens-status-chart');
        if (!response) return { labels: [], data: [] };
        return { labels: response.labels, data: response.datasets };
    }

    async function buscarDadosParaCards() {
        return await fetchWithAuth('/painel/cards');
    }

    // =================================================================================
    // INICIALIZAÇÃO DO DASHBOARD
    // =================================================================================

    async function inicializarDashboard() {
        const [
            cardData,
            kanbanData,
            etapasFinalizadasData,
            tempoMedioData,
            statusOrdensData
        ] = await Promise.all([
            buscarDadosParaCards(),
            buscarDadosParaKanban(),
            buscarDadosGraficoEtapasFinalizadas(),
            buscarDadosGraficoTempo(),
            buscarDadosGraficoStatus()
        ]);

        if (cardData) renderizarCards(cardData);
        if (kanbanData) renderKanban(kanbanData);
        if (etapasFinalizadasData) renderLineChart('graficoEtapas', 'Ordens Finalizadas (5 dias)', etapasFinalizadasData.labels, etapasFinalizadasData.data);
        if (tempoMedioData) renderBarChart('graficoTempo', 'Tempo Médio por Etapa (min)', tempoMedioData.labels, tempoMedioData.data);
        if (statusOrdensData) renderDoughnutChart('graficoStatusOrdens', statusOrdensData.labels, statusOrdensData.data, ['#28a745', '#ffc107', '#17a2b8', '#dc3545']);
    }

    inicializarDashboard();
});