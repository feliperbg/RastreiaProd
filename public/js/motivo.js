// public/js/motivo.js

document.addEventListener("DOMContentLoaded", () => {
    // Garante que o código só rode na página de listagem de motivos
    if (document.getElementById("tabela-motivos")) {
        carregarTabelaMotivos();

        // Configura o filtro da tabela
        const filtro = document.getElementById('filtro-motivo');
        if (filtro) {
            filtro.addEventListener('keyup', () => {
                filtrarTabela(filtro.value, 'tabela-motivos');
            });
        }
    }

    // Prepara o modal para adicionar
    const btnAdicionar = document.getElementById('btn-adicionar');
    if (btnAdicionar) {
        btnAdicionar.addEventListener('click', prepararModalParaAdicionar);
    }

    // Adiciona o listener para o formulário do modal
    const form = document.getElementById('motivoForm');
    if (form) {
        form.addEventListener('submit', salvarMotivo);
    }
});

/**
 * Função para filtrar a tabela pela descrição do motivo.
 * @param {string} valorFiltro - O texto a ser procurado.
 * @param {string} idTabela - O ID do tbody da tabela.
 */
function filtrarTabela(valorFiltro, idTabela) {
    const tabela = document.getElementById(idTabela);
    const linhas = tabela.getElementsByTagName('tr');
    const filtro = valorFiltro.toUpperCase();

    for (let i = 0; i < linhas.length; i++) {
        const nomeTd = linhas[i].getElementsByTagName('td')[0]; // A primeira coluna é a Descrição
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
 * Carrega os dados dos motivos da API e preenche a tabela.
 */
async function carregarTabelaMotivos() {
    const tabela = document.getElementById("tabela-motivos");
    showLoading();
    try {
        const response = await fetch('/api/motivos', {
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

        const resposta = await response.json();
        const motivos = resposta.data;
        tabela.innerHTML = ""; // Limpa a tabela antes de preencher

        if (motivos.length === 0) {
            tabela.innerHTML = `<tr><td colspan="3" class="text-center">Nenhum motivo encontrado.</td></tr>`;
            return;
        }

        motivos.forEach(motivo => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td data-label="Descrição">${motivo.descricao}</td>
                <td data-label="Tipo"><span class="badge bg-secondary">${motivo.tipo}</span></td>
                <td data-label="Ações">
                    <button class="btn btn-sm btn-primary mb-1" onclick="editarMotivo('${motivo._id}')">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-danger mb-1" onclick="deletarMotivo('${motivo._id}')">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            `;
            tabela.appendChild(tr);
        });

    } catch (error) {
        console.error('Falha ao buscar motivos:', error);
        tabela.innerHTML = `<tr><td colspan="3" class="text-center">Erro ao carregar motivos. Tente novamente.</td></tr>`;
        Swal.fire({
            icon: 'error',
            title: 'Erro ao Carregar',
            text: 'Não foi possível carregar a lista de motivos.',
            confirmButtonText: 'Ok'
        });
    } finally {
        hideLoading();
    }
}

/**
 * Prepara o modal para adicionar um novo motivo.
 */
function prepararModalParaAdicionar() {
    document.getElementById('motivoForm').reset();
    document.getElementById('motivoId').value = '';
    document.getElementById('motivoModalLabel').textContent = 'Adicionar Novo Motivo';
    document.getElementById('tipo').value = ""; // Reseta o select
}

/**
 * Busca os dados de um motivo e preenche o modal para edição.
 * @param {string} id - O ID do motivo a ser editado.
 */
async function editarMotivo(id) {
    showLoading();
    try {
        const response = await fetch(`/api/motivos/${id}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        });

        if (!response.ok) throw new Error('Falha ao buscar dados do motivo.');

        const motivo = await response.json();

        document.getElementById('motivoId').value = motivo._id;
        document.getElementById('descricao').value = motivo.descricao;
        document.getElementById('tipo').value = motivo.tipo;
        document.getElementById('motivoModalLabel').textContent = 'Editar Motivo';

        const modal = new bootstrap.Modal(document.getElementById('motivoModal'));
        modal.show();

    } catch (error) {
        console.error("Erro ao preparar edição:", error);
        Swal.fire('Erro', 'Não foi possível carregar os dados do motivo para edição.', 'error');
    } finally {
        hideLoading();
    }
}

/**
 * Salva um novo motivo ou atualiza um existente.
 * @param {Event} event - O evento de submit do formulário.
 */
async function salvarMotivo(event) {
    event.preventDefault();
    showLoading();

    const id = document.getElementById('motivoId').value;
    const descricao = document.getElementById('descricao').value;
    const tipo = document.getElementById('tipo').value;

    const method = id ? 'PUT' : 'POST';
    const url = id ? `/api/motivos/${id}` : '/api/motivos';

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify({ descricao, tipo })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.msg || 'Falha ao salvar o motivo.');
        }

        Swal.fire({
            icon: 'success',
            title: 'Sucesso!',
            text: `Motivo ${id ? 'atualizado' : 'adicionado'} com sucesso.`,
            timer: 1500,
            showConfirmButton: false
        });
        hideLoading(); // Fecha o loading APÓS o Swal de sucesso ser exibido

        const modal = bootstrap.Modal.getInstance(document.getElementById('motivoModal'));
        modal.hide();

        carregarTabelaMotivos(); // Recarrega a tabela

    } catch (error) {
        console.error("Erro ao salvar motivo:", error);
        hideLoading(); // Adicionar aqui para fechar o loading antes do alerta de erro
        Swal.fire('Erro', error.message, 'error');
    }
}

/**
 * Deleta um motivo após confirmação.
 * @param {string} id - O ID do motivo a ser deletado.
 */
async function deletarMotivo(id) {
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
            const response = await fetch(`/api/motivos/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
            });

            if (response.ok) {
                hideLoading(); // Fecha o loading antes de mostrar o sucesso
                Swal.fire('Deletado!', 'O motivo foi deletado com sucesso.', 'success');
                carregarTabelaMotivos(); // Recarrega a tabela
            } else {
                const errorData = await response.json();
                throw new Error(errorData.msg || "Falha ao deletar o motivo.");
            }
        } catch (error) {
            console.error("Erro ao deletar motivo:", error);
            hideLoading(); // Fecha o loading antes de mostrar o erro
            Swal.fire('Erro', error.message, 'error');
        }
    }
}