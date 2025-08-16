    async function carregarComponentes() {
        try {
            showLoading();
            
            const response = await fetch('/componente/readALL', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }
            
            const dados = await response.json();
            const tabela = document.getElementById("tabela-componentes");
            
            const componentes = Array.isArray(dados) ? dados : dados.componentes || [];
            if (!Array.isArray(componentes)) {
                throw new Error("Resposta da API não é uma lista de componentes.");
            }
            if (componentes.length === 0) {
                tabela.innerHTML = `<tr><td colspan="7">Nenhum componente encontrado.</td></tr>`;
                return;
            }
            tabela.innerHTML = "";
            console.log(componentes);
            componentes.forEach(comp => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td data-label="Nome">${comp.nome}</td>
                    <td data-label="Código">${comp.codigo}</td>
                    <td data-label="Descrição">
                        <button class="btn btn-sm btn-outline-primary" onclick="verDescricao('${escapeHtml(comp.descricao || '')}')">
                            <i class="bi bi-file-earmark-text"></i>
                        </button>
                    </td>
                    <td data-label="Data Entrada">${formatarData(comp.dataEntrada)}</td>
                    <td data-label="Validade">${formatarData(comp.dataValidade)}</td>
                    <td data-label="Quantidade">${comp.quantidade}</td>
                    <td data-label="Lote">${comp.Lote}</td>
                    <td data-label="Preço Unidade">R$ ${comp.precoUnidade.toFixed(2)}</td>
                    <td data-label="Ações">
                            <button class="btn btn-sm btn-primary mb-1" onclick="editarComponente('${comp._id}', '${comp.codigo}')">
                                <i class="bi bi-pencil"></i> Editar
                            </button>
                            <button class="btn btn-sm btn-danger mb-1" onclick="deletarComponente('${comp._id}')">
                                <i class="bi bi-trash"></i> Deletar
                            </button>
                    </td>
                `;
                tabela.appendChild(tr);
            });
        } catch (err) {
            console.error(err);
            Swal.fire('Erro!', 'Não foi possível carregar os componentes.', 'error');
        } finally {
            hideLoading()
        }
    }

    function editarComponente(id, codigo) {
        Swal.fire({
            title: 'Editar Componente',
            text: `Você deseja editar o componente com o código: ${codigo}?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sim, editar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = `/componente/editar-componente/${id}`;
            }
        });
    }
    async function deletarComponente(id) {
        const { isConfirmed } = await Swal.fire({
            title: 'Confirmar Exclusão',
            text: "Tem certeza que deseja deletar este componente?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sim, deletar',
            cancelButtonText: 'Cancelar'
        });

        if (isConfirmed) {
            try {
                Swal.fire({ title: 'Deletando...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
                const response = await fetch(`/componente/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    }
                });

                if (!response.ok) throw new Error("Erro ao deletar");

                Swal.fire('Deletado!', 'Componente removido com sucesso.', 'success');
                carregarComponentes();
            } catch (error) {
                console.error(error);
                Swal.fire('Erro!', 'Não foi possível deletar o componente.', 'error');
            } finally {
                hideLoading()
            }
        }
    }
    document.getElementById("filtro").addEventListener("input", function () {
        const termo = this.value.toLowerCase();
        document.querySelectorAll("#tabela-componentes tr").forEach(tr => {
            tr.style.display = tr.innerText.toLowerCase().includes(termo) ? "" : "none";
        });
    });
    document.addEventListener('DOMContentLoaded', carregarComponentes); 