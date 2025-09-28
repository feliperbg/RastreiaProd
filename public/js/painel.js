document.addEventListener("DOMContentLoaded", function () {
    // Exibe mensagem de boas-vindas após login automático
    const loginAutomatico = localStorage.getItem("loginAutomatico");
    if (loginAutomatico) {
        exibirMensagem("Login realizado com sucesso!", "sucesso");
        localStorage.removeItem("loginAutomatico");
    }

    // =================================================================================
    // HELPERS E FUNÇÕES AUXILIARES
    // =================================================================================

    function decodificarToken() {
        const token = localStorage.getItem('authToken');
        if (!token) return null;
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return { id: payload.id, perfil: payload.perfil };
        } catch (e) {
            console.error('Erro ao decodificar o token:', e);
            return null;
        }
    }
    const usuarioLogado = decodificarToken();

    function formatarDuracaoMs(ms) {
        if (ms === null || ms === undefined || ms <= 0) {
            return '00:00:00';
        }
        const totalSegundos = Math.floor(ms / 1000);
        const horas = Math.floor(totalSegundos / 3600).toString().padStart(2, '0');
        const minutos = Math.floor((totalSegundos % 3600) / 60).toString().padStart(2, '0');
        const segundos = (totalSegundos % 60).toString().padStart(2, '0');
        return `${horas}:${minutos}:${segundos}`;
    }

    // =================================================================================
    // FUNÇÕES DE RENDERIZAÇÃO DA UI
    // =================================================================================

    function renderizarCardsInformativos(data) {
        document.getElementById('card-produtos-count').textContent = data.produtos || 0;
        document.getElementById('card-componentes-count').textContent = data.componentes || 0;
        document.getElementById('card-ordens-pendentes-count').textContent = data.ordensPendentes || 0;
        document.getElementById('card-ordens-andamento-count').textContent = data.ordensEmAndamento || 0;
    }

    function renderLineChart(elementId, label, labels, data) {
        const ctx = document.getElementById(elementId);
        if (!ctx) return;
        new Chart(ctx, {
            type: 'line',
            data: { labels: labels, datasets: [{ label: label, data: data, borderColor: '#0dcaf0', backgroundColor: 'rgba(13,202,240,0.2)', fill: true, tension: 0.4 }] },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }

    function renderBarChart(elementId, label, labels, data) {
        const ctx = document.getElementById(elementId);
        if (!ctx) return;
        new Chart(ctx, {
            type: 'bar',
            data: { labels: labels, datasets: [{ label: label, data: data, backgroundColor: '#ffc107', borderColor: '#e6ac00', borderWidth: 1 }] },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }

    function renderDoughnutChart(elementId, labels, data, colors) {
        const ctx = document.getElementById(elementId);
        if (!ctx) return;
        new Chart(ctx, {
            type: 'doughnut',
            data: { labels: labels, datasets: [{ data: data, backgroundColor: colors }] },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }

    function renderKanban(boards) {
        const container = document.getElementById('kanban-container');
        if (!container) return;
        container.innerHTML = '';

        boards.forEach(board => {
            const columnWrapper = document.createElement('div');
            columnWrapper.className = 'col-12 col-md-6 col-lg-6 col-xl-3';
            const columnCard = document.createElement('div');
            columnCard.className = 'kanban-board-card';
            const header = document.createElement('div');
            header.className = `kanban-header text-white ${board.class}`;
            header.innerHTML = `<strong>${board.title}</strong> <span class="badge bg-light text-dark ms-2">${board.items.length}</span>`;
            const body = document.createElement('div');
            body.className = 'kanban-column p-2';
            body.id = `kanban-col-${board.id}`;

            if (board.items.length > 0) {
                const borderClass = board.class.replace('bg-', 'border-');
                board.items.forEach(item => {
                    const taskCard = document.createElement('div');
                    taskCard.className = `task-card ${borderClass}`;
                    const prioridade = item.prioridade || { texto: 'Normal', cor: '#6c757d' };
                    taskCard.innerHTML = `
                        <div class="task-card-body" role="button" onclick="window.location.href='${item.link}'">
                            <div class="d-flex justify-content-between align-items-start">
                                <h6 class="task-title mb-1">${item.title}</h6>
                                <span class="badge ms-2" style="background-color: ${prioridade.cor}; color: #fff; white-space: nowrap;">${prioridade.texto}</span>
                            </div>
                            <div class="task-meta small text-muted">
                                <span data-bs-toggle="tooltip" data-bs-placement="top" title="Quantidade a produzir"><i class="fas fa-box fa-fw me-1"></i> ${item.quantidade || 'N/A'}</span>
                                <span class="ms-2" data-bs-toggle="tooltip" data-bs-placement="top" title="Data de Entrega"><i class="fas fa-calendar-alt fa-fw me-1"></i> ${new Date(item.dataEntrega).toLocaleDateString()}</span>
                            </div>
                            <div class="task-subtitle mt-2">
                                ${item.etapa ? `<span data-bs-toggle="tooltip" data-bs-placement="top" title="Etapa: ${item.etapa}"><i class="fas fa-cogs fa-fw me-1"></i> ${item.etapa}</span>` : ''}
                                ${item.funcionario ? `<span class="ms-3" data-bs-toggle="tooltip" data-bs-placement="top" title="Funcionário: ${item.funcionario}"><i class="fas fa-user fa-fw me-1"></i> ${item.funcionario}</span>` : ''}
                            </div>
                        </div>
                        <div class="task-card-metrics">
                            <span data-bs-toggle="tooltip" data-bs-placement="top" title="Qualidade"><i class="fas fa-check-circle text-success"></i> ${item.taxa_qualidade}%</span>
                            <span data-bs-toggle="tooltip" data-bs-placement="top" title="Refugo"><i class="fas fa-times-circle text-danger"></i> ${item.refugo}</span>
                            <span data-bs-toggle="tooltip" data-bs-placement="top" title="Pausas Não Planejadas"><i class="fas fa-pause-circle text-warning"></i> ${item.pausas}</span>
                        </div>
                        <div class="task-card-footer">
                            <button class="btn btn-sm btn-outline-secondary w-100" data-id="${item.id}">
                                <i class="fas fa-eye me-1"></i> Detalhes
                            </button>
                        </div>`;
                    taskCard.querySelector('.btn-outline-secondary').addEventListener('click', (e) => {
                        e.stopPropagation();
                        abrirModalDetalhes(item.id);
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
        
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }
    
    function renderizarModalDetalhes(ordem) {
        const modalBody = document.getElementById('modalDetalhesBody');
        const modalTitle = document.getElementById('modalDetalhesLabel');
        if (!ordem) {
            modalTitle.textContent = 'Erro';
            modalBody.innerHTML = '<p>Não foi possível carregar os detalhes da ordem de produção.</p>';
            return;
        }
        
        modalTitle.textContent = `Detalhes da OP-${ordem._id.slice(-6).toUpperCase()}`;

        // --- CORREÇÃO APLICADA AQUI ---
        // 1. Defina os mapeadores de classe fora da string principal.
        const statusClasses = {
            'Pendente': 'etapa-pendente',
            'Em Andamento': 'etapa-andamento',
            'Pausada': 'etapa-pausada',
            'Concluída': 'etapa-concluida'
        };
        const statusBadgeClasses = {
            'Pendente': 'bg-secondary',
            'Em Andamento': 'bg-primary',
            'Pausada': 'bg-warning text-dark',
            'Concluída': 'bg-success'
        };

        // 2. Gere o HTML do histórico em uma variável separada.
        const historicoHtml = ordem.historicoEtapas.map(h => {
            const timelineClass = statusClasses[h.status] || 'etapa-pendente';
            const badgeClass = statusBadgeClasses[h.status] || 'bg-secondary';

            return `
            <div class="etapa-card ${timelineClass}">
                <div class="p-2">
                    <h6 class="fw-bold mb-1">${h.etapa.nome}</h6>
                    <span class="badge ${badgeClass}">${h.status}</span>
                    <p class="small text-muted mt-2 mb-0">
                        <strong>Início:</strong> ${h.dataInicio ? new Date(h.dataInicio).toLocaleString('pt-BR') : 'N/A'} <br>
                        <strong>Fim:</strong> ${h.dataFim ? new Date(h.dataFim).toLocaleString('pt-BR') : 'N/A'}
                    </p>
                </div>
            </div>`;
        }).join('');
        // --- FIM DA CORREÇÃO ---

        // 3. Insira a variável com o HTML gerado na string principal.
        modalBody.innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <h5><i class="fas fa-info-circle me-2"></i>Informações Gerais</h5>
                    <ul class="list-group mb-4">
                        <li class="list-group-item d-flex justify-content-between align-items-center">Produto <strong>${ordem.produto.nome}</strong></li>
                        <li class="list-group-item d-flex justify-content-between align-items-center">Status <span class="badge bg-primary">${ordem.status}</span></li>
                        <li class="list-group-item d-flex justify-content-between align-items-center">Prioridade <span class="badge" style="background-color: ${ordem.prioridade.cor};">${ordem.prioridade.texto}</span></li>
                        <li class="list-group-item d-flex justify-content-between align-items-center">Quantidade a Produzir <strong>${ordem.quantidade}</strong></li>
                        <li class="list-group-item d-flex justify-content-between align-items-center">Data de Entrega <strong>${new Date(ordem.dataEntrega).toLocaleDateString('pt-BR')}</strong></li>
                        <li class="list-group-item d-flex justify-content-between align-items-center">Criado por <strong>${ordem.criadoPor.nome}</strong></li>
                        ${ordem.status === 'Cancelada' ? `<li class="list-group-item d-flex justify-content-between align-items-center">Motivo Cancelamento <strong class="text-danger">${ordem.motivoCancelamento?.nome || 'N/A'}</strong></li>` : ''}
                    </ul>
                    <h5><i class="fas fa-chart-line me-2"></i>KPIs de Desempenho</h5>
                    <ul class="list-group mb-4">
                        <li class="list-group-item d-flex justify-content-between align-items-center">Qualidade (Peças Boas) <strong>${ordem.quantidade_boa} / ${ordem.quantidade} (${ordem.taxa_qualidade}%)</strong></li>
                        <li class="list-group-item d-flex justify-content-between align-items-center">Refugo <strong class="text-danger">${ordem.quantidade_refugo} pçs</strong></li>
                        <li class="list-group-item d-flex justify-content-between align-items-center">Performance <strong>${ordem.taxa_performance}%</strong></li>
                        <li class="list-group-item d-flex justify-content-between align-items-center">OEE (Eficiência Global) <strong class="fw-bold">${ordem.oee}%</strong></li>
                    </ul>
                </div>
                <div class="col-md-6">
                    <h5><i class="fas fa-hourglass-half me-2"></i>Análise de Tempo (HH:mm:ss)</h5>
                    <ul class="list-group mb-4">
                        <li class="list-group-item d-flex justify-content-between align-items-center">Duração Total <strong>${formatarDuracaoMs(ordem.duracaoTotalMs)}</strong></li>
                        <li class="list-group-item d-flex justify-content-between align-items-center">Tempo em Pausas <strong>${formatarDuracaoMs(ordem.duracaoPausasMs)}</strong></li>
                        <li class="list-group-item d-flex justify-content-between align-items-center">Tempo Efetivo <strong class="text-success">${formatarDuracaoMs(ordem.tempoEfetivoMs)}</strong></li>
                    </ul>
                    <h5><i class="fas fa-tasks me-2"></i>Histórico de Etapas</h5>
                    <div class="historico-container mb-4">
                        ${historicoHtml}
                    </div>
                </div>
            </div>`;
    }

    // =================================================================================
    // LÓGICA DE BUSCA DE DADOS (API)
    // =================================================================================

    async function fetchWithAuth(url) {
        const token = localStorage.getItem('authToken');
        if (!token) {
            exibirMensagem("Sessão expirada. Faça login novamente.", "error");
            window.location.href = '/';
            return null; // Retorna nulo para a chamada poder tratar
        }
        try {
            const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
            if (!response.ok) {
                if (response.status === 401) {
                    exibirMensagem("Sessão expirada. Faça login novamente.", "error");
                    localStorage.removeItem('authToken');
                    window.location.href = '/';
                }
                throw new Error(`Erro na API: ${response.statusText}`);
            }
            // Não assumimos mais o formato { status, data }, deixamos o caller tratar
            return response.json();
        } catch (error) {
            console.error(`Falha ao buscar dados de ${url}:`, error);
            exibirMensagem(`Não foi possível carregar os dados: ${error.message}`, 'error');
            return null;
        }
    }

    async function buscarDadosParaKanban() {
        const meuPainelSwitch = document.getElementById('filtro-meu-painel');
        const isMeuPainel = meuPainelSwitch ? meuPainelSwitch.checked : false;
        const url = `/api/ordens-producao${isMeuPainel ? '?meuPainel=true' : ''}`;
        
        const response = await fetchWithAuth(url);
        if (!response || !response.status || !response.ordens) return [];

        const kanbanData = [
            { id: '_todo', title: 'Pendente', class: 'bg-warning', items: [] },
            { id: '_doing', title: 'Em Andamento', class: 'bg-primary', items: [] },
            { id: '_paused', title: 'Pausada', class: 'bg-secondary', items: [] },
            { id: '_done', title: 'Concluída', class: 'bg-success', items: [] },
            { id: '_canceled', title: 'Cancelada', class: 'bg-danger', items: [] }
        ];
        const statusMap = { 'Pendente': '_todo', 'Em Andamento': '_doing', 'Pausada': '_paused', 'Concluída': '_done', 'Cancelada': '_canceled' };

        response.ordens.forEach(ordem => {
            const column = kanbanData.find(b => b.id === statusMap[ordem.status]);
            if (column) {
                const etapaAtivaObj = ordem.historicoEtapas.find(e => e.status.toLowerCase() !== 'concluída') || ordem.historicoEtapas[ordem.historicoEtapas.length -1];
                const nomeEtapa = etapaAtivaObj?.etapa?.nome || 'N/A';
                const nomeFuncionario = ordem.funcionarioAtivo?.[0]?.funcionario?.nome || '';
                column.items.push({
                    id: ordem._id,
                    funcionario: nomeFuncionario,
                    etapa: nomeEtapa,
                    title: `OP-${ordem._id.slice(-6).toUpperCase()} - ${ordem.produto.nome}`,
                    link: `/ordens-producao/${ordem._id}/gestao`,
                    quantidade: ordem.quantidade,
                    dataEntrega: ordem.dataEntrega,
                    prioridade: ordem.prioridade,
                    taxa_qualidade: ordem.taxa_qualidade,
                    refugo: ordem.quantidade_refugo,
                    pausas: ordem.pausas.filter(p => p.tipo === 'NaoPlanejada').length
                });
            }
        });
        return kanbanData;
    }
    
    async function abrirModalDetalhes(ordemId) {
        const modal = new bootstrap.Modal(document.getElementById('modalDetalhes'));
        const modalBody = document.getElementById('modalDetalhesBody');
        const modalTitle = document.getElementById('modalDetalhesLabel');

        modalTitle.textContent = 'Carregando...';
        modalBody.innerHTML = '<div class="d-flex justify-content-center"><div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div></div>';
        modal.show();
        
        const response = await fetchWithAuth(`/api/ordens-producao/${ordemId}`);
        // A rota de detalhes retorna { status: true, ordem: {...} }
        if (response && response.status) {
            renderizarModalDetalhes(response.ordem);
        } else {
            renderizarModalDetalhes(null);
        }
    }

    // =================================================================================
    // INICIALIZAÇÃO E POLLING
    // =================================================================================

    const pollingInterval = 30000; // 30 segundos
    let pollingTimer; // Variável para controlar o timer

    async function atualizarKanban() {
        // Limpa o timer anterior para evitar sobreposição
        clearTimeout(pollingTimer);
        try {
            const kanbanData = await buscarDadosParaKanban();
            if (kanbanData) {
                renderKanban(kanbanData);
            }
        } catch (error) {
            console.error("Falha ao atualizar o Kanban:", error);
        } finally {
            // REFINAMENTO: Agenda a próxima atualização usando setTimeout
            pollingTimer = setTimeout(atualizarKanban, pollingInterval);
        }
    }

    async function inicializarDashboard() {
        const [
            cardData,
            etapasFinalizadasData,
            tempoMedioData,
            statusOrdensData
        ] = await Promise.all([
            fetchWithAuth('/api/painel/cards'),
            fetchWithAuth('/api/painel/ordens-finalizadas-chart'),
            fetchWithAuth('/api/painel/tempo-medio-etapas-chart'),
            fetchWithAuth('/api/painel/ordens-status-chart')
        ]);

        if (cardData && cardData.status) renderizarCardsInformativos(cardData.data);
        if (etapasFinalizadasData && etapasFinalizadasData.status) renderLineChart('graficoEtapas', 'Ordens Finalizadas (5 dias)', etapasFinalizadasData.data.labels, etapasFinalizadasData.data.datasets);
        if (tempoMedioData && tempoMedioData.status) renderBarChart('graficoTempo', 'Tempo Médio por Etapa (min)', tempoMedioData.data.labels, tempoMedioData.data.datasets);
        if (statusOrdensData && statusOrdensData.status) renderDoughnutChart('graficoStatusOrdens', statusOrdensData.data.labels, statusOrdensData.data.datasets, ['#28a745', '#ffc107', '#0dcaf0', '#dc3545']);

        // Inicia o ciclo de atualização do Kanban
        atualizarKanban();

        const meuPainelSwitch = document.getElementById('filtro-meu-painel');
        if (meuPainelSwitch) {
            const filtroSalvo = localStorage.getItem('filtroMeuPainel') === 'true';
            meuPainelSwitch.checked = filtroSalvo;
            meuPainelSwitch.addEventListener('change', () => {
                localStorage.setItem('filtroMeuPainel', meuPainelSwitch.checked);
                atualizarKanban();
            });
        }
    }

    inicializarDashboard();
});
