// Cole este código dentro da tag <script> do HTML acima
document.addEventListener('DOMContentLoaded', function () {
    const spinner = document.getElementById('loading-spinner');
    const conteudoPagina = document.getElementById('conteudo-pagina');
    
    // Variáveis globais para armazenar os dados
    let ordemProducao = null;
    let userData = null;

    /**
     * Função principal que inicializa a página
     */
    async function inicializar() {
        const pathParts = window.location.pathname.split('/');
        const opId = pathParts[pathParts.length - 1];

        if (!opId) {
            Swal.fire('Erro', 'ID da Ordem de Produção não encontrado na URL.', 'error');
            return;
        }

        try {
            // Busca os dados da OP e do usuário em paralelo para mais performance
            const opResponse = await Promise.all([
                fetch(`/ordem-producao/${opId}`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` } }),
            ]);

            if (!opResponse.ok) throw new Error('Falha ao carregar a Ordem de Produção.');

            const opResult = await opResponse.json();
            
            ordemProducao = opResult.ordem;
            userData = localStorage.getItem('userData');

            renderizarPagina();

        } catch (error) {
            console.error(error);
            Swal.fire('Erro', error.message, 'error');
            spinner.classList.add('d-none');
        }
    }

    /**
     * Renderiza todo o conteúdo da página com base nos dados carregados
     */
    function renderizarPagina() {
        if (!ordemProducao || !userData) return;

        // 1. Preenche o cabeçalho com os detalhes da OP
        document.getElementById('op-titulo').textContent = `Ordem de Produção #${ordemProducao._id.slice(-6).toUpperCase()}`;
        document.getElementById('op-produto').textContent = ordemProducao.produto.nome;
        document.getElementById('op-quantidade').textContent = ordemProducao.quantidade;
        document.getElementById('op-status').innerHTML = `<span class="badge bg-primary">${ordemProducao.status}</span>`;

        // 2. Renderiza a linha do tempo de etapas
        const etapasContainer = document.getElementById('etapas-container');
        etapasContainer.innerHTML = ''; // Limpa o container

        // Lógica para habilitar a próxima etapa
        const ultimaEtapaConcluidaIndex = ordemProducao.produto.etapas.findLastIndex(etapaDefinida => {
            const etapaAtual = ordemProducao.etapaAtual.find(e => e.etapa._id === etapaDefinida._id);
            return etapaAtual && etapaAtual.status === 'Concluída';
        });

        ordemProducao.produto.etapas.forEach((etapaDefinida, index) => {
            const etapaAtual = ordemProducao.etapaAtual.find(e => e.etapa._id === etapaDefinida._id);
            const status = etapaAtual ? etapaAtual.status : 'Pendente';
            
            const isFuncionarioResponsavel = etapaDefinida.funcionariosResponsaveis.some(f => f._id === userData._id);
            const podeIniciar = (index === ultimaEtapaConcluidaIndex + 1);

            const showIniciarBtn = status === 'Pendente' && isFuncionarioResponsavel && podeIniciar;
            const showFinalizarBtn = status === 'Em Andamento' && isFuncionarioResponsavel;

            const cardHtml = criarCardEtapa(etapaDefinida, status, showIniciarBtn, showFinalizarBtn);
            etapasContainer.innerHTML += cardHtml;
        });

        // Mostra o conteúdo e esconde o spinner
        spinner.classList.add('d-none');
        conteudoPagina.classList.remove('d-none');
    }

    /**
     * Cria o HTML para um único card de etapa
     */
    function criarCardEtapa(etapa, status, showIniciar, showFinalizar) {
        const statusClasses = {
            'Pendente': { bg: 'secondary', text: 'Pendente', timeline: 'etapa-pendente' },
            'Em Andamento': { bg: 'primary', text: 'Em Andamento', timeline: 'etapa-andamento' },
            'Concluída': { bg: 'success', text: 'Concluída', timeline: 'etapa-concluida' },
            'Cancelada': { bg: 'danger', text: 'Cancelada', timeline: '' }
        };
        const statusInfo = statusClasses[status];

        const funcionariosNomes = etapa.funcionariosResponsaveis.map(f => f.nome).join(', ');

        let botoesHtml = '<p class="text-muted">Aguardando etapa anterior.</p>';
        if (showIniciar) {
            botoesHtml = `<button class="btn btn-primary" onclick="iniciarEtapa('${ordemProducao._id}', '${etapa._id}')">
                            <i class="bi bi-play-circle"></i> Iniciar Etapa
                          </button>`;
        } else if (showFinalizar) {
            botoesHtml = `<button class="btn btn-success" onclick="finalizarEtapa('${ordemProducao._id}', '${etapa._id}')">
                            <i class="bi bi-check-circle"></i> Finalizar Etapa
                          </button>`;
        } else if (status === 'Concluída') {
             botoesHtml = '<p class="text-success fw-bold">Etapa finalizada.</p>';
        }

        return `
            <div class="etapa-card pb-4 ${statusInfo.timeline}">
                <div class="card">
                    <div class="card-body">
                        <div class="row align-items-center">
                            <div class="col-md-3">
                                <h5 class="card-title">Etapa ${etapa.sequencias}: ${etapa.nome}</h5>
                                <span class="badge bg-${statusInfo.bg}">${statusInfo.text}</span>
                            </div>
                            <div class="col-md-6">
                                <p class="mb-1"><strong>Departamento:</strong> ${etapa.departamentoResponsavel || 'N/A'}</p>
                                <p class="mb-0"><strong>Responsáveis:</strong> ${funcionariosNomes || 'Nenhum'}</p>
                            </div>
                            <div class="col-md-3 text-end">
                                ${botoesHtml}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // --- FUNÇÕES DE AÇÃO ---

    window.iniciarEtapa = async function(opId, etapaId) {
        const result = await Swal.fire({
            title: 'Iniciar Etapa?',
            text: "Você confirma o início desta etapa de produção?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sim, iniciar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                const response = await fetch(`/ordem-producao/${opId}/etapa/${etapaId}/iniciar`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
                });
                const result = await response.json();
                if (!response.ok) throw new Error(result.msg);
                
                Swal.fire('Iniciada!', 'A etapa foi iniciada com sucesso.', 'success');
                inicializar(); // Recarrega a página para refletir o novo estado
            } catch(error) {
                Swal.fire('Erro!', error.message, 'error');
            }
        }
    }

    window.finalizarEtapa = async function(opId, etapaId) {
        const result = await Swal.fire({
            title: 'Finalizar Etapa?',
            text: "Você confirma a conclusão desta etapa?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sim, finalizar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                const response = await fetch(`/ordem-producao/${opId}/etapa/${etapaId}/finalizar`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
                });
                const result = await response.json();
                if (!response.ok) throw new Error(result.msg);

                Swal.fire('Concluída!', 'A etapa foi finalizada com sucesso.', 'success');
                inicializar(); // Recarrega a página para refletir o novo estado
            } catch(error) {
                Swal.fire('Erro!', error.message, 'error');
            }
        }
    }

    // Inicia a aplicação
    inicializar();
});