   // Substitua a sua função antiga por esta no seu arquivo .js
    async function carregarTabela() {
        try {
            showLoading();

            const response = await fetch('/ordem-producao/readALL', {
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
            const tabela = document.getElementById("tabela-ordem-producaos");
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
                    ? ordem.funcionarioAtivo[0].funcionario.nome
                    : 'Nenhum';

                // 4. Horários de Início e Fim
                const formatarData = (data) => data ? new Date(data).toLocaleString('pt-BR') : 'N/A';
                const horarioInicio = formatarData(ordem.timestampProducao?.inicio);
                const horarioFim = formatarData(ordem.timestampProducao?.fim);


                // --- Montagem do HTML da linha da tabela ---
                tr.innerHTML = `
                    <td data-label="Status">${ordem.status}</td>
                    <td data-label="Produto">${nomeProduto}</td>
                    <td data-label="Etapa Atual">${etapaAtual}</td>
                    <td data-label="Funcionário Ativo">${funcionarioAtivo}</td>
                    <td data-label="Horário de Início">${horarioInicio}</td>
                    <td data-label="Horário de Fim">${horarioFim}</td>
                    <td data-label="Ações">
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
            const tabela = document.getElementById("tabela-ordem-producaos");
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

    async function deletarOrdemProducAO(id) {
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

    // Carregar a tabela ao carregar a página
    document.addEventListener("DOMContentLoaded", function() {
        carregarTabela();
    });

    // Filtro de busca por nome
    document.getElementById("filtro").addEventListener("input", function() {
        const filtro = this.value.toLowerCase();
        const linhas = document.querySelectorAll("#tabela-ordem-producaos tr");
        linhas.forEach(linha => {
            const nome = linha.cells[0]?.innerText.toLowerCase();
            if (nome && nome.includes(filtro)) {
                linha.style.display = "";
            } else {
                linha.style.display = "none";
            }
        });
    });
