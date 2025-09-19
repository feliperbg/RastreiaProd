document.addEventListener('DOMContentLoaded', function () {
    const spinner = document.getElementById('loading-spinner');
    const conteudoPagina = document.getElementById('conteudo-pagina');
    
    let ordemProducao = null;
    let userData = null;
    let qrCodeLabelModal = null;

    async function inicializar() {
        const modalElement = document.getElementById('qrCodeLabelModal');
        if (modalElement) {
            qrCodeLabelModal = new bootstrap.Modal(modalElement);
        }
        
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
        const opTituloText = `Ordem de Produção #${opIdCurto}`;

        document.getElementById('op-titulo').textContent = opTituloText;
        document.getElementById('op-produto').textContent = ordemProducao.produto.nome;
        document.getElementById('op-quantidade').textContent = ordemProducao.quantidade;
        document.getElementById('op-data-entrega').textContent = formatarData(ordemProducao.dataEntrega);
        document.getElementById('op-criado-por').textContent = ordemProducao.criadoPor ? ordemProducao.criadoPor.nome : 'N/A';
        const tempoMedioOP = ordemProducao.tempoMedioOP ? `${ordemProducao.tempoMedioOP} min` : 'N/D';
        document.getElementById('op-tempo-medio').textContent = tempoMedioOP;

        const statusClasses = {
            'Pendente': 'secondary', 'Em Andamento': 'primary', 'Pausada': 'warning',
            'Concluída': 'success', 'Cancelada': 'danger'
        };
        const statusClass = statusClasses[ordemProducao.status] || 'secondary';
        document.getElementById('op-status').innerHTML = `<span class="badge bg-${statusClass} fw-bold">${ordemProducao.status}</span>`;

        renderizarTabelaComponentes(ordemProducao.produto.componentesNecessarios);
        renderizarEtapas();

        document.getElementById('btn-qrcode-modal').addEventListener('click', abrirModalQrCode);
    }
    
    function abrirModalQrCode() {
        if (!qrCodeLabelModal || !ordemProducao) return;

        const opIdCurto = ordemProducao._id.slice(-6).toUpperCase();
        document.getElementById('label-op-id').textContent = `OP #${opIdCurto}`;
        document.getElementById('label-produto').textContent = ordemProducao.produto.nome;
        document.getElementById('label-quantidade').textContent = ordemProducao.quantidade;

        const qrContainer = document.getElementById('qrcode-container-modal');
        gerarQRCode(qrContainer, 150);
        qrCodeLabelModal.show();
    }

    function gerarQRCode(container, size) {
        container.innerHTML = '';
        new QRCode(container, {
            text: window.location.href,
            width: size,
            height: size,
            colorDark : "#000000",
            colorLight : "#ffffff",
            correctLevel : QRCode.CorrectLevel.H
        });
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

    function criarCardEtapa(etapa, status, botoesVisiveis) {
        const statusClasses = {
            'Pendente': { bg: 'secondary', timeline: 'etapa-pendente' },
            'Em Andamento': { bg: 'primary', timeline: 'etapa-andamento' },
            'Pausada': { bg: 'warning', timeline: 'etapa-pendente' },
            'Concluída': { bg: 'success', timeline: 'etapa-concluida' },
        };
        const statusInfo = statusClasses[status] || statusClasses['Pendente'];
        const funcionariosNomes = etapa.funcionariosResponsaveis.map(f => f.nome).join(', ') || 'Nenhum';
        const tempoMedioEtapa = etapa.tempoMedio ? `${etapa.tempoMedio} min` : 'N/D';
        let botoesHtml = `<p class="text-muted small m-0 text-end">Aguardando etapa anterior.</p>`;
        if (botoesVisiveis.showIniciarBtn) {
            botoesHtml = `<button class="btn btn-primary btn-sm" onclick="iniciarEtapa('${ordemProducao._id}', '${etapa._id}')"><i class="bi bi-play-circle"></i> Iniciar</button>`;
        } else if (botoesVisiveis.showPausarBtn || botoesVisiveis.showRetomarBtn || botoesVisiveis.showFinalizarBtn) {
            botoesHtml = '<div class="action-buttons">';
            if (botoesVisiveis.showPausarBtn) botoesHtml += `<button class="btn btn-warning btn-sm" onclick="pausarEtapa('${ordemProducao._id}', '${etapa._id}')"><i class="bi bi-pause-circle"></i> Pausar</button>`;
            if (botoesVisiveis.showRetomarBtn) botoesHtml += `<button class="btn btn-info btn-sm text-white" onclick="retomarEtapa('${ordemProducao._id}', '${etapa._id}')"><i class="bi bi-play-circle"></i> Retomar</button>`;
            if (botoesVisiveis.showFinalizarBtn) botoesHtml += `<button class="btn btn-success btn-sm" onclick="finalizarEtapa('${ordemProducao._id}', '${etapa._id}')"><i class="bi bi-check-circle"></i> Finalizar</button>`;
            botoesHtml += '</div>';
        } else if (status === 'Concluída') {
            botoesHtml = '<p class="text-success fw-bold m-0 text-end">Etapa finalizada.</p>';
        }
        return `<div class="etapa-card ${statusInfo.timeline}"><div class="card"><div class="card-body p-3"><div class="row align-items-center"><div class="col-md-4"><h5 class="card-title mb-1 fs-6">${etapa.sequencias}. ${etapa.nome}</h5><span class="badge bg-${statusInfo.bg}">${status}</span></div><div class="col-md-5 small text-muted"><strong>Tempo:</strong> ${tempoMedioEtapa} | <strong>Depto:</strong> ${etapa.departamentoResponsavel.nome || 'N/A'} | <strong>Responsáveis:</strong> ${funcionariosNomes}</div><div class="col-md-3">${botoesHtml}</div></div></div></div></div>`;
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
    
    function formatarData(dataString) {
        if (!dataString) return 'N/A';
        const data = new Date(dataString);
        return data.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
    }

    inicializar();
});