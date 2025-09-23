document.addEventListener('DOMContentLoaded', async function () {
    const tabelaBody = document.getElementById('tabela-etapas');
    
    // Função para escapar HTML e quebras de linha, tornando a string segura para o onclick
    function escapeProcedimentos(str) {
        if (!str) return '';
        return str
            .replace(/'/g, "\\'") // Escapa aspas simples
            .replace(/"/g, '&quot;') // Escapa aspas duplas
            .replace(/\r?\n/g, '\\n'); // Substitui quebras de linha por '\n' literal
    }

    async function carregarEtapas() {
        const pathParts = window.location.pathname.split('/');
        const produtoId = pathParts[pathParts.length - 1]; // Pega o ID do produto da URL
        if (!produtoId) return;

        tabelaBody.innerHTML = `<tr><td colspan="7" class="text-center">Carregando...</td></tr>`;
        
        try {
            const response = await fetch(`/api/etapas/produtos/${produtoId}`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
            });

            if (!response.ok) throw new Error(`Falha ao buscar dados: ${response.statusText}`);

            const data = await response.json();
            if (!data.status || !Array.isArray(data.etapas)) throw new Error('Formato da API inválido.');
            
            const etapas = data.etapas;
            console.log('Etapas carregadas:', etapas);
            tabelaBody.innerHTML = ''; 

            if (etapas.length === 0) {
                tabelaBody.innerHTML = `<tr><td colspan="7" class="text-center">Nenhuma etapa encontrada.</td></tr>`;
                return;
            }

            etapas.forEach(etapa => {
                const tr = document.createElement('tr');
                const nomesFuncionarios = etapa.funcionariosResponsaveis?.map(f => f.nome).join(', ') || 'Nenhum';
                
                // --- CORREÇÃO APLICADA AQUI ---
                const procedimentosEscapados = escapeProcedimentos(etapa.procedimentos);
                console.log('Procedimentos Escapados:', procedimentosEscapados);
                // -------------------------------
                console.log('Etapa:', etapa);
                tr.innerHTML = `
                    <td>${etapa.sequencias}</td>
                    <td>${etapa.nome}</td>
                    <td>${etapa.departamentoResponsavel ? etapa.departamentoResponsavel.nome : 'N/A'}</td>
                    <td class="text-center">
                        <button class="btn btn-sm btn-outline-info" onclick="verProcedimentos('${etapa.nome}', '${procedimentosEscapados}')" title="Ver procedimentos">
                            <i class="bi bi-list-check"></i>
                        </button>
                    </td>
                    <td>${etapa.componenteConclusao ? etapa.componenteConclusao.nome : 'N/A'}</td>
                    <td>${nomesFuncionarios}</td>
                    <td>
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
            tabelaBody.innerHTML = `<tr><td colspan="7" class="text-center">Erro ao carregar as etapas.</td></tr>`;
        }
    }

    window.verProcedimentos = function(titulo, procedimentos) {
        const procedimentosFormatados = procedimentos.replace(/(\s*)(\d+\.)/g, (match, p1, p2, offset) => {
            return offset > 0 ? `<br>${p2}` : p2;
        });

        Swal.fire({
            title: titulo,
            html: `<div style="text-align: left; white-space: pre-wrap; word-wrap: break-word;">${procedimentosFormatados}</div>`,
            icon: 'info',
            confirmButtonText: 'Fechar'
        });
    }

    window.editarEtapa = function(id, nome) {
        Swal.fire({
            title: 'Editar Etapa',
            text: `Você deseja editar a etapa: ${nome}?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sim, editar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = `/etapas/${id}/editar`;
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
              const response = await fetch(`api/etapas/${id}`, {
                  method: 'DELETE',
                  headers: {
                      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                  }
              });

              if (!response.ok) throw new Error("Erro ao deletar");

              exibirMensagem('Etapa removido com sucesso.', 'sucesso');
              carregarEtapas();
          } catch (error) {
              console.error(error);
             exibirMensagem('Não foi possível deletar a etapa.', 'erro');
          } finally {
              hideLoading();
          }
      }
  }
    // Carga inicial dos dados
    carregarEtapas();
}); 