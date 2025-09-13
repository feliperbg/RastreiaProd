document.addEventListener('DOMContentLoaded', function () {
    const spinner = document.getElementById('loading-spinner');
    const conteudoPagina = document.getElementById('conteudo-pagina');
    
    let ordemProducao = null;
    let userData = null;

    async function inicializar() {
        const pathParts = window.location.pathname.split('/');
        const opId = pathParts[pathParts.length - 2];

        if (!opId) {
            Swal.fire('Erro', 'ID da Ordem de Produção não encontrado na URL.', 'error');
            return;
        }

        try {
            const opResponse = await fetch(`/api/ordens-producao/${opId}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}`} 
            });

            if (!opResponse.ok) {
                const errorData = await opResponse.json();
                throw new Error(errorData.msg || 'Falha ao carregar a Ordem de Produção.');
            }

            const opResult = await opResponse.json();
            ordemProducao = opResult.ordem;

            const userDataString = localStorage.getItem('userData');
            if (!userDataString) {
                throw new Error('Dados do usuário não encontrados. Faça login novamente.');
            }
            userData = JSON.parse(userDataString);

            gerarQRCode();
            renderizarPagina();

        } catch (error) {
            console.error(error);
            Swal.fire('Erro', error.message, 'error');
            spinner.classList.add('d-none');
        }
    }

    function gerarQRCode() {
        const container = document.getElementById('qrcode-container');
        container.innerHTML = '';
        new QRCode(container, {
            text: window.location.href,
            width: 128,
            height: 128,
            colorDark : "#000000",
            colorLight : "#ffffff",
            correctLevel : QRCode.CorrectLevel.H
        });
    }

    function renderizarPagina() {
        if (!ordemProducao || !userData) return;

        document.getElementById('op-titulo').textContent = `Ordem de Produção #${ordemProducao._id.slice(-6).toUpperCase()}`;
        document.getElementById('op-produto').textContent = ordemProducao.produto.nome;
        document.getElementById('op-quantidade').textContent = ordemProducao.quantidade;
        document.getElementById('op-data-entrega').textContent = formatarData(ordemProducao.dataEntrega);
        document.getElementById('op-criado-por').textContent = ordemProducao.criadoPor ? ordemProducao.criadoPor.nome : 'N/A';
        const tempoMedioOP = ordemProducao.tempoMedioOP ? `${ordemProducao.tempoMedioOP} min` : 'Tempo indefinido';
        document.getElementById('op-tempo-medio').textContent = tempoMedioOP;

        const statusClasses = {
            'Pendente': { bg: 'secondary', text: 'Pendente'},
            'Em Andamento': { bg: 'primary', text: 'Em Andamento'},
            'Pausada': { bg: 'warning', text: 'Pausada' },
            'Concluída': { bg: 'success', text: 'Concluída' },
            'Cancelada': { bg: 'danger', text: 'Cancelada' }
        };
        const statusInfo = statusClasses[ordemProducao.status] || statusClasses['Pendente'];
        document.getElementById('op-status').innerHTML = `<h1 class="badge bg-${statusInfo.bg}" fw-bold m-0>${statusInfo.text}</h1>`;
        renderizarTabelaComponentes(ordemProducao.produto.componentesNecessarios);

        const etapasContainer = document.getElementById('etapas-container');
        etapasContainer.innerHTML = '';

        const ultimaEtapaConcluidaIndex = ordemProducao.produto.etapas.findIndex(etapaDef => {
            const historicoEtapas = ordemProducao.historicoEtapas.find(e => e.etapa._id === etapaDef._id);
            return !historicoEtapas || historicoEtapas.status !== 'Concluída';
        });

        ordemProducao.produto.etapas.forEach((etapaDefinida, index) => {
            const historicoEtapas = ordemProducao.historicoEtapas.find(e => e.etapa._id === etapaDefinida._id);
            const status = historicoEtapas ? historicoEtapas.status : 'Pendente';
            
            // --- AQUI ESTÁ A CORREÇÃO ---
            // A lógica de comparação e o console.log devem estar dentro da mesma função de callback.
            const isFuncionarioResponsavel = etapaDefinida.funcionariosResponsaveis.some(f => {
                console.log(`Comparando: ${f._id} === ${userData._id}`); // Log de debug opcional
                return f._id === userData._id;
            });

            console.log(`Etapa: ${etapaDefinida.nome}, isFuncionarioResponsavel: ${isFuncionarioResponsavel}`);
            
            const podeIniciar = (index === ultimaEtapaConcluidaIndex);

            const podeInteragir = ordemProducao.status !== 'Concluída' && 
                                  ordemProducao.status !== 'Cancelada';

            const showIniciarBtn = podeInteragir && status === 'Pendente' && isFuncionarioResponsavel && podeIniciar;
            const showPausarBtn = podeInteragir && status === 'Em Andamento' && isFuncionarioResponsavel;
            const showRetomarBtn = podeInteragir && status === 'Pausada' && isFuncionarioResponsavel;
            const showFinalizarBtn = podeInteragir && status === 'Em Andamento' && isFuncionarioResponsavel;

            const cardHtml = criarCardEtapa(etapaDefinida, status, { showIniciarBtn, showPausarBtn, showRetomarBtn, showFinalizarBtn });
            etapasContainer.innerHTML += cardHtml;
        });

        spinner.classList.add('d-none');
        conteudoPagina.classList.remove('d-none');
    }

    function renderizarTabelaComponentes(componentes) {
        const tabelaBody = document.getElementById('componentes-tabela');
        tabelaBody.innerHTML = '';
        if (!componentes || componentes.length === 0) {
            tabelaBody.innerHTML = '<tr><td colspan="3" class="text-center">Nenhum componente necessário para este produto.</td></tr>';
            return;
        }
        componentes.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${item.componente.nome}</td>
                <td>${item.componente.codigo}</td>
                <td>${item.quantidade}</td>
            `;
            tabelaBody.appendChild(tr);
        });
    }

    function criarCardEtapa(etapa, status, botoesVisiveis) {
        const statusClasses = {
            'Pendente':     { bg: 'secondary', text: 'Pendente',   timeline: 'etapa-pendente' },
            'Em Andamento': { bg: 'primary',   text: 'Em Andamento', timeline: 'etapa-andamento' },
            'Pausada':      { bg: 'warning',   text: 'Pausada',      timeline: 'etapa-pendente' },
            'Concluída':    { bg: 'success',   text: 'Concluída',    timeline: 'etapa-concluida' },
        };

        const statusInfo = statusClasses[status] || statusClasses['Pendente'];
        const funcionariosNomes = etapa.funcionariosResponsaveis.map(f => f.nome).join(', ');
        const tempoMedioEtapa = etapa.tempoMedio ? `${etapa.tempoMedio} min` : 'Tempo indefinido';

        let botoesHtml = `<p class="text-muted small m-0">Aguardando etapa anterior ou permissão.</p>`;
        if (botoesVisiveis.showIniciarBtn) {
            botoesHtml = `<button class="btn btn-primary btn-sm" onclick="iniciarEtapa('${ordemProducao._id}', '${etapa._id}')">
                                <i class="bi bi-play-circle"></i> Iniciar
                              </button>`;
        } else if (botoesVisiveis.showPausarBtn || botoesVisiveis.showRetomarBtn || botoesVisiveis.showFinalizarBtn) {
            botoesHtml = '<div class="action-buttons">';
            if (botoesVisiveis.showPausarBtn) {
                botoesHtml += `<button class="btn btn-warning btn-sm" onclick="pausarEtapa('${ordemProducao._id}', '${etapa._id}')">
                                    <i class="bi bi-pause-circle"></i> Pausar
                                   </button>`;
            }
            if (botoesVisiveis.showRetomarBtn) {
                botoesHtml += `<button class="btn btn-info btn-sm" onclick="retomarEtapa('${ordemProducao._id}', '${etapa._id}')">
                                    <i class="bi bi-play-circle"></i> Retomar
                                   </button>`;
            }
            if (botoesVisiveis.showFinalizarBtn) {
                botoesHtml += `<button class="btn btn-success btn-sm" onclick="finalizarEtapa('${ordemProducao._id}', '${etapa._id}')">
                                    <i class="bi bi-check-circle"></i> Finalizar
                                   </button>`;
            }
            botoesHtml += '</div>';
        } else if (status === 'Concluída') {
            botoesHtml = '<p class="text-success fw-bold m-0">Etapa finalizada.</p>';
        }

        return `
            <div class="etapa-card pb-4 ${statusInfo.timeline}">
                <div class="card">
                    <div class="card-body">
                        <div class="row align-items-center">
                            <div class="col-md-3">
                                <h5 class="card-title mb-1">Etapa ${etapa.sequencias}: ${etapa.nome}</h5>
                                <span class="badge bg-${statusInfo.bg}">${statusInfo.text}</span>
                            </div>
                            <div class="col-md-6">
                                <p class="mb-1"><strong>Tempo Médio da Etapa:</strong> ${tempoMedioEtapa}</p>
                                <p class="mb-1"><strong>Departamento:</strong> ${etapa.departamentoResponsavel.nome || 'N/A'}</p>
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
                const response = await fetch(`/api/ordens-producao/${opId}/etapa/${etapaId}/iniciar`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
                });
                const result = await response.json();
                if (!response.ok) throw new Error(result.msg);
                
                Swal.fire('Iniciada!', 'A etapa foi iniciada com sucesso.', 'success');
                inicializar();
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
                const response = await fetch(`/api/ordens-producao/${opId}/etapa/${etapaId}/finalizar`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
                });
                const result = await response.json();
                if (!response.ok) throw new Error(result.msg);

                Swal.fire('Concluída!', 'A etapa foi finalizada com sucesso.', 'success');
                inicializar();
            } catch(error) {
                Swal.fire('Erro!', error.message, 'error');
            }
        }
    }

    window.pausarEtapa = async function(opId, etapaId) {
        const { value: motivo } = await Swal.fire({
            title: 'Pausar Produção',
            input: 'text',
            inputLabel: 'Motivo da Pausa',
            inputPlaceholder: 'Ex: Falta de material, manutenção de máquina...',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sim, pausar',
            cancelButtonText: 'Cancelar',
            inputValidator: (value) => {
                if (!value) {
                    return 'Você precisa informar um motivo para a pausa!'
                }
            }
        });

        if (motivo) {
            try {
                const response = await fetch(`/api/ordens-producao/${opId}/etapa/${etapaId}/pausar`, {
                    method: 'PATCH',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}` 
                    },
                    body: JSON.stringify({ motivo: motivo })
                });
                const result = await response.json();
                if (!response.ok) throw new Error(result.msg);

                Swal.fire('Pausada!', 'A produção foi pausada com sucesso.', 'success');
                inicializar();
            } catch(error) {
                Swal.fire('Erro!', error.message, 'error');
            }
        }
    }

    window.retomarEtapa = async function(opId, etapaId) {
        const result = await Swal.fire({
            title: 'Retomar Produção?',
            text: "Você confirma a retomada da produção desta ordem?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sim, retomar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                const response = await fetch(`/api/ordens-producao/${opId}/etapa/${etapaId}/retomar`, {
                    method: 'PATCH',
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
                });
                const result = await response.json();
                if (!response.ok) throw new Error(result.msg);

                Swal.fire('Retomada!', 'A produção foi retomada com sucesso.', 'success');
                inicializar();
            } catch(error) {
                Swal.fire('Erro!', error.message, 'error');
            }
        }
    }

    inicializar();
});
