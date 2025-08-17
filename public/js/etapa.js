    async function carregarTabela() {
        try {
            showLoading();
        
            const response = await fetch('/etapa/readALL', {
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
            const tabela = document.getElementById("tabela-etapas");
            
            const etapas = Array.isArray(resultado) ? resultado : resultado.etapas;
            
            if (!Array.isArray(etapas)) {
                throw new Error("Resposta da API não é uma lista de etapas.");
            }
            if (etapas.length === 0) {
                tabela.innerHTML = `<tr><td colspan="7">Nenhuma etapa encontrada.</td></tr>`;
                return;
            }
            tabela.innerHTML = ""; // Limpa tabela após carregamento

            etapas.forEach(etapa => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td data-label="Nome">${etapa.nome}</td>
                    <td data-label="Sequências">
                        <button class="btn btn-outline-secondary btn-sm" title="Ver Sequências"
                            onclick='mostrarModal("Sequências", ${JSON.stringify(etapa.sequencias)})'>
                            <i class="bi bi-diagram-3"></i>
                        </button>
                    </td>
                    <td data-label="Departamento Responsável">${etapa.departamentoResponsavel}</td>
                    <td data-label="Procedimentos">
                        <button class="btn btn-outline-info btn-sm" title="Ver Procedimentos"
                            onclick='mostrarModal("Procedimentos", ${JSON.stringify(etapa.procedimentos)})'>
                            <i class="bi bi-list-check"></i>
                        </button>
                    </td>
                    <td data-label="Componente Conclusão"><span class="componentes-loading">Carregando...</span></td>
                    <td data-label="Funcionários Responsáveis"><span class="funcionarios-loading">Carregando...</span></td>
                    <td data-label="Ações">
                        <button class="btn btn-sm btn-primary mb-1" onclick="editarEtapa('${etapa.nome}','${etapa._id}')">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-danger mb-1" onclick="deletarEtapa('${etapa._id}')">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                `;
                tabela.appendChild(tr);

                formatarArrayAssincrono(etapa.componenteConclusao, id => buscarNomePorId(id, 'componente', 'componente')).then(html => {
                    console.log(html);
                    tr.querySelector('.componentes-loading').innerHTML = html;
                });

                // Para funcionários:
                formatarArrayAssincrono(etapa.funcionariosResponsaveis, id => buscarNomePorId(id, 'funcionario', 'funcionario')).then(html => {
                    tr.querySelector('.funcionarios-loading').innerHTML = html;
                });
            });
        
        } catch (error) {
            console.error('Falha ao buscar etapas:', error);
            Swal.fire({
                icon: 'error',
                title: 'Erro ao carregar',
                text: 'Ocorreu um erro ao carregar as etapas. Por favor, tente novamente.',
                confirmButtonText: 'Ok'
            });
        } finally {
            hideLoading();
        }
    }
    
    function editarEtapa(nome, id) {
        Swal.fire({
            title: 'Editar Etapa',
            text: `Você deseja editar a etapa: ${nome}?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sim, editar',
            cancelButtonText: 'Cancelar'
        }).then(result => {
            if (result.isConfirmed) {
                window.location.href = `/etapa/editar-etapa/${id}`;
            }
        });
    }

    async function deletarEtapa(id) {
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
                const response = await fetch(`/etapa/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    }
                });
        
                if (response.ok) {
                    await Swal.fire(
                        'Deletado!',
                        'A etapa foi deletada com sucesso.',
                        'success'
                    );
                    carregarTabela(); // Recarrega a tabela após exclusão
                } else {
                    throw new Error("Falha ao excluir etapa");
                }
            } catch (error) {
                console.error("Erro ao excluir etapa:", error);
                Swal.fire({
                    icon: 'error',
                    title: 'Erro ao deletar',
                    text: 'Ocorreu um erro ao tentar deletar a etapa. Por favor, tente novamente.',
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
        const linhas = document.querySelectorAll("#tabela-etapas tr");
        linhas.forEach(linha => {
            const nome = linha.cells[0]?.innerText.toLowerCase();
            if (nome && nome.includes(filtro)) {
                linha.style.display = "";
            } else {
                linha.style.display = "none";
            }
        });
    });
