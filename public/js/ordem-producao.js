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

            const ordens = resultado.ordens;

            if (ordens.length === 0) {
                tabela.innerHTML = `<tr><td colspan="12">Nenhuma ordem de produção encontrada.</td></tr>`;
                hideLoading();
                return;
            }

            ordens.forEach(ordem => {
                const tr = document.createElement("tr");
                const nomeProduto = ordem.produto ? ordem.produto.nome : 'Produto não encontrado';
                console.log('Ordem de Produção:', ordem);
                const historicoEtapas = ordem.historicoEtapas && ordem.historicoEtapas.length > 0
                    ? `${ordem.historicoEtapas[0].etapa.nome} (${ordem.historicoEtapas[0].status})`
                    : 'Nenhuma';

                const funcionarioAtivo = ordem.funcionarioAtivo && ordem.funcionarioAtivo.length > 0
                    ? `<span class="badge bg-secondary">${ordem.funcionarioAtivo[0].funcionario.nome}</span>`
                    : 'Nenhum';


                const horarioInicio = formatarHorario(ordem.timestampProducao?.inicio);
                const horarioFim = formatarHorario(ordem.timestampProducao?.fim);
                const dataEntrega = formatarData(ordem.dataEntrega);
                const criadoPor = ordem.criadoPor ? `<span class="badge bg-secondary">${ordem.criadoPor.nome}</span>` : 'N/A';

                tr.innerHTML = `
                
                    <td data-label="Código">${ordem._id.slice(-6).toUpperCase()}</td>                    
                    <td data-label="Status">${ordem.status}</td>
                    <td data-label="Produto">${nomeProduto}</td>
                    <td data-label="Criado por">${criadoPor}</td>
                    <td data-label="Etapa Atual">${historicoEtapas}</td>
                    <td data-label="Funcionário Ativo">${funcionarioAtivo}</td>
                    <td data-label="Data de Entrega">${dataEntrega}</td>
                    <td data-label="Horário de Início">${horarioInicio}</td>
                    <td data-label="Horário de Fim">${horarioFim}</td>
                    <td data-label="Ações">
                        <button class="btn btn-sm btn-info mb-1" onclick="gerenciarOrdemProducao('${ordem._id}')" title="Gerenciar OP">
                            <i class="bi bi-gear"></i>
                        </button>
                        <button class="btn btn-sm btn-primary mb-1" onclick="editarOrdemProducao('${nomeProduto}','${ordem._id}')" title="Editar">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-danger mb-1" onclick="cancelarOrdemProducao('${ordem._id}')" title="Cancelar">
                            <i class="bi bi-x-circle"></i>
                        </button>
                    </td>
                `;
                tabela.appendChild(tr);
            });

        } catch (error) {
            console.error('Falha ao buscar ordens de produção:', error);
            Swal.fire({
                icon: 'error',
                title: 'Erro ao Carregar',
                text: error.message,
            });
            const tabela = document.getElementById("tabela-ordem-producoes");
            if(tabela) tabela.innerHTML = `<tr><td colspan="10">Falha ao carregar os dados.</td></tr>`;
        } finally {
            hideLoading();
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
        const { value: motivo } = await Swal.fire({
            title: 'Cancelar Ordem de Produção',
            input: 'text',
            inputLabel: 'Motivo do cancelamento',
            inputPlaceholder: 'Digite o motivo aqui...',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sim, cancelar!',
            cancelButtonText: 'Voltar',
            inputValidator: (value) => {
                if (!value) {
                    return 'Você precisa informar um motivo!'
                }
            }
        });

        if (motivo) {
            try {
                showLoading();
                const response = await fetch(`api/ordens-producao/${id}/cancelar`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    },
                    body: JSON.stringify({ motivo: motivo })
                });
        
                const result = await response.json();

                if (response.ok) {
                    await Swal.fire(
                        'Cancelada!',
                        'A ordem de produção foi cancelada com sucesso.',
                        'success'
                    );
                    carregarTabela();
                } else {
                    throw new Error(result.msg || "Falha ao cancelar a ordem de produção");
                }
            } catch (error) {
                console.error("Erro ao cancelar ordem de produção:", error);
                Swal.fire({
                    icon: 'error',
                    title: 'Erro ao Cancelar',
                    text: error.message,
                    confirmButtonText: 'Ok'
                });
            } finally {
                hideLoading();
            }
        }
    }
    function gerenciarOrdemProducao(id) {
        window.location.href = `/ordens-producao/${id}/gestao`;
    }
    document.addEventListener("DOMContentLoaded", function() {
        carregarTabela();
        configurarFiltroDeTabela('filtro', 'tabela-ordem-producoes', 'Produto');
    });
