    async function carregarTabela() {
        try {
            showLoading();

            const response = await fetch('/funcionario/readALL', {
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
            const tabela = document.getElementById("tabela-funcionarios");

            const funcionarios = Array.isArray(resultado) ? resultado : resultado.funcionarios;

            if (!Array.isArray(funcionarios)) {
                throw new Error("Resposta da API não é uma lista de funcionários.");
            }
            if (funcionarios.length === 0) {
                tabela.innerHTML = `<tr><td colspan="12">Nenhum funcionário encontrado.</td></tr>`;
                return;
            }
            tabela.innerHTML = ""; // Limpa tabela após carregamento

            funcionarios.forEach(func => {
                const tr = document.createElement("tr");
                const nomeCompleto = func.nome || '';
                const email = func.email || '';
                let emailHtml = '';
                let nomeHtml = '';
                if (nomeCompleto.length > 25) {
                    nomeHtml = `
                        <span title="${nomeCompleto.replace(/"/g, '&quot;')}"></span>
                        <button class="btn btn-sm btn-secondary" onclick="mostrarModal('Nome Completo', '${nomeCompleto.replace(/'/g, "\\'").replace(/"/g, '&quot;')}')">
                            <i class="bi bi-eye fs-4"></i>
                        </button>
                    `;
                } else {
                    nomeHtml = `<span>${nomeCompleto}</span>`;
                }
                if(func.email && func.email.length > 35) {
                    emailHtml = `
                        <span title="${email.replace(/"/g, '&quot;')}"></span>
                        <button class="btn btn-secondary" onclick="mostrarModal('Email', '${email.replace(/'/g, "\\'").replace(/"/g, '&quot;')}')">
                            <i class="bi bi-eye"></i> Ver Email
                        </button>
                    `;
                } else {
                    emailHtml = `<span>${email}</span>`;
                }

                tr.innerHTML = `
                    <td data-label="Credencial">${func.credencial}</td>
                    <td data-label="Nome">${nomeHtml}</td>
                    <td data-label="Turno">${func.turno}</td>
                    <td data-label="CPF">
                        <button class="btn btn-sm btn-secondary" onclick="mostrarModal('CPF', '${formatarCPF(func.CPF)}')">
                            <i class="bi bi-card-text"></i> Ver CPF
                        </button>
                    </td>
                    <td data-label="Email">${emailHtml}</td>
                    <td data-label="Telefone">${formatarTelefone(func.telefone)}</td>
                    <td data-label="Data Nasc.">${formatarData(func.dataNascimento)}</td>
                    <td data-label="Permissões">
                        <button class="btn btn-sm  btn-warning" onclick="mostrarModal('Permissões', '${func.permissoes}')">
                            <i class="bi bi-shield-lock"></i> Ver Permissões
                        </button>
                    </td>
                    <td data-label="Ações">
                        <button class="btn btn-sm btn-primary mb-1" onclick="editarFuncionario('${func._id}', '${func.credencial}')">
                            <i class="bi bi-pencil"></i> Editar
                        </button>
                        <button class="btn btn-sm btn-danger mb-1" onclick="deletarFuncionario('${func._id}')">
                            <i class="bi bi-trash"></i> Deletar
                        </button>
                    </td>
                `;
                tabela.appendChild(tr);
            });

        } catch (error) {
            console.error('Falha ao buscar funcionários:', error);
            if (error.message.includes('401')) {
                Swal.fire({
                    icon: 'error',
                    title: 'Sessão expirada',
                    text: 'Sua sessão expirou. Por favor, faça login novamente.',
                    confirmButtonText: 'Ir para login'
                }).then(() => {
                    window.location.href = '/';
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Erro ao carregar',
                    text: 'Ocorreu um erro ao carregar os funcionários. Por favor, tente novamente.',
                    confirmButtonText: 'Ok'
                });
            }
        } finally {
            hideLoading();
        }
    }

    function editarFuncionario(id, credencial) {
        Swal.fire({
            title: 'Editar Funcionário',
            text: `Você deseja editar o funcionário com a credencial: ${credencial}?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sim, editar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = `/funcionario/editar-funcionario/${id}`;
            }
        });
    }

    // Função para deletar funcionário
    async function deletarFuncionario(id) {
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
                const response = await fetch(`/funcionario/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    }
                });

                if (response.ok) {
                    await Swal.fire(
                        'Deletado!',
                        'O funcionário foi deletado com sucesso.',
                        'success'
                    );
                    carregarTabela(); // Recarrega a tabela após exclusão
                } else {
                    throw new Error("Falha ao excluir funcionário");
                }
            } catch (error) {
                console.error("Erro ao excluir funcionário:", error);
                Swal.fire({
                    icon: 'error',
                    title: 'Erro ao deletar',
                    text: 'Ocorreu um erro ao tentar deletar o funcionário.',
                    confirmButtonText: 'Ok'
                });
            } finally {
                hideLoading();
            }
        }
    }

    // Filtro de busca
    document.getElementById("filtro").addEventListener("input", function () {
        const termo = this.value.toLowerCase();
        const linhas = document.querySelectorAll("#tabela-funcionarios tr");

        linhas.forEach(tr => {
            const texto = tr.innerText.toLowerCase();
            tr.style.display = texto.includes(termo) ? "" : "none";
        });
    });

    // Carrega os dados quando a página é carregada
    document.addEventListener('DOMContentLoaded', carregarTabela);