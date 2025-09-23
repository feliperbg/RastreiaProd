document.addEventListener('DOMContentLoaded', function () {
    const spinner = document.getElementById('loading-spinner');
    const conteudoPagina = document.getElementById('conteudo-pagina');
    
    let ordemProducao = null;
    let userData = null;
    let qrCodeLabelModal = null;
    let motivosDePausa = []; // Armazena os motivos de pausa buscados da API

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
            const [opResponse, motivosResponse] = await Promise.all([
                fetch(`/api/ordens-producao/${opId}`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` } }),
                fetch('/api/motivos/tipo/PAUSA', { headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` } })
            ]);

            if (!opResponse.ok) {
                const errorData = await opResponse.json();
                throw new Error(errorData.msg || 'Falha ao carregar a Ordem de Produção.');
            }
            ordemProducao = (await opResponse.json()).ordem;

            if (motivosResponse.ok) {
                motivosDePausa = await motivosResponse.json();
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
            tr.innerHTML = `<td>${item.componente.nome}</td><td>${item.componente.codigo}</td><td>${item.quantidade}</td>`;
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
            tabelaPausas.innerHTML += `<tr><td>${pausa.motivo}</td><td><span class="badge ${tipoBadge}">${pausa.tipo}</span></td><td>${formatarDataHora(pausa.inicio)}</td><td>${duracao}</td></tr>`;
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
                if (!response.ok) throw new Error(resultData.msg);
                Swal.fire('Iniciada!', 'A etapa foi iniciada com sucesso.', 'success');
                inicializar();
            } catch(error) { Swal.fire('Erro!', error.message, 'error'); }
        }
    }

    window.finalizarEtapa = async function(opId, etapaId) {
        const result = await Swal.fire({
            title: 'Finalizar Etapa?', text: "Você confirma a conclusão desta etapa?", icon: 'question',
            showCancelButton: true, confirmButtonText: 'Sim, finalizar', cancelButtonText: 'Cancelar'
        });
        if (result.isConfirmed) {
            try {
                const response = await fetch(`/api/ordens-producao/${opId}/etapa/${etapaId}/finalizar`, {
                    method: 'POST', headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
                });
                const resultData = await response.json();
                if (!response.ok) throw new Error(resultData.msg);
                Swal.fire('Concluída!', 'A etapa foi finalizada com sucesso.', 'success');
                inicializar();
            } catch(error) { Swal.fire('Erro!', error.message, 'error'); }
        }
    }

    window.pausarEtapa = async function(opId, etapaId) {
        const { value: motivo } = await Swal.fire({
            title: 'Pausar Produção', input: 'text', inputLabel: 'Motivo da Pausa',
            inputPlaceholder: 'Ex: Falta de material, manutenção...', icon: 'question',
            showCancelButton: true, confirmButtonText: 'Sim, pausar', cancelButtonText: 'Cancelar',
            inputValidator: (value) => { if (!value) { return 'Você precisa informar um motivo!' } }
        });
        if (motivo) {
            try {
                const response = await fetch(`/api/ordens-producao/${opId}/etapa/${etapaId}/pausar`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('authToken')}` },
                    body: JSON.stringify({ motivo: motivo })
                });
                const resultData = await response.json();
                if (!response.ok) throw new Error(resultData.msg);
                Swal.fire('Pausada!', 'A produção foi pausada com sucesso.', 'success');
                inicializar();
            } catch(error) { Swal.fire('Erro!', error.message, 'error'); }
        }
    }

    window.retomarEtapa = async function(opId, etapaId) {
        const result = await Swal.fire({
            title: 'Retomar Produção?', text: "Você confirma a retomada da produção?", icon: 'question',
            showCancelButton: true, confirmButtonText: 'Sim, retomar', cancelButtonText: 'Cancelar'
        });
        if (result.isConfirmed) {
            try {
                const response = await fetch(`/api/ordens-producao/${opId}/etapa/${etapaId}/retomar`, {
                    method: 'PATCH', headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
                });
                const resultData = await response.json();
                if (!response.ok) throw new Error(resultData.msg);
                Swal.fire('Retomada!', 'A produção foi retomada com sucesso.', 'success');
                inicializar();
            } catch(error) { Swal.fire('Erro!', error.message, 'error'); }
        }
    }


    // --- FUNÇÕES GLOBAIS DE AÇÃO ---
    window.atualizarRefugo = async function() {
        const { value: novaQuantidade } = await Swal.fire({
            title: 'Lançar Refugo', input: 'number', inputLabel: 'Informe a quantidade total de peças refugadas',
            inputValue: ordemProducao.quantidade_refugo || 0, showCancelButton: true, confirmButtonText: 'Salvar',
            inputValidator: (v) => {
                const numValue = Number(v);
                if (v === '' || v === null || numValue < 0 || numValue > ordemProducao.quantidade) return 'Valor inválido!';
            }
        });
        if (novaQuantidade !== undefined && novaQuantidade !== null) {
            try {
                const response = await fetch(`/api/ordens-producao/${ordemProducao._id}/refugo`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('authToken')}` },
                    body: JSON.stringify({ quantidade_refugo: parseInt(novaQuantidade) })
                });
                const result = await response.json();
                if (!response.ok) throw new Error(result.msg);
                Swal.fire('Sucesso!', 'Quantidade de refugo atualizada.', 'success');
                inicializar();
            } catch(error) { Swal.fire('Erro!', error.message, 'error'); }
        }
    }
    
    window.pausarEtapa = async function(opId, etapaId) {
        if (motivosDePausa.length === 0) return Swal.fire('Atenção!', 'Não há motivos de pausa cadastrados.', 'warning');
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
                const response = await fetch(`/api/ordens-producao/${opId}/etapa/${etapaId}/pausar`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('authToken')}` },
                    body: JSON.stringify(formValues)
                });
                const resultData = await response.json();
                if (!response.ok) throw new Error(resultData.msg);
                Swal.fire('Pausada!', 'A produção foi pausada com sucesso.', 'success');
                inicializar();
            } catch(error) { Swal.fire('Erro!', error.message, 'error'); }
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

    window.gerarPdfParaImpressao = async function(modo) {
        const { jsPDF } = window.jspdf;
        let elementoOriginal, pdfOptions;

        if (modo === 'etiqueta') {
            elementoOriginal = document.getElementById('printable-label');
            pdfOptions = { width: 466, height: 367 };
        } else { // modo 'qrcode'
            elementoOriginal = document.getElementById('printable-label');
            pdfOptions = { width: 150, height: 150 };
        }

        if (!elementoOriginal) {
            Swal.fire('Erro!', 'Não foi possível encontrar o conteúdo para gerar o PDF.', 'error');
            return;
        }

        Swal.fire({
            title: 'Gerando PDF...',
            text: 'Por favor, aguarde.',
            allowOutsideClick: false,
            didOpen: () => { Swal.showLoading(); }
        });

        try {
            const canvas = await html2canvas(elementoOriginal, {
                scale: 3,
                useCORS: true,
                backgroundColor: '#ffffff'
            });

            let finalCanvas = canvas;

            // --- Se for qrcode, recorta o centro em 150x150 ---
            if (modo === 'qrcode') {
                const cropSize = 170 * 3; // 150px * escala (3x no html2canvas)
                const startX = (canvas.width - cropSize) / 2;
                const startY = (canvas.height - cropSize) / 2;

                const croppedCanvas = document.createElement('canvas');
                croppedCanvas.width = cropSize;
                croppedCanvas.height = cropSize;

                const ctx = croppedCanvas.getContext('2d');
                ctx.drawImage(canvas, startX, startY, cropSize, cropSize, 0, 0, cropSize, cropSize);

                finalCanvas = croppedCanvas;
            }

            const imgData = finalCanvas.toDataURL('image/png');

            const pdf = new jsPDF({
                orientation: pdfOptions.width > pdfOptions.height ? 'landscape' : 'portrait',
                unit: 'mm',
                format: [pdfOptions.width, pdfOptions.height]
            });

            pdf.addImage(imgData, 'PNG', 0, 0, pdfOptions.width, pdfOptions.height);

            pdf.autoPrint();
            const pdfUrl = pdf.output('bloburl');
            window.open(pdfUrl, '_blank');

            Swal.fire({
                title: 'Sucesso!',
                text: 'Seu PDF foi gerado. Se uma nova aba não abriu, verifique se o navegador bloqueou o pop-up.',
                icon: 'success',
                timer: 4000
            });

        } catch (error) {
            console.error('Erro ao gerar PDF:', error);
            Swal.fire('Erro!', `Não foi possível gerar o PDF. Detalhes: ${error.message}`, 'error');
        }
    };

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

    inicializar();
});