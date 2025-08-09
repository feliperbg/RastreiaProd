    async function carregarTabela() {
        try {
            showLoading();
        
            const response = await fetch('/ordem-producao/getALL', {
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
            if(resultado.status !== true) {
                throw new Error("Erro ao carregar ordens de produção");
            }   
            const ordemProducoes = Array.isArray(resultado) ? resultado : resultado.ordensProducao || resultado['ordensProducao'];

            if (!Array.isArray(ordemProducoes)) {
                throw new Error("Resposta da API não é uma lista de ordem de produções.");
            }
            if (ordemProducoes.length === 0) {
                tabela.innerHTML = `<tr><td colspan="7">Nenhuma ordem de produção encontrada.</td></tr>`;
                return;
            }
            tabela.innerHTML = ""; // Limpa tabela após carregamento

            ordemProducoes.forEach(ordemProducao => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td data-label="Status">${ordemProducao.status ? "Em Andamento" : "Finalizada"}</td>
                    <td data-label="Sequências">
                        <button class="btn btn-outline-secondary btn-sm" title="Ver Sequências"
                            onclick='mostrarModalArray("Sequências", ${JSON.stringify(ordemProducao.sequencias)})'>
                            <i class="bi bi-diagram-3"></i>
                        </button>
                    </td>
                    <td data-label="Departamento Responsável">${ordemProducao.departamentoResponsavel}</td>
                    <td data-label="Procedimentos">
                        <button class="btn btn-outline-info btn-sm" title="Ver Procedimentos"
                            onclick='mostrarModalArray("Procedimentos", ${JSON.stringify(ordemProducao.procedimentos)})'>
                            <i class="bi bi-list-check"></i>
                        </button>
                    </td>
                    <td data-label="Componente Conclusão"><span class="componentes-loading">Carregando...</span></td>
                    <td data-label="Funcionários Responsáveis"><span class="funcionarios-loading">Carregando...</span></td>
                    <td data-label="Ações">
                        <button class="btn btn-sm btn-primary mb-1" onclick="editarordemProducao('${ordemProducao._id}')">
                            <i class="bi bi-pencil"></i> Editar
                        </button>
                        <button class="btn btn-sm btn-danger mb-1" onclick="deletarordemProducao('${ordemProducao._id}')">
                            <i class="bi bi-trash"></i> Deletar
                        </button>
                    </td>
                `;
                tabela.appendChild(tr);

                // Funcionários e componentes continuam assíncronos
                // Para componentes:
                formatarArrayAssincrono(ordemProducao.componenteConclusao, id => buscarNomePorId(id, 'componente', 'componente')).then(html => {
                    tr.querySelector('.componentes-loading').innerHTML = html;
                });

                // Para funcionários:
                formatarArrayAssincrono(ordemProducao.funcionariosResponsaveis, id => buscarNomePorId(id, 'funcionario', 'funcionario')).then(html => {
                    tr.querySelector('.funcionarios-loading').innerHTML = html;
                });
            });
        
        } catch (error) {
            console.error('Falha ao buscar ordemProducoes:', error);
            Swal.fire({
                icon: 'error',
                title: 'Erro ao carregar',
                text: 'Ocorreu um erro ao carregar as ordemProducoes. Por favor, tente novamente.',
                confirmButtonText: 'Ok'
            });
        } finally {
            hideLoading();
        }
    }

    function editarOrdemProducoes(id) {
        Swal.fire({
            title: 'Editar ordem de produção',
            text: `Você deseja editar a ordem de produção com ID: ${id}?`,
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

    async function deletarOrdemProducoes(id) {
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
