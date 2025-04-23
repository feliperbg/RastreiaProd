    // Função para formatar a data no formato dd/mm/yyyy
    function formatarData(data) {
      if (!data) return '';
      const date = new Date(data);
      return date.toLocaleDateString('pt-BR');
    }

    // Função para formatar o CPF
    function formatarCPF(cpf) {
      if (!cpf) return '';
      return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }

    // Função para formatar o telefone
    function formatarTelefone(telefone) {
      if (!telefone) return '';
      // Formato (XX) XXXXX-XXXX
      return telefone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }

    async function carregarTabela() {
      try {
        const response = await fetch('/funcionario/readALL', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}` // Se precisar de autenticação
          },
        });

        if (!response.ok) {
          throw new Error(`Erro HTTP: ${response.status}`);
        }

        const funcionarios = await response.json();
        console.log(funcionarios);

        const tbody = document.getElementById("tabela-funcionarios");
        tbody.innerHTML = "";

        funcionarios.forEach(func => {
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td>${func.nome}</td>
            <td>${func.turno}</td>
            <td>${formatarCPF(func.CPF)}</td>
            <td>${func.email}</td>
            <td>${formatarTelefone(func.telefone)}</td>
            <td>${func.credencial}</td>
            <td>${formatarData(func.dataNascimento)}</td>
            <td>${func.permissoes.join(', ')}</td>
            <td>
              <button class="btn btn-sm btn-primary me-1" onclick="editarFuncionario('${func._id}')">
                <i class="bi bi-pencil"></i> Editar
              </button>
              <button class="btn btn-sm btn-danger" onclick="deletarFuncionario('${func._id}')">
                <i class="bi bi-trash"></i> Deletar
              </button>
            </td>
          `;
          tbody.appendChild(tr);
        });

        if (!data.status) { // Se sua API retorna um status booleano
          throw new Error(data.msg || 'Erro na resposta da API');
        }
      } catch (error) {
        console.error('Falha ao buscar funcionários:', error);
        // Aqui você pode tratar diferentes tipos de erro:
        if (error.message.includes('401')) {
          // Token expirado/inválido - redirecionar para login
          window.location.href = '/login';
        }
        throw error; // Rejeita a promise para tratamento posterior
      }
    }

    function editarFuncionario(id) {
      alert("Editar funcionário com ID: " + id);
      // Aqui você pode abrir um modal ou redirecionar para a página de edição
      // window.location.href = `/editar-funcionario?id=${id}`;
    }

    async function deletarFuncionario(id) {
      const confirmacao = confirm("Tem certeza que deseja excluir este funcionário?");
      if (confirmacao) {
        try {
          // Substitua esta URL pela sua API real
          const response = await fetch(`http://sua-api/funcionarios/${id}`, {
            method: 'DELETE'
          });

          if (response.ok) {
            alert("Funcionário excluído com sucesso!");
            carregarTabela(); // Recarrega a tabela após exclusão
          } else {
            throw new Error("Falha ao excluir funcionário");
          }
        } catch (error) {
          console.error("Erro ao excluir funcionário:", error);
          alert("Erro ao excluir funcionário");
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