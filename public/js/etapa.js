    async function carregarEtapas() {
        const pathParts = window.location.pathname.split('/');
        const produtoId = pathParts[pathParts.length - 1];
        const tabelaBody = document.getElementById('tabela-etapas');
        try {
            const response = await fetch(`/etapa/api/produto/${produtoId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            if (!response.ok) {
                throw new Error(`Falha ao buscar dados: ${response.statusText}`);
            }

            const data = await response.json();
            if (!data.status || !Array.isArray(data.etapas)) {
                throw new Error('Formato da resposta da API inválido.');
            }
            
            const etapas = data.etapas;
            tabelaBody.innerHTML = ''; // Limpa a mensagem de "Carregando..."

            if (etapas.length === 0) {
                tabelaBody.innerHTML = `<tr><td colspan="7" class="text-center">Nenhuma etapa encontrada para este produto.</td></tr>`;
                return;
            }

            etapas.forEach(etapa => {
                const tr = document.createElement('tr');
                
                // Constrói a lista de nomes de funcionários
                const nomesFuncionarios = etapa.funcionariosResponsaveis && etapa.funcionariosResponsaveis.length > 0
                    ? etapa.funcionariosResponsaveis.map(f => f.nome).join(', ')
                    : 'Nenhum';

                tr.innerHTML = `
                    <td>${etapa.sequencias}</td>
                    <td>${etapa.nome}</td>
                    <td>${etapa.departamentoResponsavel ? etapa.departamentoResponsavel.nome : 'N/A'}</td>
                    <td>${etapa.procedimentos || 'N/A'}</td>
                    <td>${etapa.componenteConclusao ? etapa.componenteConclusao.nome : 'N/A'}</td>
                    <td>${nomesFuncionarios}</td>
                    <td data-label="Ações">
                        <button class="btn btn-sm btn-primary mb-1" onclick="editarEtapa('${etapa._id}', '${etapa.nome}')">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-danger mb-1" onclick="deletarEtapa('${etapa._id}')">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                `;
                tabelaBody.appendChild(tr);
            });

        } catch (error) {
            console.error('Erro ao carregar etapas:', error);
            tabelaBody.innerHTML = `<tr><td colspan="7" class="text-center">Erro ao carregar as etapas. Por favor, tente novamente.</td></tr>`;
        }
    }

    function editarEtapa(id, nome) {
        Swal.fire({
            title: 'Editar Produto',
            text: `Você deseja editar a etapa com o nome: ${nome}?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sim, editar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
            window.location.href = `/etapa/editar-etapa/${id}`;
            }
        });
    }

    async function deletarEtapa(id) {
      const { isConfirmed } = await Swal.fire({
          title: 'Confirmar Exclusão',
          text: "Tem certeza que deseja deletar esta etapa?",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Sim, deletar',
          cancelButtonText: 'Cancelar'
      });

      if (isConfirmed) {
          try {
              Swal.fire({ title: 'Deletando...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
              const response = await fetch(`/etapa/${id}`, {
                  method: 'DELETE',
                  headers: {
                      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                  }
              });

              if (!response.ok) throw new Error("Erro ao deletar");

              Swal.fire('Deletado!', 'Etapa removido com sucesso.', 'success');
              carregarEtapas();
          } catch (error) {
              console.error(error);
              Swal.fire('Erro!', 'Não foi possível deletar a etapa.', 'error');
          } finally {
              hideLoading();
          }
      }
  }
    // Carga inicial dos dados
    carregarEtapas();