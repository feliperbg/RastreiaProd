// Arquivo: public/js/gestao-op.js
document.addEventListener('DOMContentLoaded', function () {
    const spinner = document.getElementById('loading-spinner');
    const conteudoPagina = document.getElementById('conteudo-pagina');
    
    let ordemProducao = null;
    let userData = null;

    async function inicializar() {
        const pathParts = window.location.pathname.split('/');
        const opId = pathParts[pathParts.length - 1];

        if (!opId) {
            Swal.fire('Erro', 'ID da Ordem de Produção não encontrado na URL.', 'error');
            return;
        }

        try {
            const opResponse = await fetch(`/ordem-producao/${opId}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}`} 
            });

            if (!opResponse.ok) {
                const errorData = await opResponse.json();
                throw new Error(errorData.msg || 'Falha ao carregar a Ordem de Produção.');
            }

            const opResult = await opResponse.json();
            console.log(opResult);
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
        document.getElementById('op-status').innerHTML = `<span class="badge bg-primary fs-6">${ordemProducao.status}</span>`;

        console.log(ordemProducao.produto);
        renderizarTabelaComponentes(ordemProducao.produto.componentesNecessarios);

        const etapasContainer = document.getElementById('etapas-container');
        etapasContainer.innerHTML = '';

        const ultimaEtapaConcluidaIndex = ordemProducao.produto.etapas.findIndex(etapaDef => {
            const etapaAtual = ordemProducao.etapaAtual.find(e => e.etapa._id === etapaDef._id);
            return !etapaAtual || etapaAtual.status !== 'Concluída';
        });

        ordemProducao.produto.etapas.forEach((etapaDefinida, index) => {
            const etapaAtual = ordemProducao.etapaAtual.find(e => e.etapa._id === etapaDefinida._id);
            const status = etapaAtual ? etapaAtual.status : 'Pendente';
            
            const isFuncionarioResponsavel = etapaDefinida.funcionariosResponsaveis.some(f => f._id === userData._id);
            
            const podeIniciar = (index === ultimaEtapaConcluidaIndex);

            const showIniciarBtn = status === 'Pendente' && isFuncionarioResponsavel && podeIniciar;
            const showFinalizarBtn = status === 'Em Andamento' && isFuncionarioResponsavel;

            const cardHtml = criarCardEtapa(etapaDefinida, status, showIniciarBtn, showFinalizarBtn);
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
        console.log(componentes);
        componentes.forEach(item => {
            console.log(item);
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${item.componente.nome}</td>
                <td>${item.componente.codigo}</td>
                <td>${item.quantidade}</td>
            `;
            tabelaBody.appendChild(tr);
        });
    }

    function criarCardEtapa(etapa, status, showIniciar, showFinalizar) {
        const statusClasses = {
            'Pendente': { bg: 'secondary', text: 'Pendente', timeline: 'etapa-pendente' },
            'Em Andamento': { bg: 'primary', text: 'Em Andamento', timeline: 'etapa-andamento' },
            'Concluída': { bg: 'success', text: 'Concluída', timeline: 'etapa-concluida' }
        };
        const statusInfo = statusClasses[status] || statusClasses['Pendente'];
        const funcionariosNomes = etapa.funcionariosResponsaveis.map(f => f.nome).join(', ');

        let botoesHtml = `<p class="text-muted small m-0">Aguardando etapa anterior ou permissão.</p>`;
        if (showIniciar) {
            botoesHtml = `<button class="btn btn-primary" onclick="iniciarEtapa('${ordemProducao._id}', '${etapa._id}')">
                            <i class="bi bi-play-circle"></i> Iniciar Etapa
                          </button>`;
        } else if (showFinalizar) {
            botoesHtml = `<button class="btn btn-success" onclick="finalizarEtapa('${ordemProducao._id}', '${etapa._id}')">
                            <i class="bi bi-check-circle"></i> Finalizar Etapa
                          </button>`;
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

    // --- FUNÇÕES DE AÇÃO (Iniciar/Finalizar) ---
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
                const response = await fetch(`/ordem-producao/${opId}/etapa/${etapaId}/finalizar`, {
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

    inicializar();
});
