    // Arquivo: public/js/ordem-producao.js

    let listaDeOrdens = []; // Armazena a lista completa de ordens para re-renderizar
    // Carrega a configuração de ordenação salva ou usa o padrão
    let sortConfig = JSON.parse(localStorage.getItem('opSortConfig')) || { column: null, direction: 'ascending' };


    document.addEventListener("DOMContentLoaded", function() {
        carregarTabela();

        // Configura o filtro específico para a tabela de Ordens de Produção
        const filtroInput = document.getElementById('filtro-texto');
        const filtroStatus = document.getElementById('filtro-status');

        if (filtroInput && filtroStatus) {
            // Restaura os valores dos filtros salvos no localStorage
            filtroInput.value = localStorage.getItem('opFiltroTexto') || '';
            filtroStatus.value = localStorage.getItem('opFiltroStatus') || '';

            // Adiciona os listeners para aplicar os filtros
            // Restaura o valor do filtro salvo no localStorage
            filtroInput.addEventListener('keyup', () => {
                localStorage.setItem('opFiltroTexto', filtroInput.value);
                aplicarFiltros();
            });

            filtroStatus.addEventListener('change', () => {
                localStorage.setItem('opFiltroStatus', filtroStatus.value);
                aplicarFiltros();
            });

            // Aplica os filtros iniciais ao carregar a página
            aplicarFiltros();
        }

        // Adiciona eventos de clique para os cabeçalhos ordenáveis
        document.querySelectorAll('.sortable').forEach(header => {
            header.addEventListener('click', () => {
                const column = parseInt(header.dataset.column);
                const type = header.dataset.sortType;
                
                if (sortConfig.column === column) {
                    sortConfig.direction = sortConfig.direction === 'ascending' ? 'descending' : 'ascending';
                } else {
                    sortConfig = { column, direction: 'ascending' };
                }
                // Salva a nova configuração de ordenação no localStorage
                localStorage.setItem('opSortConfig', JSON.stringify(sortConfig));
                ordenarErenderizar(column, type, sortConfig.direction);
            });
        });
    });

    /**
     * Aplica todos os filtros (texto, status, prioridade) à tabela de ordens de produção.
     */
    function aplicarFiltros() {
        const filtroTexto = (document.getElementById('filtro-texto').value || '').toUpperCase();
        const filtroStatus = (document.getElementById('filtro-status').value || '').toUpperCase();

        const tabela = document.getElementById("tabela-ordem-producoes");
        const linhas = tabela.getElementsByTagName("tr");

        for (let i = 0; i < linhas.length; i++) {
            const colunas = linhas[i].getElementsByTagName("td");
            if (colunas.length === 0) continue;

            // Extrai o conteúdo das colunas relevantes
            const textoPesquisa = `${colunas[0]?.textContent || ''} ${colunas[4]?.textContent || ''} ${colunas[8]?.textContent || ''} ${colunas[9]?.textContent || ''}`.toUpperCase();
            const statusLinha = (colunas[3]?.textContent || '').toUpperCase();

            // Verifica as condições dos filtros
            const matchTexto = filtroTexto === '' || textoPesquisa.includes(filtroTexto);
            const matchStatus = filtroStatus === '' || statusLinha === filtroStatus;

            // A linha só é visível se corresponder a TODOS os filtros ativos
            if (matchTexto && matchStatus) {
                linhas[i].style.display = '';
            } else {
                linhas[i].style.display = 'none';
            }
        }
    }

    /**
     * Ordena a lista de ordens e renderiza a tabela novamente.
     * @param {number} columnIndex - O índice da coluna para ordenar.
     * @param {string} type - O tipo de dado ('text', 'number', 'date').
     * @param {string} direction - A direção ('ascending' ou 'descending').
     */
    function ordenarErenderizar(columnIndex, type, direction) {
        const multiplier = direction === 'ascending' ? 1 : -1;

        listaDeOrdens.sort((a, b) => {
            // Para extrair o valor, precisamos simular a criação da linha e pegar o texto da célula
            const valA = extrairValorDaOrdem(a, columnIndex);
            const valB = extrairValorDaOrdem(b, columnIndex);

            switch (type) {
                case 'number':
                    const numA = parseFloat(valA) || 0;
                    const numB = parseFloat(valB) || 0;
                    return (numA - numB) * multiplier;
                case 'date':
                    // Converte dd/mm/yyyy para um objeto Date
                    const dateA = valA.split('/').reverse().join('-');
                    const dateB = valB.split('/').reverse().join('-');
                    return (new Date(dateA) - new Date(dateB)) * multiplier;
                case 'text':
                default:
                    return valA.localeCompare(valB, 'pt-BR', { sensitivity: 'base' }) * multiplier;
            }
        });

        renderizarTabela(listaDeOrdens);
        atualizarIconesOrdenacao();
    }

    /**
     * Atualiza os ícones de ordenação nos cabeçalhos da tabela.
     */
    function atualizarIconesOrdenacao() {
        document.querySelectorAll('.sortable i').forEach(icon => {
            icon.className = 'bi bi-arrow-down-up'; // Reseta todos
        });

        const headerAtivo = document.querySelector(`.sortable[data-column="${sortConfig.column}"] i`);
        if (headerAtivo) {
            headerAtivo.className = sortConfig.direction === 'ascending' ? 'bi bi-sort-up-alt' : 'bi bi-sort-down';
        }
    }


    async function carregarTabela() {
        try {
            showLoading();

            const response = await fetch('/api/ordens-producao', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
            });

            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }

            const resultado = await response.json();
            const tabela = document.getElementById("tabela-ordem-producoes");
            tabela.innerHTML = "";

            if (resultado.status !== true || !Array.isArray(resultado.ordens)) {
                throw new Error("Resposta da API inválida ou sem ordens.");
            }

            listaDeOrdens = resultado.ordens; // Armazena os dados globalmente

            // Aplica a ordenação salva, se houver
            if (sortConfig.column !== null) {
                const header = document.querySelector(`.sortable[data-column="${sortConfig.column}"]`);
                if (header) {
                    ordenarErenderizar(sortConfig.column, header.dataset.sortType, sortConfig.direction);
                }
            } else {
                renderizarTabela(listaDeOrdens); // Renderiza a tabela sem ordenação específica
            }

        } catch (error) {
            console.error('Falha ao buscar ordens de produção:', error);
            const tabela = document.getElementById("tabela-ordem-producoes");
            if (tabela) {
                tabela.innerHTML = `<tr><td colspan="11" class="text-center">Nenhuma ordem de produção encontrada.</td></tr>`;
            }

            // Mapeamento de cores para status
            const statusColors = {
                'Pendente': 'bg-warning text-dark',
                'Em Andamento': 'bg-primary',
                'Pausada': 'bg-secondary',
                'Concluída': 'bg-success',
                'Cancelada': 'bg-danger'
            };

            Swal.fire({
                icon: 'error',
                title: 'Erro ao Carregar',
                text: error.message,
            });
        } finally {
            hideLoading();
        }
    }

    function renderizarTabela(ordens) {
        console.log('Renderizando tabela...');
        const ordensEmAndamento = ordens.filter(ordem => ordem.status === 'Em Andamento');
        console.log('Ordens em Andamento:', ordensEmAndamento);
        console.log('')
        const ordensConcluidas = ordens.filter(ordem => ordem.status === 'Concluída');
        console.log('Ordens concluidas:', ordensConcluidas);
        console.log('')


        tabela = document.getElementById("tabela-ordem-producoes");
        tabela.innerHTML = "";

        if (ordens.length === 0) {
            tabela.innerHTML = `<tr><td colspan="14" class="text-center">Nenhuma ordem de produção encontrada.</td></tr>`;
            return;
        }

        const statusColors = {
            'Pendente': 'bg-warning text-dark',
            'Em Andamento': 'bg-primary',
            'Pausada': 'bg-secondary',
            'Concluída': 'bg-success',
            'Cancelada': 'bg-danger'
        };

        ordens.forEach(ordem => {
            const tr = document.createElement("tr");

            const valores = extrairValoresParaLinha(ordem);

            tr.innerHTML = `
                <td data-label="Código"><strong>${valores.codigo}</strong></td>
                <td data-label="Prioridade">${valores.prioridadeBadge}</td>
                <td data-label="Criado por">${valores.criadoPor}</td>
                <td data-label="Status">${valores.statusBadge}</td>
                <td data-label="Produto">${valores.nomeProduto}</td>
                <td data-label="Qtd." class="text-center">${valores.quantidade}</td>
                <td data-label="Refugo" class="text-center">${valores.quantidade_refugo}</td>
                <td data-label="Qualidade" class="text-center">${valores.taxaQualidade}</td>
                <td data-label="Performance" class="text-center">${valores.taxaPerformance}</td>
                <td data-label="OEE" class="text-center fw-bold">${valores.oee}</td>
                <td data-label="Etapa Atual" class="text-truncate" style="max-width: 150px;" title="${valores.nomeEtapa}">${valores.nomeEtapa}</td>
                <td data-label="Funcionário" class="text-truncate" style="max-width: 150px;" title="${valores.funcionarioAtivo}">${valores.funcionarioAtivo}</td>
                <td data-label="Data Entrega" class="text-nowrap">${valores.dataEntrega}</td>
                <td data-label="Ações">
                    <button class="btn btn-sm btn-info mb-1" onclick="gerenciarOrdemProducao('${ordem._id}')" title="Gerenciar OP">
                        <i class="bi bi-gear"></i>
                    </button>
                    <button class="btn btn-sm btn-primary mb-1" onclick="editarOrdemProducao('${valores.nomeProduto}', '${ordem._id}')" title="Editar">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-danger mb-1" onclick="cancelarOrdemProducao('${ordem._id}')" title="Cancelar">
                        <i class="bi bi-x-circle"></i>
                    </button>
                </td>
            `;
            tabela.appendChild(tr);
        });

        // Após renderizar a tabela, aplica os filtros salvos
        const filtroTextoSalvo = localStorage.getItem('opFiltroTexto');
        if (filtroTextoSalvo || localStorage.getItem('opFiltroStatus')) {
            aplicarFiltros();
        }
    }

    /**
     * Extrai o valor de uma célula específica para uma ordem, usado na ordenação.
     * @param {object} ordem - O objeto da ordem de produção.
     * @param {number} columnIndex - O índice da coluna.
     * @returns {string} O valor da célula como texto.
     */
    function extrairValorDaOrdem(ordem, columnIndex) {
        const valores = extrairValoresParaLinha(ordem);
        const mapaColunas = [
            valores.codigo,
            valores.prioridadeTexto,
            valores.criadoPor,
            valores.status,
            valores.nomeProduto,
            valores.quantidade,
            valores.quantidade_refugo,
            valores.taxaQualidade.replace('%', ''),
            valores.taxaPerformance.replace('%', ''),
            valores.oee.replace('%', ''),
            valores.nomeEtapa,
            valores.funcionarioAtivo,
            valores.dataEntrega // A ordenação de data já funciona
        ];
        return mapaColunas[columnIndex] || '';
    }

    /**
     * Centraliza a lógica de extração e formatação de valores de uma ordem.
     * @param {object} ordem - O objeto da ordem de produção.
     * @returns {object} Um objeto com todos os valores formatados para a linha da tabela.
     */
    function extrairValoresParaLinha(ordem) {
        // --- Lógica para encontrar a etapa atual ---
        let nomeEtapa;
        if (ordem.status === 'Concluída') {
            nomeEtapa = 'Ordem Concluída';
        } else if (ordem.status === 'Pausada' || ordem.status === 'Pendente') {
            nomeEtapa = 'Aguardando Início';
        } else if (ordem.status === 'Cancelada') {
            nomeEtapa = 'Ordem Cancelada';
        } else {
            const etapaAtiva = ordem.historicoEtapas.find(e => e.status === 'Em Andamento');
            if (etapaAtiva && etapaAtiva.etapa && etapaAtiva.etapa.nome) {
                nomeEtapa = etapaAtiva.etapa.nome;
            } else {
                nomeEtapa = 'Em Processamento';
            }
        }
        
        const funcionarioAtivo = ordem.funcionarioAtivo && ordem.funcionarioAtivo.length > 0 && ordem.funcionarioAtivo[0].funcionario
            ? ordem.funcionarioAtivo[0].funcionario.nome 
            : 'Nenhum';

        // --- Indicadores visuais ---
        const prioridade = ordem.prioridade || { texto: 'Normal', cor: '#6c757d' };
        const statusColors = {
            'Pendente': 'bg-warning text-dark', 'Em Andamento': 'bg-primary', 'Pausada': 'bg-secondary',
            'Concluída': 'bg-success', 'Cancelada': 'bg-danger'
        };
        const statusBadge = `<span class="badge ${statusColors[ordem.status] || 'bg-light text-dark'}">${ordem.status}</span>`;
        const prioridadeBadge = `<span class="badge" style="background-color: ${prioridade.cor}; color: #fff;">${prioridade.texto}</span>`;

        // --- Formatação dos dados ---
        const dataEntrega = formatarData(ordem.dataEntrega);
        const nomeProduto = ordem.produto ? ordem.produto.nome : 'N/A';
        const taxaQualidade = ordem.taxa_qualidade !== undefined ? `${ordem.taxa_qualidade}%` : 'N/A';
        const taxaPerformance = ordem.taxa_performance !== undefined ? `${ordem.taxa_performance}%` : 'N/A';
        const oee = ordem.oee !== undefined ? `${ordem.oee}%` : 'N/A';

        return {
            codigo: ordem._id.slice(-6).toUpperCase(),
            prioridadeBadge: prioridadeBadge,
            prioridadeTexto: prioridade.texto,
            criadoPor: ordem.criadoPor ? ordem.criadoPor.nome : 'N/A',
            statusBadge: statusBadge,
            status: ordem.status,
            nomeProduto: nomeProduto,
            quantidade: ordem.quantidade,
            quantidade_refugo: ordem.quantidade_refugo,
            taxaQualidade: taxaQualidade,
            taxaPerformance: taxaPerformance,
            oee: oee,
            nomeEtapa: nomeEtapa,
            funcionarioAtivo: funcionarioAtivo,
            dataEntrega: dataEntrega
        };
    }

    // Garante que a função de formatação esteja disponível globalmente se necessário
    window.formatarData = window.formatarData || function(data) {
        if (!data) return 'N/A';
        return new Date(data).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
    };

    /**
     * Abre um modal para permitir a alteração manual da prioridade de uma OP.
     * @param {string} id - O ID da Ordem de Produção.
     * @param {string} prioridadeAtual - O texto da prioridade atual ('Urgente', 'Alta', 'Normal').
     */
    window.alterarPrioridade = async function(id, prioridadeAtual) {
        const prioridades = {
            'Urgente': 'Urgente',
            'Alta': 'Alta',
            'Normal': 'Normal'
        };

        const { value: novaPrioridadeTexto } = await Swal.fire({
            title: 'Alterar Prioridade',
            input: 'select',
            inputOptions: prioridades,
            inputValue: prioridadeAtual,
            showCancelButton: true,
            confirmButtonText: 'Salvar',
            cancelButtonText: 'Cancelar',
            inputValidator: (value) => !value && 'Você precisa selecionar uma prioridade!'
        });

        if (novaPrioridadeTexto && novaPrioridadeTexto !== prioridadeAtual) {
            showLoading();
            try {
                const response = await fetch(`/api/ordens-producao/${id}/prioridade`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    },
                    body: JSON.stringify({ prioridade: novaPrioridadeTexto })
                });

                const result = await response.json();
                if (!response.ok) throw new Error(result.msg || 'Falha ao atualizar a prioridade.');
                
                await carregarTabela(); // Recarrega a tabela para mostrar a nova prioridade
                Swal.fire('Sucesso!', 'Prioridade atualizada com sucesso.', 'success');
            } catch (error) { Swal.fire('Erro!', error.message, 'error'); } finally { hideLoading(); }
        }
    }

    function editarOrdemProducao(nomeProduto, id) {
        Swal.fire({
            title: 'Editar ordem de produção',
            text: `Você deseja editar a ordem de produção do produto: ${nomeProduto}?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sim, editar',
            cancelButtonText: 'Cancelar'
        }).then(result => {
            if (result.isConfirmed) {
                window.location.href = `/ordens-producao/${id}/editar`;
            }
        });
    }

    async function cancelarOrdemProducao(id) {
        // Este código já está bom, apenas um ajuste para usar a referência de motivos que você criou
        const { value: motivoId } = await Swal.fire({
            title: 'Cancelar Ordem de Produção',
            input: 'select', // Troca para select para usar os motivos cadastrados
            inputPlaceholder: 'Selecione o motivo',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sim, cancelar!',
            cancelButtonText: 'Voltar',
            // Lógica para buscar os motivos da API e popular o select
            inputOptions: (async () => {
                try {
                    const response = await fetch('/api/motivos/tipo/CANCELAMENTO', {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                        },
                    });
                    const result = await response.json();
                    if (!result.status) throw new Error('Não foi possível carregar os motivos.');
                    
                    const options = {};
                    result.data.forEach(motivo => {
                        options[motivo._id] = motivo.descricao;
                    });
                    return options;
                } catch (e) {
                    Swal.showValidationMessage(`Erro ao buscar motivos: ${e.message}`);
                    return {};
                }
            })(),
            inputValidator: (value) => {
                if (!value) {
                    return 'Você precisa selecionar um motivo!';
                }
            }
        });

        if (motivoId) {
            try {
                showLoading();
                const response = await fetch(`api/ordens-producao/${id}/cancelar`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    },
                    body: JSON.stringify({ motivoCancelamento: motivoId }) // Envia o ID do motivo
                });

                const result = await response.json();

                if (response.ok) {
                    await Swal.fire('Cancelada!', 'A ordem de produção foi cancelada.', 'success');
                    carregarTabela();
                } else {
                    throw new Error(result.msg || "Falha ao cancelar a ordem de produção");
                }
            } catch (error) {
                console.error("Erro ao cancelar ordem de produção:", error);
                Swal.fire('Erro!', error.message, 'error');
            } finally {
                hideLoading();
            }
        }
    }

    function gerenciarOrdemProducao(id) {
        window.location.href = `/ordens-producao/${id}/gestao`;
    }
