document.addEventListener('DOMContentLoaded', function () {
    const spinner = document.getElementById('loading-spinner');
    const conteudoPagina = document.getElementById('conteudo-pagina');
    
    let ordemProducao = null;
    let userData = null;
    let qrCodeLabelModal = null;
    let motivosDePausa = []; // Armazena os motivos de pausa buscados da API
    let motivosDeRefugo = []; // Armazena os motivos de refugo buscados da API

    async function inicializar() {
        const modalElement = document.getElementById('qrCodeLabelModal');
        if (modalElement) {
            qrCodeLabelModal = new bootstrap.Modal(modalElement);
        }
        
        const pathParts = window.location.pathname.split('/');
        const opId = pathParts[pathParts.length - 2];

        if (!opId) {
            return Swal.fire('Erro', 'ID da Ordem de Produção não encontrado na URL.', 'error');
        }

        try {
            const [opResponse, motivosPausaResponse, motivosRefugoResponse] = await Promise.all([
                fetch(`/api/ordens-producao/${opId}`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` } }),
                fetch('/api/motivos/tipo/PAUSA', { headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` } }),
                fetch('/api/motivos/tipo/REFUGO', { headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` } })
            ]);

            if (!opResponse.ok) {
                const errorData = await opResponse.json();
                throw new Error(errorData.msg || 'Falha ao carregar a Ordem de Produção.');
            }
            ordemProducao = (await opResponse.json()).ordem;

            if (motivosPausaResponse.ok) {
                motivosDePausa = (await motivosPausaResponse.json()).data || [];
            }
            if (motivosRefugoResponse.ok) {
                motivosDeRefugo = (await motivosRefugoResponse.json()).data || [];
            }

            const userDataString = localStorage.getItem('userData');
            if (!userDataString) {
                throw new Error('Dados do usuário não encontrados. Faça login novamente.');
            }
            userData = JSON.parse(userDataString);

            renderizarPagina();
        } catch (error) {
            console.error(error);
            Swal.fire('Erro', error.message, 'error');
        } finally {
            spinner.classList.add('d-none');
            conteudoPagina.classList.remove('d-none');
        }
    }

    function renderizarPagina() {
        if (!ordemProducao || !userData) return;
        
        const opIdCurto = ordemProducao._id.slice(-6).toUpperCase();
        document.getElementById('op-titulo').textContent = `Ordem de Produção #${opIdCurto}`;
        document.getElementById('op-produto').textContent = ordemProducao.produto.nome;
        document.getElementById('op-quantidade').textContent = ordemProducao.quantidade;
        document.getElementById('op-data-entrega').textContent = formatarData(ordemProducao.dataEntrega);
        document.getElementById('op-criado-por').textContent = ordemProducao.criadoPor ? ordemProducao.criadoPor.nome : 'N/A';
        
        document.getElementById('op-refugo').textContent = ordemProducao.quantidade_refugo || 0;
        const btnEditRefugo = document.getElementById('btn-edit-refugo');
        btnEditRefugo.style.display = ['Concluída', 'Cancelada'].includes(ordemProducao.status) ? 'none' : 'inline-block';

        const statusClasses = { 'Pendente': 'secondary', 'Em Andamento': 'primary', 'Pausada': 'warning', 'Concluída': 'success', 'Cancelada': 'danger' };
        document.getElementById('op-status').innerHTML = `<span class="badge bg-${statusClasses[ordemProducao.status] || 'secondary'}">${ordemProducao.status}</span>`;

        renderizarTabelaComponentes(ordemProducao.produto.componentesNecessarios);
        renderizarHistoricoPausas();
        renderizarHistoricoRefugo();
        renderizarEtapas();

        document.getElementById('btn-qrcode-modal').addEventListener('click', abrirModalQrCode);
    }
    
    function renderizarTabelaComponentes(componentes) {
        const tabelaBody = document.getElementById('componentes-tabela');
        tabelaBody.innerHTML = '';
        if (!componentes || componentes.length === 0) {
            tabelaBody.innerHTML = '<tr><td colspan="3" class="text-center">Nenhum componente necessário.</td></tr>';
            return;
        }
        componentes.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${item.componente ? item.componente.nome : 'N/A'}</td><td>${item.componente ? item.componente.codigo : 'N/A'}</td><td>${item.quantidade ? item.quantidade : 'N/A'}</td>`;
            tabelaBody.appendChild(tr);
        });
    }

    function renderizarHistoricoPausas() {
        const tabelaPausas = document.getElementById('pausas-tabela');
        tabelaPausas.innerHTML = '';
        if (!ordemProducao.pausas || ordemProducao.pausas.length === 0) {
            tabelaPausas.innerHTML = '<tr><td colspan="4" class="text-center text-muted">Nenhuma pausa registrada.</td></tr>';
            return;
        }
        ordemProducao.pausas.forEach(pausa => {
            const duracao = pausa.fim ? calcularDuracao(pausa.inicio, pausa.fim) : 'Em andamento';
            const tipoBadge = pausa.tipo === 'Planejada' ? 'bg-primary' : 'bg-warning text-dark';
            const tipoTexto = pausa.tipo === 'NaoPlanejada' ? 'Não Planejada' : pausa.tipo;
            tabelaPausas.innerHTML += `<tr><td>${pausa.motivo}</td><td><span class="badge ${tipoBadge}">${tipoTexto}</span></td><td>${formatarDataHora(pausa.inicio)}</td><td>${duracao}</td></tr>`;
        });
    }

    function renderizarHistoricoRefugo() {
        const tabelaRefugo = document.getElementById('refugo-tabela');
        tabelaRefugo.innerHTML = '';
        if (!ordemProducao.historico_refugo || ordemProducao.historico_refugo.length === 0) {
            tabelaRefugo.innerHTML = '<tr><td colspan="4" class="text-center text-muted">Nenhum refugo lançado.</td></tr>';
            return;
        }
        // Popula a tabela com o histórico de refugo
        ordemProducao.historico_refugo.forEach(refugo => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${refugo.quantidade}</td><td>${refugo.motivo ? refugo.motivo.descricao : 'N/A'}</td><td>${refugo.funcionario ? refugo.funcionario.nome : 'N/A'}</td><td>${formatarDataHora(refugo.data)}</td>`;
            tabelaRefugo.appendChild(tr);
        });
    }

    function renderizarEtapas() {
        const etapasContainer = document.getElementById('etapas-container');
        etapasContainer.innerHTML = '';
        const ultimaEtapaNaoConcluidaIndex = ordemProducao.produto.etapas.findIndex(etapaDef => {
            const historico = ordemProducao.historicoEtapas.find(h => h.etapa._id === etapaDef._id);
            return !historico || historico.status !== 'Concluída';
        });
        ordemProducao.produto.etapas.forEach((etapaDefinida, index) => {
            const historico = ordemProducao.historicoEtapas.find(e => e.etapa._id === etapaDefinida._id);
            const status = historico ? historico.status : 'Pendente';
            const isFuncionarioResponsavel = etapaDefinida.funcionariosResponsaveis.some(f => f._id === userData._id);
            const podeIniciar = (index === ultimaEtapaNaoConcluidaIndex);
            const podeInteragir = ordemProducao.status !== 'Concluída' && ordemProducao.status !== 'Cancelada';
            const botoes = {
                showIniciarBtn: podeInteragir && status === 'Pendente' && isFuncionarioResponsavel && podeIniciar,
                showPausarBtn: podeInteragir && status === 'Em Andamento' && isFuncionarioResponsavel,
                showRetomarBtn: podeInteragir && status === 'Pausada' && isFuncionarioResponsavel,
                showFinalizarBtn: podeInteragir && status === 'Em Andamento' && isFuncionarioResponsavel
            };
            const cardHtml = criarCardEtapa(etapaDefinida, status, botoes);
            etapasContainer.insertAdjacentHTML('beforeend', cardHtml);
        });
    }

    function criarCardEtapa(etapa, status, botoesVisiveis) {
        const statusClasses = { 'Pendente': { bg: 'secondary', timeline: 'etapa-pendente' }, 'Em Andamento': { bg: 'primary', timeline: 'etapa-andamento' }, 'Pausada': { bg: 'warning', timeline: 'etapa-pendente' }, 'Concluída': { bg: 'success', timeline: 'etapa-concluida' } };
        const statusInfo = statusClasses[status] || statusClasses['Pendente'];
        const funcionariosNomes = etapa.funcionariosResponsaveis.map(f => f.nome).join(', ') || 'Nenhum';
        
        const deptoNome = etapa.departamentoResponsavel ? etapa.departamentoResponsavel.nome : 'N/A';

        let botoesHtml = `<p class="text-muted small m-0 text-center text-lg-end">Aguardando etapa anterior.</p>`;
        if (botoesVisiveis.showIniciarBtn) {
            botoesHtml = `<div class="d-flex justify-content-center justify-content-lg-end"><button class="btn btn-primary btn-sm" onclick="iniciarEtapa('${ordemProducao._id}', '${etapa._id}')"><i class="bi bi-play-circle"></i> Iniciar</button></div>`;
        } else if (botoesVisiveis.showPausarBtn || botoesVisiveis.showRetomarBtn || botoesVisiveis.showFinalizarBtn) {
            // Inicia o container de botões
            botoesHtml = '<div class="action-buttons d-flex flex-wrap gap-2 justify-content-center justify-content-lg-end">';
            
            // Adiciona os botões de ação principais
            if (botoesVisiveis.showPausarBtn) botoesHtml += `<button class="btn btn-warning btn-sm" onclick="pausarEtapa('${ordemProducao._id}', '${etapa._id}')"><i class="bi bi-pause-circle"></i> Pausar</button>`;
            if (botoesVisiveis.showRetomarBtn) botoesHtml += `<button class="btn btn-info btn-sm text-white" onclick="retomarEtapa('${ordemProducao._id}', '${etapa._id}')"><i class="bi bi-play-fill"></i> Retomar</button>`;
            if (botoesVisiveis.showFinalizarBtn) botoesHtml += `<button class="btn btn-success btn-sm" onclick="finalizarEtapa('${ordemProducao._id}', '${etapa._id}')"><i class="bi bi-check-circle"></i> Finalizar</button>`;

            // Adiciona o botão de procedimentos se houver procedimentos
            if (etapa.procedimentos) {
                const titulo = `Procedimentos - ${etapa.nome}`;
                // JSON.stringify é a forma correta e segura de passar strings para o onclick
                botoesHtml += `<button class="btn btn-secondary btn-sm" onclick='verProcedimentos(${JSON.stringify(titulo)}, ${JSON.stringify(etapa.procedimentos)})'><i class="bi bi-list-check"></i> Procedimentos</button>`;
            }

            botoesHtml += '</div>';
        } else if (status === 'Concluída') {
            botoesHtml = '<p class="text-success fw-bold m-0 text-center text-lg-end">Etapa finalizada.</p>';
        }

        return `<div class="etapa-card ${statusInfo.timeline}"><div class="card"><div class="card-body p-3"><div class="row align-items-center"><div class="col-12 col-lg-4 mb-2 mb-lg-0"><h5 class="card-title mb-1 fs-6">${etapa.sequencias}. ${etapa.nome}</h5><span class="badge bg-${statusInfo.bg}">${status}</span></div><div class="col-12 col-lg-5 small text-muted mb-2 mb-lg-0"><strong>Depto:</strong> ${deptoNome} | <strong>Responsáveis:</strong> ${funcionariosNomes}</div><div class="col-12 col-lg-3 mt-2 mt-lg-0">${botoesHtml}</div></div></div></div></div>`;
    }

    // --- FUNÇÕES GLOBAIS DE AÇÃO ---
    window.verProcedimentos = function(titulo, procedimentos) {
        const procedimentosFormatados = procedimentos.replace(/(\s*)(\d+\.)/g, (match, p1, p2, offset) => {
            return offset > 0 ? `<br>${p2}` : p2;
        });

        Swal.fire({
            title: titulo,
            html: `<div style="text-align: left; white-space: pre-wrap; word-wrap: break-word;">${procedimentosFormatados}</div>`,
            icon: 'info',
            confirmButtonText: 'Fechar'
        });
    }

    window.iniciarEtapa = async function(opId, etapaId) {
        const result = await Swal.fire({
            title: 'Iniciar Etapa?', text: "Você confirma o início desta etapa de produção?", icon: 'question',
            showCancelButton: true, confirmButtonText: 'Sim, iniciar', cancelButtonText: 'Cancelar'
        });
        if (result.isConfirmed) {
            try {
                const response = await fetch(`/api/ordens-producao/${opId}/etapa/${etapaId}/iniciar`, {
                    method: 'POST', headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
                });
                const resultData = await response.json();
                if (!response.ok) {
                    if (resultData.status === 'estoque_insuficiente') {
                        const componentesList = resultData.componentes.map(c => `<li>${c.nome} (Necessário: ${c.quantidadeNecessaria}, Em Estoque: ${c.estoqueAtual})</li>`).join('');
                        const { isConfirmed } = await Swal.fire({
                            title: 'Estoque Insuficiente',
                            html: `Os seguintes componentes não possuem estoque suficiente:<ul>${componentesList}</ul>Deseja continuar mesmo assim?`,
                            icon: 'warning',
                            showCancelButton: true,
                            confirmButtonText: 'Sim, continuar',
                            cancelButtonText: 'Cancelar'
                        });

                        if (isConfirmed) {
                            const forceResponse = await fetch(`/api/ordens-producao/${opId}/etapa/${etapaId}/iniciar`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('authToken')}` },
                                body: JSON.stringify({ force: true })
                            });
                            const forceResultData = await forceResponse.json();
                            if (!forceResponse.ok) throw new Error(forceResultData.msg);
                            Swal.fire('Iniciada!', 'A etapa foi iniciada com sucesso (forçado).', 'success');
                    hideLoading();
                            inicializar();
                        }
                    } else {
                        throw new Error(resultData.msg);
                    }
                } else {
                    Swal.fire('Iniciada!', 'A etapa foi iniciada com sucesso.', 'success');
                    hideLoading();
                    inicializar();
                }
            } catch(error) { 
                hideLoading();
                Swal.fire('Erro!', error.message, 'error'); 
            }
        } 
    }

    window.finalizarEtapa = async function(opId, etapaId) {
        const result = await Swal.fire({
            title: 'Finalizar Etapa?', text: "Você confirma a conclusão desta etapa?", icon: 'question',
            showCancelButton: true, confirmButtonText: 'Sim, finalizar', cancelButtonText: 'Cancelar'
        });
        if (result.isConfirmed) {
            showLoading();
            try {
                const response = await fetch(`/api/ordens-producao/${opId}/etapa/${etapaId}/finalizar`, {
                    method: 'POST', headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
                });
                const resultData = await response.json();
                if (!response.ok) throw new Error(resultData.msg);
                hideLoading();
                Swal.fire('Concluída!', 'A etapa foi finalizada com sucesso.', 'success');
                inicializar();
            } catch(error) { 
                hideLoading();
                Swal.fire('Erro!', error.message, 'error'); 
            }
        }
    }

    window.retomarEtapa = async function(opId, etapaId) {
        const result = await Swal.fire({
            title: 'Retomar Produção?', text: "Você confirma a retomada da produção?", icon: 'question',
            showCancelButton: true, confirmButtonText: 'Sim, retomar', cancelButtonText: 'Cancelar'
        });
        if (result.isConfirmed) {
            showLoading();
            try {
                const response = await fetch(`/api/ordens-producao/${opId}/etapa/${etapaId}/retomar`, {
                    method: 'PATCH', headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
                });
                const resultData = await response.json();
                if (!response.ok) throw new Error(resultData.msg);
                hideLoading();
                Swal.fire('Retomada!', 'A produção foi retomada com sucesso.', 'success');
                inicializar();
            } catch(error) { 
                hideLoading();
                Swal.fire('Erro!', error.message, 'error'); 
            }
        }
    }


    // --- FUNÇÕES GLOBAIS DE AÇÃO ---
    window.atualizarRefugo = async function() {
        if (!motivosDeRefugo || motivosDeRefugo.length === 0) {
            return Swal.fire(
                'Atenção!',
                'Não há motivos de refugo cadastrados. Por favor, cadastre um motivo antes de lançar o refugo.',
                'warning'
            );
        }

        const optionsMotivo = motivosDeRefugo.reduce((acc, motivo) => {
            acc[motivo._id] = motivo.descricao;
            return acc;
        }, {});

        const { value: formValues } = await Swal.fire({
            title: 'Lançar Refugo',
            width: '600px', // <-- Aumenta a largura do modal
            html: `
                <label for="swal-quantidade" class="swal2-label">Quantidade</label>
                <input id="swal-quantidade" type="number" min="1" class="swal2-input">
                <label for="swal-motivo" class="swal2-label">Motivo do Refugo</label>
                <select id="swal-motivo" class="swal2-select"></select>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Lançar',
            cancelButtonText: 'Cancelar',
            didOpen: () => {
                const select = document.getElementById('swal-motivo');
                for (const [id, descricao] of Object.entries(optionsMotivo)) {
                    select.add(new Option(descricao, id));
                }
            },
            preConfirm: () => {
                const quantidade = document.getElementById('swal-quantidade').value;
                const motivoId = document.getElementById('swal-motivo').value;
                if (!quantidade || quantidade <= 0 || !motivoId) {
                    Swal.showValidationMessage('Por favor, preencha a quantidade e selecione um motivo.');
                    return false;
                }
                return { quantidade: parseInt(quantidade), motivoId: motivoId };
            }
        });
        if (formValues) {
            try {
                showLoading();
                const response = await fetch(`/api/ordens-producao/${ordemProducao._id}/refugo`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    },
                    body: JSON.stringify(formValues)
                });
                const result = await response.json();
                if (!response.ok) throw new Error(result.msg);
                hideLoading();
                Swal.fire('Sucesso!', 'Quantidade de refugo atualizada.', 'success');
                // Chama a função de inicialização para recarregar todos os dados da OP
                await inicializar();
            } catch (error) {
                hideLoading();
                Swal.fire('Erro!', error.message, 'error'); 
            }
        }
    }
    
    window.pausarEtapa = async function(opId, etapaId) {
        if (!motivosDePausa || motivosDePausa.length === 0) return Swal.fire('Atenção!', 'Não há motivos de pausa cadastrados.', 'warning');
        const optionsMotivo = motivosDePausa.map(m => `<option value="${m.descricao}">${m.descricao}</option>`).join('');

        const { value: formValues } = await Swal.fire({
            title: 'Pausar Produção',
            html: `<div class="mb-3 text-start"><label for="swal-motivo" class="form-label">Motivo</label><select id="swal-motivo" class="form-select">${optionsMotivo}</select></div>
                   <div class="text-start"><label for="swal-tipo" class="form-label">Tipo</label><select id="swal-tipo" class="form-select"><option value="NaoPlanejada" selected>Não Planejada (Perda)</option><option value="Planejada">Planejada (Ex: Almoço)</option></select></div>`,
            focusConfirm: false, showCancelButton: true, confirmButtonText: 'Confirmar Pausa',
            preConfirm: () => ({ motivo: document.getElementById('swal-motivo').value, tipo: document.getElementById('swal-tipo').value })
        });
        
        if (formValues) {
            try {
                showLoading();
                const response = await fetch(`/api/ordens-producao/${opId}/etapa/${etapaId}/pausar`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('authToken')}` },
                    body: JSON.stringify(formValues)
                });
                const resultData = await response.json();
                if (!response.ok) throw new Error(resultData.msg);
                hideLoading();
                Swal.fire('Pausada!', 'A produção foi pausada com sucesso.', 'success');
                inicializar();
            } catch(error) { 
                hideLoading();
                Swal.fire('Erro!', error.message, 'error'); 
            }
        }
    }

    // --- FUNÇÕES DO QR CODE E PDF ---
    function abrirModalQrCode() {
        if (!qrCodeLabelModal || !ordemProducao) return;
        const opIdCurto = ordemProducao._id.slice(-6).toUpperCase();
        document.getElementById('label-op-id').textContent = `OP #${opIdCurto}`;
        document.getElementById('label-produto').textContent = ordemProducao.produto.nome;
        document.getElementById('label-quantidade').textContent = ordemProducao.quantidade;
        gerarQRCode(document.getElementById('qrcode-container-modal'), 150);
        qrCodeLabelModal.show();
    }

    function gerarQRCode(container, size) {
        container.innerHTML = '';
        new QRCode(container, { text: window.location.href, width: size, height: size });
    }

    // --- FUNÇÕES UTILITÁRIAS ---
    function formatarData(dataString) {
        if (!dataString) return 'N/A';
        return new Date(dataString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
    }
    
    function formatarDataHora(dataString) {
        if (!dataString) return 'N/A';
        return new Date(dataString).toLocaleString('pt-BR');
    }

    function calcularDuracao(inicio, fim) {
        if (!inicio || !fim) return 'N/A';
        let diffMs = new Date(fim) - new Date(inicio);
        const horas = Math.floor(diffMs / 3600000);
        const minutos = Math.floor((diffMs % 3600000) / 60000);
        return `${horas.toString().padStart(2, '0')}h ${minutos.toString().padStart(2, '0')}min`;
    }

    // --- FUNÇÕES GLOBAIS (disponíveis no escopo da janela) ---
    window.gerarRelatorioOPCompletoPDF = function() {
        if (window.pdfGenerator) {
            const utils = { formatarData, formatarDataHora, calcularDuracao };
            pdfGenerator.gerarRelatorioOPCompletoPDF(ordemProducao, utils);
        }
    };

    window.gerarPdfParaImpressao = function(modo) {
        if (window.pdfGenerator) {
            pdfGenerator.gerarPdfParaImpressao(modo);
        }
    };

    window.verProcedimentos = function(titulo, procedimentos) {
        const procedimentosFormatados = procedimentos.replace(/(\s*)(\d+\.)/g, (match, p1, p2, offset) => {
            return offset > 0 ? `<br>${p2}` : p2;
        });
        Swal.fire({ title: titulo, html: `<div style="text-align: left; white-space: pre-wrap; word-wrap: break-word;">${procedimentosFormatados}</div>`, icon: 'info', confirmButtonText: 'Fechar' });
    };

    async function executarAcao(titulo, texto, url, method = 'POST', body = null) {
        const result = await Swal.fire({ title: titulo, text: texto, icon: 'question', showCancelButton: true, confirmButtonText: 'Sim', cancelButtonText: 'Cancelar' });
        if (result.isConfirmed) {
            showLoading();
            try {
                const options = { method, headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` } };
                if (body) {
                    options.headers['Content-Type'] = 'application/json';
                    options.body = JSON.stringify(body);
                }
                const response = await fetch(url, options);
                const resultData = await response.json();
                if (!response.ok) throw new Error(resultData.msg);
                hideLoading();
                await Swal.fire('Sucesso!', resultData.msg || 'Ação realizada com sucesso.', 'success');
                
                // Recarrega a página APÓS o usuário fechar o alerta de sucesso
                inicializar(); 
            } catch (error) {
                hideLoading();
                Swal.fire('Erro!', error.message, 'error');
            }
        }
    }

    // A função de iniciar etapa tem uma lógica complexa de estoque, então não usaremos a genérica para ela.
    // window.iniciarEtapa = (opId, etapaId) => executarAcao('Iniciar Etapa?', 'Você confirma o início desta etapa?', `/api/ordens-producao/${opId}/etapa/${etapaId}/iniciar`);
    
    window.finalizarEtapa = (opId, etapaId) => executarAcao('Finalizar Etapa?', 'Você confirma a conclusão desta etapa?', `/api/ordens-producao/${opId}/etapa/${etapaId}/finalizar`);
    window.retomarEtapa = (opId, etapaId) => executarAcao('Retomar Produção?', 'Você confirma a retomada da produção?', `/api/ordens-producao/${opId}/etapa/${etapaId}/retomar`, 'PATCH');

    inicializar();
});