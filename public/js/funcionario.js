
   async function carregarTabela() {
        try {
            showLoading();
            const response = await fetch('/funcionario/readAll', {
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
                console.log(func);
                const tr = document.createElement("tr");
                const nomeCompleto = func.nome || '';
                const email = func.email || '';
                let emailHtml = '';
                if(email.length > 34) {
                    emailHtml = `
                        <span title="${email.replace(/"/g, '&quot;')}"></span>
                        <button class="btn  btn-sm btn-secondary" onclick="mostrarModal('Email', '${email.replace(/'/g, "\\'").replace(/"/g, '&quot;')}')">
                            <i class="bi bi-eye"></i>
                        </button>
                    `;
                } else {
                    emailHtml = `<span>${email}</span>`;
                }
                tr.innerHTML = `
                    <td data-label="Credencial">${func.credencial}</td>
                    <td data-label="Nome">${nomeCompleto}</td>
                    <td data-label="Turno">${func.turno}</td>
                    <td data-label="CPF">${func.CPF}</td>
                    <td data-label="Email">${emailHtml}</td>
                    <td data-label="Telefone">${func.telefone}</td>
                    <td data-label="Data Nasc.">${formatarData(func.dataNascimento)}</td>
                    <td data-label="Permissões">
                        <button class="btn btn-sm btn-warning" onclick='mostrarPermissoesModal(${JSON.stringify(func.permissoes)})'>
                            <i class="bi bi-shield-lock"></i>
                        </button>
                    </td>
                    <td data-label="Ações">
                        <button class="btn btn-sm btn-primary mb-1" onclick="editarFuncionario('${func._id}', '${func.credencial}')">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-danger mb-1" onclick="deletarFuncionario('${func._id}')">
                            <i class="bi bi-trash"></i>
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

    //Função para adicionar funcionário
    async function adicionarFuncionario(event) {
      event.preventDefault();

      const permissoes = Array.from(document.querySelectorAll('input[name="permissoes"]:checked')).map(checkbox => checkbox.value);
      const Funcionario = {
        nome: document.getElementById('nome').value,
        senha: document.getElementById('senha').value,
        email: document.getElementById('email').value,
        CPF: document.getElementById('CPF').value,
        telefone: document.getElementById('telefone').value,
        turno: document.getElementById('turno').value,
        dataNascimento: document.getElementById('dataNascimento').value,
        permissoes: permissoes,
        role: document.getElementById('role').value
      };
      try {
        const resposta = await fetch(`/funcionario`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          },
          body: JSON.stringify(Funcionario)
        });

        if (!resposta.ok) {
          const erro = await resposta.json();
          exibirMensagem(erro.msg || 'Erro ao adicionar funcionário.', 'erro');
          return;
        }

        exibirMensagem('Funcionário adicionado com sucesso!', 'sucesso');
        setTimeout(() => {
          window.location.href = '/funcionario';
        }, 2000);
      } catch (error) {
        exibirMensagem('Erro interno ao tentar adicionar funcionário.', 'erro');
      }
    }
    async function atualizarFuncionario(event) {
        event.preventDefault();
        const permissoes = Array.from(document.querySelectorAll('input[name="permissoes"]:checked'))
                                .map(checkbox => checkbox.value);
        const dadosAtualizados = {
            nome: document.getElementById('nome').value,
            email: document.getElementById('email').value,
            CPF: document.getElementById('CPF').value,
            telefone: document.getElementById('telefone').value,
            turno: document.getElementById('turno').value,
            dataNascimento: document.getElementById('dataNascimento').value,
            permissoes: permissoes,
            role: document.getElementById('role').value
        };
        try {
            const resposta = await fetch(`/funcionario/${id}`, {
                method: 'PUT',
                headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify(dadosAtualizados)
            });
            if (!resposta.ok) {
                const erro = await resposta.json();
                exibirMensagem(erro.msg || 'Erro ao atualizar funcionário.', 'erro');
                return;
            }
            exibirMensagem('Funcionário atualizado com sucesso!', 'sucesso');
            setTimeout(() => {
                window.location.href = '/funcionario';
            }, 2000);
        } catch (error) {
            console.error('Erro ao atualizar funcionário:', error);
            exibirMensagem('Erro interno ao tentar atualizar.', 'erro');
        }
    }
    
    if(document.getElementById("tabela-funcionarios")) {
        document.addEventListener("DOMContentLoaded", carregarTabela, configurarFiltroDeTabela('filtro', 'tabela-funcionarios', 'Credencial'));
    }else if(document.getElementById("form-adicionar")) {
        document.getElementById("form-adicionar").addEventListener("submit", adicionarFuncionario);
    }else if(document.getElementById("form-editar")) {
        document.getElementById("form-editar").addEventListener("submit", atualizarFuncionario);
    }