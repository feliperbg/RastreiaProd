  async function carregarTabelaProdutos() {
    try {
      const resposta = await fetch('/produto/readALL', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!resposta.ok) throw new Error("Erro ao carregar produtos");

      const dados = await resposta.json();
      const tabela = document.getElementById("tabela-produtos");
      tabela.innerHTML = "";

      const produtos = Array.isArray(dados) ? dados : dados.produtos || [];
      if (!Array.isArray(produtos)) {
        throw new Error("Resposta da API não é uma lista de produtos.");
      }

      if (produtos.length === 0) {
        tabela.innerHTML = `<tr><td colspan="12">Nenhum produto encontrado.</td></tr>`;
        return;
      }

      for (const prod of produtos) {
        const nomesComponentes = await Promise.all(
          (prod.componentesNecessarios || []).map(obterNomeComponente)
        );
        console.log(nomesComponentes)
        const componentesInfo = (prod.componentesNecessarios || [])
          .map((comp, idx) => {
            // Se nomesComponentes[idx] não existir, mostra "Desconhecido"
            return `Código: ${nomesComponentes[idx].codigo || "Desconhecido"} - Lote: ${nomesComponentes[idx].Lote} - Qtd Disponível em estoque: ${nomesComponentes[idx].quantidade}`;
          })
          .join("<br>");
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td data-label="Nome">${prod.nome}</td>
          <td data-label="Código">${prod.codigo}</td>
          <td data-label="Descrição">
            <button class="btn btn-sm btn-outline-primary" onclick="verDescricao('Descrição do Produto','${escapeHtml(prod.descricao)}')">
              <i class="bi bi-file-earmark-text"></i>
            </button>
          </td>
          <td data-label="Componentes Necessários">
            <button class="btn btn-sm btn-outline-secondary" onclick="verComponentes(\`${componentesInfo}\`)" title="Ver componentes">
              <i class="bi bi-puzzle"></i>
            </button>
          </td>
          <td data-label="Data Entrada">${new Date(prod.dataEntrada).toLocaleDateString("pt-BR")}</td>
          <td data-label="Data dataValidade">${new Date(prod.dataValidade).toLocaleDateString("pt-BR")}</td>
          <td data-label="Preços">
            <button class="btn btn-sm btn-outline-success" onclick="verPrecos('${prod.precoMontagem.toFixed(2)}','${prod.precoVenda.toFixed(2)}')" title="Ver preços">
              <i class="bi bi-currency-dollar"></i>
            </button>
          </td>
          <td data-label="Quantidade">${prod.quantidade}</td>
          <td data-label="Etapas">
            <button class="btn btn-sm btn-outline-info" onclick="verEtapas('${escapeHtml((prod.etapas || []).join('<br>'))}')" title="Ver etapas">
              <i class="bi bi-list-check"></i>
            </button>
          </td>
          <td data-label="Ações">
            <button class="btn btn-sm btn-primary mb-1" onclick="editarProduto('${prod._id}', '${prod.codigo}')">
              <i class="bi bi-pencil"></i> Editar
            </button>
            <button class="btn btn-sm btn-danger mb-1" onclick="deletarProduto('${prod._id}')">
              <i class="bi bi-trash"></i> Deletar
            </button>
          </td>
        `;
        tabela.appendChild(tr);
      }
    } catch (erro) {
      console.error(erro);
      Swal.fire('Erro!', 'Não foi possível carregar os produtos.', 'error');
    }
  }
  function editarProduto(id, codigo) {
    Swal.fire({
        title: 'Editar Produto',
        text: `Você deseja editar o produto com o código: ${codigo}?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sim, editar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = `/produto/editar-produto/${id}`;
        }
    });
  }

  async function deletarProduto(id) {
      const { isConfirmed } = await Swal.fire({
          title: 'Confirmar Exclusão',
          text: "Tem certeza que deseja deletar este produto?",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Sim, deletar',
          cancelButtonText: 'Cancelar'
      });

      if (isConfirmed) {
          try {
              Swal.fire({ title: 'Deletando...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
              const response = await fetch(`/produto/${id}`, {
                  method: 'DELETE',
                  headers: {
                      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                  }
              });

              if (!response.ok) throw new Error("Erro ao deletar");

              Swal.fire('Deletado!', 'Produto removido com sucesso.', 'success');
              carregarTabelaProdutos();
          } catch (error) {
              console.error(error);
              Swal.fire('Erro!', 'Não foi possível deletar o produto.', 'error');
          } finally {
              hideLoading();
          }
      }
  }
    // Filtro dinâmico
    document.getElementById("filtro").addEventListener("input", function () {
      const termo = this.value.toLowerCase();
      const linhas = document.querySelectorAll("#tabela-produtos tr");

      linhas.forEach(tr => {
        const texto = tr.textContent.toLowerCase();
        tr.style.display = texto.includes(termo) ? "" : "none";
      });
    });

    // Inicialização
    carregarTabelaProdutos();