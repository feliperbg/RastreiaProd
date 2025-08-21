   // Substitua a sua função antiga por esta no seu arquivo .js
    async function carregarTabela() {
        try {
            showLoading();

            const response = await fetch('/ordem-producao/readAll', {
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
            console.log(resultado);
            const tabela = document.getElementById("tabela-ordem-producoes");
            tabela.innerHTML = ""; // Limpa a tabela

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

                // --- Lógica para extrair e formatar os dados do schema ---

                // 1. Produto (assumindo que foi populado no backend)
                const nomeProduto = ordem.produto ? ordem.produto.nome : 'Produto não encontrado';

                // 2. Etapa Atual (pegando a primeira da lista, se houver)
                const etapaAtual = ordem.etapaAtual && ordem.etapaAtual.length > 0
                    ? `${ordem.etapaAtual[0].etapa.nome} (${ordem.etapaAtual[0].status})`
                    : 'Nenhuma';

                // 3. Funcionário Ativo (pegando o primeiro da lista, se houver)
                const funcionarioAtivo = ordem.funcionarioAtivo && ordem.funcionarioAtivo.length > 0
                    ? buscarNomePorId(ordem.funcionarioAtivo[0]._id, "funcionario", 'Funcionários')
                    : 'Nenhum';

                // Arquivo: public/js/ordem-producao.js

                // 4. Horários de Início e Fim
                const formatarHorario = (data) => {
                    if (!data) return 'N/A';
                    // Cria um objeto de data considerando o fuso horário local para evitar o "day-off"
                    const dateObj = new Date(data);
                    // Adiciona o offset do fuso horário para corrigir a data para UTC antes de formatar
                    const userTimezoneOffset = dateObj.getTimezoneOffset() * 60000;
                    const correctedDate = new Date(dateObj.getTime() + userTimezoneOffset);
                    
                    return correctedDate.toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                    });
                };
                const horarioInicio = formatarHorario(ordem.timestampProducao?.inicio);
                const horarioFim = formatarHorario(ordem.timestampProducao?.fim);


                // --- Montagem do HTML da linha da tabela ---
                tr.innerHTML = `
                    <td data-label="Código">${ordem._id.slice(-6).toUpperCase()}</td>                    
                    <td data-label="Status">${ordem.status}</td>
                    <td data-label="Produto">${nomeProduto}</td>
                    <td data-label="Etapa Atual">${etapaAtual}</td>
                    <td data-label="Funcionário Ativo">${funcionarioAtivo}</td>
                    <td data-label="Horário de Início">${horarioInicio}</td>
                    <td data-label="Horário de Fim">${horarioFim}</td>
                    <td data-label="Ações">
                        <button class="btn btn-sm btn-info mb-1" onclick="gerenciarOrdemProducao('${ordem._id}')" title="Gerenciar OP">
                            <i class="bi bi-gear"></i>
                        </button>
                        <button class="btn btn-sm btn-primary mb-1" onclick="editarOrdemProducao('${nomeProduto}','${ordem._id}')" title="Editar">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-danger mb-1" onclick="deletarOrdemProducao('${ordem._id}')" title="Deletar">
                            <i class="bi bi-trash"></i>
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
            // Garante que a tabela mostre o erro também
            const tabela = document.getElementById("tabela-ordem-producoes");
            if(tabela) tabela.innerHTML = `<tr><td colspan="7">Falha ao carregar os dados.</td></tr>`;

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
                window.location.href = `/ordem-producao/editar-ordem-producao/${id}`;
            }
        });
        }

    async function deletarOrdemProducao(id) {
        const { isConfirmed } = await Swal.fire({
            title: 'Tem certeza?',
            text: "Você não poderá reverter isso!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sim, deletar!',
            cancelButtonText: 'Cancelar'
        });
        
        if (isConfirmed) {
            try {
                showLoading();
                const response = await fetch(`/ordem-producao/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    }
                });
        
                if (response.ok) {
                    await Swal.fire(
                        'Deletado!',
                        'A ordem-producao foi deletada com sucesso.',
                        'success'
                    );
                    carregarTabela(); // Recarrega a tabela após exclusão
                } else {
                    throw new Error("Falha ao excluir ordem-producao");
                }
            } catch (error) {
                console.error("Erro ao excluir ordem-producao:", error);
                Swal.fire({
                    icon: 'error',
                    title: 'Erro ao deletar',
                    text: 'Ocorreu um erro ao tentar deletar a ordem-producao. Por favor, tente novamente.',
                    confirmButtonText: 'Ok'
                });
            } finally {
                hideLoading();
            }
        }
    }
    function gerenciarOrdemProducao(id) {
        window.location.href = `/ordem-producao/gestao-op/${id}`;
    }
    // Carregar a tabela ao carregar a página
    document.addEventListener("DOMContentLoaded", function() {
        carregarTabela();
        configurarFiltroDeTabela('filtro', 'tabela-ordem-producoes', 'Produto');
    });

