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
    async function formatarFuncionarios(funcionarios) {
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

    /**
     * Formata um array de strings de permissão para um formato legível.
     * Exemplo: 'gerenciar_usuarios' se torna 'Gerenciar Usuários'.
     * @param {Array<string>} permissoes - O array de permissões.
     * @returns {string} Uma única string com as permissões formatadas e separadas por vírgula.
     */
    function formatarPermissoes(permissoes) {
        if (!Array.isArray(permissoes) || permissoes.length === 0) {
            return '';
        }

        return permissoes.map(p => {
            // Se a permissão já contém espaços, assume-se que já está formatada.
            if (p.includes(' ')) {
                return p;
            }

            // Divide a string pelo caractere '_' e capitaliza a primeira letra de cada palavra.
            const palavras = p.split('_');
            return palavras.map(palavra => {
                return palavra.length > 0
                    ? palavra.charAt(0).toUpperCase() + palavra.slice(1)
                    : palavra;
            }).join(' ');
        }).join(', ');
    }

    function formatarTextoPermissao(texto) {
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
        return dados.componente || "Desconhecido";
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

    function verComponentes(componentes) {
        let listaItens = [];
        if (Array.isArray(componentes)) {
            listaItens = componentes;
        } else if (typeof componentes === 'string' && componentes) {
            listaItens = componentes.split('<br>');
        }

        Swal.fire({
            title: 'Componentes Necessários',
            customClass: {
            popup: 'swal-largo'
            },
            html: listaItens.length > 0
            ? `<ul style="text-align: left; list-style-position: inside;">
                ${listaItens.map(item => 
                    `<li style="white-space: nowrap;">${item}</li>`
                ).join('')}
                </ul>`
            : '<i>Sem componentes.</i>',
            confirmButtonText: 'Fechar'
        });
    }

    function verFuncionarios(funcionariosHtml) {
        Swal.fire({
            title: 'Funcionários Responsáveis',
            html: funcionariosHtml
            ? `<ul style="text-align:left">${funcionariosHtml.split('<br>').map(e => `<li>${e}</li>`).join('')}</ul>`
            : '<i>Sem funcionários atribuídos.</i>',
            confirmButtonText: 'Fechar'
        });
    }

    function verDescricao(titulo, descricaoHtml){
        Swal.fire({
            title: titulo,
            html: descricaoHtml 
            ? `<ul style="text-align:left">${descricaoHtml}</ul>`
            : '<i>Sem Descrição atribuída.</i>',
        });
    }

    /**
     * Exibe um modal utilizando SweetAlert2 para mostrar as permissões formatadas.
     * @param {Array<string>} permissoesObjeto - Um array de strings com as permissões.
     */
    function mostrarPermissoesModal(permissoesObjeto) {
        let permissoes = []; // Inicia como um array vazio por padrão

        try {
            // Garante que o objeto recebido é um array antes de prosseguir.
            if (Array.isArray(permissoesObjeto)) {
                permissoes = permissoesObjeto;
            }
        } catch (e) {
            console.error('Ocorreu um erro ao processar as permissões:', e);
            permissoes = []; // Garante que 'permissoes' seja um array vazio em caso de erro.
        }

        // Usa a função auxiliar para formatar o array de permissões.
        const conteudoFormatado = formatarPermissoes(permissoes);

        // Cria uma lista HTML para uma visualização mais organizada.
        const htmlConteudo = conteudoFormatado
            ? `<ul style="text-align:center;">${conteudoFormatado.split(', ').map(e => `<li>${e}</li>`).join('')}</ul>`
            : '<i>Nenhuma permissão atribuída.</i>';

        // Exibe o modal.
        Swal.fire({
            title: 'Permissões do Funcionário',
            html: htmlConteudo,
            icon: 'info',
            confirmButtonText: 'Fechar'
        });
    }

    function mostrarModal(titulo, conteudo) {
        let html = '';
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
                    ? conteudo.map(item => `<div>${item}</div>`).join('')
                    : '<i>Nenhum item encontrado.</i>';
                break;
            default:
                html = `<div style="font-size:1.2em; word-break: break-word">${conteudo || 'Informação não informada.'}</div>`;
        }
        Swal.fire({
            title: titulo,
            html: html,
            icon: 'info',
            confirmButtonText: 'Fechar'
        });
    }
