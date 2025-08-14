    // Função para formatar a data no formato dd/mm/yyyy
    function formatarData(data) {
        if (!data) return '';
        // Se for Date, converte para string
        if (data instanceof Date) {
            const dia = String(data.getDate()).padStart(2, '0');
            const mes = String(data.getMonth() + 1).padStart(2, '0');
            const ano = data.getFullYear();
            return `${dia}/${mes}/${ano}`;
        }
        // Se for string no formato YYYY-MM-DD
        if (typeof data === 'string' && /^\d{4}-\d{2}-\d{2}/.test(data)) {
            const [ano, mes, dia] = data.split('T')[0].split('-');
            return `${dia}/${mes}/${ano}`;
        }
        return '';
    }
    function showLoading() {
        Swal.fire({
            title: 'Carregando...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading()
            }
        });
    }

    // Função para fechar loading
    function hideLoading() {
        Swal.close();
    }
    
    function escapeHtml(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    function formatarArray(arr) {
        if (!Array.isArray(arr)) return '';
        return arr.join(', ');
    }

    async function formatarArrayAssincrono(arr, fetchNomeFn) {
        if (!Array.isArray(arr)) return '';
        const nomes = await Promise.all(arr.map(async (id) => {
            const nome = await fetchNomeFn(id);
            return `<span class="badge bg-secondary">${nome}</span>`;
        }));
        return nomes.join('<br>');
    }

    async function buscarNomePorId(id, urlBase, atributo) {
        try {
            const response = await fetch(`/${urlBase}/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
            });
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }
            const resposta = await response.json();
            Console.log(`Resposta de ${urlBase}/${id}:`, resposta);
            return resposta[atributo]?.nome || 'Desconhecido';
        } catch (error) {
            console.error(`Erro ao buscar ${atributo}:`, error);
            return 'Desconhecido';
        }
    }
        async function formatarComponentes(componentes) {
        if (!Array.isArray(componentes)) return '';
        const nomes = await Promise.all(componentes.map(async (id) => {
            const nome = await nomesComponentes(id);
            return `<span class="badge bg-secondary">${nome}</span>`;
        }));
        return nomes.join('<br>');
    }

    // Função para formatar os funcionários responsáveis
    async function formatarFzuncionarios(funcionarios) {
        if (!Array.isArray(funcionarios)) return '';
        const nomes = await Promise.all(funcionarios.map(async (id) => {
            const nome = await nomeFuncionario(id);
            return `<span class="badge bg-secondary">${nome}</span>`;
        }));
        return nomes.join('<br>');
    }
    function formatarCPF(cpf) {
        if (!cpf || cpf.length !== 11) return cpf;
        return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }

    function formatarTelefone(telefone) {
        if (!telefone || telefone.length < 10) return telefone;
        return telefone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }

    // Função para formatar as permissões
    function formatarPermissoes(permissoes) {
        if (!Array.isArray(permissoes)) return '';
        if (permissoes.length === 0) return '';

        return permissoes.map(p => {
            // Se já estiver formatado, mantém
            if (p.includes(' ')) return p;

            // mantendo os acentos originais
            const palavras = p.split('_');
            return palavras.map(palavra => {
                return palavra.length > 0
                    ? palavra.charAt(0).toUpperCase() + palavra.slice(1)
                    : palavra;
            }).join(' ');
        }).join(', ');
    }

    function formatarTexto(texto) {
        return String(texto)
            .replace(/_/g, ' ')
            .toLowerCase()
            .replace(/\b\w/g, l => l.toUpperCase());
    }


    

    async function buscarNomePorId(id, urlBase, atributo) {
        try {
            const response = await fetch(`/${urlBase}/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
            });
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }
            const resposta = await response.json();
            return resposta[atributo]?.nome || 'Desconhecido';
        } catch (error) {
            console.error(`Erro ao buscar ${atributo}:`, error);
            return 'Desconhecido';
        }
    }
    async function obterNomeComponente(id) {
        try {
        const resposta = await fetch(`/componente/${id}`, {
            headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });

        if (!resposta.ok) throw new Error('Erro ao buscar componente');
        const dados = await resposta.json();
        return dados.componente.codigo || "Desconhecido";
        } catch (e) {
        console.error(`Erro ao buscar componente ${id}:`, e);
        return "Erro";
        }
    }
    
    function verEtapas(etapasHtml) {
      Swal.fire({
        title: 'Etapas',
        html: etapasHtml
          ? `<ul style="text-align:left">${etapasHtml.split('<br>').map(e => `<li>${e}</li>`).join('')}</ul>`
          : '<i>Sem etapas.</i>',
        confirmButtonText: 'Fechar'
      });
    }
    
    function verPrecos(precoMontagem, precoVenda) {
      Swal.fire({
        title: 'Preços',
        html: `<ul style="text-align:left">
      <li><strong>Preço de Montagem:</strong> R$ ${precoMontagem}</li>
      <li><strong>Preço de Venda:</strong> R$ ${precoVenda}</li>
    </ul>`,
        confirmButtonText: 'Fechar'
      });
    }

    function verComponentes(componentesHtml) {
      Swal.fire({
        title: 'Componentes Necessários',
        html: componentesHtml
          ? `<ul style="text-align:left">${componentesHtml.split('<br>').map(e => `<li>${e}</li>`).join('')}</ul>`
          : '<i>Sem componentes.</i>',
        confirmButtonText: 'Fechar'
      });
    }

    // Função para mostrar o modal de permissões
    function mostrarPermissoesModal(permissoesObjeto) {
        let permissoes;
        try {   
            permissoes = JSON.parse((permissoesObjeto));
            console.log('Permissões decodificadas:', permissoes);
        } catch (e) {
            console.error('Erro ao decodificar permissões:', e);
            permissoes = [];
        }finally {
            permissoes = [];
        }
        const conteudo = formatarPermissoes(permissoes) || 'Nenhuma permissão atribuída.';
        Swal.fire({
            title: 'Permissões do Funcionário',
            html: `<div style="text-align:center">${conteudo}</div>`,
            icon: 'info',
            confirmButtonText: 'Fechar'
        });
    }

    function mostrarModal(titulo, conteudo) {
        let html = '';
        console.log('Conteúdo recebido:', conteudo);
        console.log('Tipo do conteúdo:', typeof conteudo);
        // Tenta converter de string JSON se necessário
        if (typeof conteudo === 'string') {
            try {
                const parsed = JSON.parse(conteudo);
                conteudo = parsed;
            } catch (e) {
                // mantém como string
            }
        }

        switch (true) {
            case Array.isArray(conteudo):
                html = conteudo.length > 0
                    ? conteudo.map(item => `<div>${formatarTexto(item)}</div>`).join('')
                    : '<i>Nenhum item encontrado.</i>';
                break;

            case typeof conteudo === 'object' && conteudo !== null:
                html = Object.entries(conteudo).length > 0
                    ? Object.entries(conteudo).map(([chave, valor]) =>
                        `<div><strong>${formatarPermissoes(chave)}:</strong> ${formatarTexto(valor)}</div>`
                    ).join('')
                    : '<i>Nenhuma informação disponível.</i>';
                break;

            default:
                html = `<div style="font-size:1.2em; word-break: break-word">${formatarTexto(conteudo) || 'Informação não informada.'}</div>`;
        }

        Swal.fire({
            title: titulo,
            html: html,
            icon: 'info',
            confirmButtonText: 'Fechar'
        });
    }
