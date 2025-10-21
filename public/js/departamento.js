// public/js/departamento.js

document.addEventListener("DOMContentLoaded", () => {
    // Garante que o código só rode na página de listagem de departamentos
    if (document.getElementById("tabela-departamentos")) {
        carregarTabelaDepartamentos();

        // Configura o filtro da tabela
        const filtro = document.getElementById('filtro-departamento');
        if (filtro) {
            filtro.addEventListener('keyup', () => {
                filtrarTabela(filtro.value, 'tabela-departamentos');
            });
        }
    }

    // Prepara o modal para adicionar
    const btnAdicionar = document.getElementById('btn-adicionar');
    if (btnAdicionar) {
        btnAdicionar.addEventListener('click', prepararModalParaAdicionar);
    }

    // Adiciona o listener para o formulário do modal
    const form = document.getElementById('departamentoForm');
    if (form) {
        form.addEventListener('submit', salvarDepartamento);
    }
});

/**
 * Função para filtrar a tabela pelo nome do departamento.
 * @param {string} valorFiltro - O texto a ser procurado.
 * @param {string} idTabela - O ID do tbody da tabela.
 */
function filtrarTabela(valorFiltro, idTabela) {
    const tabela = document.getElementById(idTabela);
    const linhas = tabela.getElementsByTagName('tr');
    const filtro = valorFiltro.toUpperCase();

    for (let i = 0; i < linhas.length; i++) {
        const nomeTd = linhas[i].getElementsByTagName('td')[0]; // A primeira coluna é o Nome
        if (nomeTd) {
            const textoNome = nomeTd.textContent || nomeTd.innerText;
            if (textoNome.toUpperCase().indexOf(filtro) > -1) {
                linhas[i].style.display = '';
            } else {
                linhas[i].style.display = 'none';
            }
        }
    }
}


/**
 * Carrega os dados dos departamentos da API e preenche a tabela.
 */
async function carregarTabelaDepartamentos() {
    const tabela = document.getElementById("tabela-departamentos");
    try {
        const response = await fetch('/api/departamentos', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
        });

        if (!response.ok) {
            if (response.status === 401) {
                window.location.href = '/';
                return;
            }
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        const resultado = await response.json();
        const departamentos = resultado.departamentos;

        if (!Array.isArray(departamentos)) {
            throw new Error("Resposta da API não é uma lista de departamentos.");
        }

        tabela.innerHTML = ""; // Limpa a tabela antes de preencher

        if (departamentos.length === 0) {
            tabela.innerHTML = `<tr><td colspan="4" class="text-center">Nenhum departamento encontrado.</td></tr>`;
            return;
        }

        departamentos.forEach(dep => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td data-label="Nome">${dep.nome}</td>
                <td data-label="Descrição">${dep.descricao || 'N/A'}</td>
                <td data-label="Qtd. Funcionários">${dep.funcionariosCount}</td>
                <td data-label="Qtd. Etapas">${dep.etapasCount}</td>
                <td data-label="Ações">
                    <button class="btn btn-sm btn-primary mb-1" onclick="editarDepartamento('${dep._id}')">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-danger mb-1" onclick="deletarDepartamento('${dep._id}')">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            `;
            tabela.appendChild(tr);
        });

    } catch (error) {
        console.error('Falha ao buscar departamentos:', error);
        tabela.innerHTML = `<tr><td colspan="4" class="text-center">Erro ao carregar departamentos. Tente novamente.</td></tr>`;
        Swal.fire({
            icon: 'error',
            title: 'Erro ao Carregar',
            text: 'Não foi possível carregar a lista de departamentos.',
            confirmButtonText: 'Ok'
        });
    } finally {
        hideLoading();
    }
}

/**
 * Prepara o modal para adicionar um novo departamento.
 */
function prepararModalParaAdicionar() {
    document.getElementById('departamentoForm').reset();
    document.getElementById('departamentoId').value = '';
    document.getElementById('departamentoModalLabel').textContent = 'Adicionar Novo Departamento';
}

/**
 * Busca os dados de um departamento e preenche o modal para edição.
 * @param {string} id - O ID do departamento a ser editado.
 */
async function editarDepartamento(id) {
    showLoading();
    try {
        const response = await fetch(`/api/departamentos/${id}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        });

        if (!response.ok) {
            throw new Error('Falha ao buscar dados do departamento.');
        }

        const departamento = await response.json();

        document.getElementById('departamentoId').value = departamento._id;
        document.getElementById('nome').value = departamento.nome;
        document.getElementById('descricao').value = departamento.descricao || '';
        document.getElementById('departamentoModalLabel').textContent = 'Editar Departamento';

        const modal = new bootstrap.Modal(document.getElementById('departamentoModal'));
        modal.show();

    } catch (error) {
        console.error("Erro ao preparar edição:", error);
        Swal.fire('Erro', 'Não foi possível carregar os dados do departamento para edição.', 'error');
    } finally {
        hideLoading();
    }
}


/**
 * Salva um novo departamento ou atualiza um existente.
 * @param {Event} event - O evento de submit do formulário.
 */
async function salvarDepartamento(event) {
    event.preventDefault();
    showLoading();

    const id = document.getElementById('departamentoId').value;
    const nome = document.getElementById('nome').value;
    const descricao = document.getElementById('descricao').value;

    const method = id ? 'PUT' : 'POST';
    const url = id ? `/api/departamentos/${id}` : '/api/departamentos';

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify({ nome, descricao })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.msg || 'Falha ao salvar o departamento.');
        }

        Swal.fire({
            icon: 'success',
            title: 'Sucesso!',
            text: `Departamento ${id ? 'atualizado' : 'adicionado'} com sucesso.`,
            timer: 1500,
            showConfirmButton: false
        });
        hideLoading(); // Fecha o loading APÓS o Swal de sucesso ser exibido

        const modal = bootstrap.Modal.getInstance(document.getElementById('departamentoModal'));
        modal.hide();

        carregarTabelaDepartamentos(); // Recarrega a tabela

    } catch (error) {
        console.error("Erro ao salvar departamento:", error);
        hideLoading(); // Adicionar aqui para fechar o loading antes do alerta de erro
        Swal.fire('Erro', error.message, 'error');
    }
}


/**
 * Deleta um departamento após confirmação.
 * @param {string} id - O ID do departamento a ser deletado.
 */
async function deletarDepartamento(id) {
    const { isConfirmed } = await Swal.fire({
        title: 'Tem certeza?',
        text: "Você não poderá reverter esta ação!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sim, deletar!',
        cancelButtonText: 'Cancelar'
    });

    if (isConfirmed) {
        showLoading();
        try {
            const response = await fetch(`/api/departamentos/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            if (response.ok) {
                Swal.fire(
                    'Deletado!',
                    'O departamento foi deletado com sucesso.',
                    'success'
                );
                carregarTabelaDepartamentos(); // Recarrega a tabela
            } else {
                hideLoading(); // Fecha o loading antes de mostrar o erro
                throw new Error("Falha ao deletar o departamento. Verifique se não há funcionários vinculados.");
            }
        } catch (error) {
            console.error("Erro ao deletar departamento:", error);
            // O hideLoading() já foi chamado no else, ou não é necessário aqui pois o Swal de erro o substitui.
            Swal.fire('Erro', error.message, 'error');
        }
    }
}