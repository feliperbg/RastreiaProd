    document.addEventListener('DOMContentLoaded', function() {
        // Seleciona os elementos principais
        const appContent = document.querySelector('.app-content');
        const tableWrapper = document.querySelector('.table-responsive');

        if (!tableWrapper || !appContent) return;

        let floatingScrollbarWrapper;
        let floatingScrollbarInner;
        let isSyncing = false;

        // Função para atualizar a posição e largura da barra flutuante
        function updateScrollbarPosition() {
            if (!floatingScrollbarWrapper) return;

            // getBoundingClientRect() nos dá a posição e o tamanho do elemento na tela
            const tableRect = tableWrapper.getBoundingClientRect();

            // Define a posição e a largura da barra flutuante para corresponder à da tabela
            floatingScrollbarWrapper.style.left = `${tableRect.left}px`;
            floatingScrollbarWrapper.style.width = `${tableRect.width}px`;
        }

        // Função principal para criar ou atualizar a barra de rolagem
        function setupFloatingScrollbar() {
            // Remove a barra antiga se existir, para recalcular
            if (floatingScrollbarWrapper) {
                floatingScrollbarWrapper.remove();
                floatingScrollbarWrapper = null; // Limpa a referência
            }

            // Verifica se a barra de rolagem horizontal é necessária
            const needsScrollbar = tableWrapper.scrollWidth > tableWrapper.clientWidth;
            if (!needsScrollbar) {
                return; // Se não precisa, não faz nada
            }

            // Cria os elementos da barra flutuante
            floatingScrollbarWrapper = document.createElement('div');
            floatingScrollbarWrapper.className = 'floating-scrollbar-wrapper';

            floatingScrollbarInner = document.createElement('div');
            floatingScrollbarInner.className = 'floating-scrollbar-inner';

            // Ajusta a largura interna para corresponder ao conteúdo TOTAL da tabela
            floatingScrollbarInner.style.width = `${tableWrapper.scrollWidth}px`;

            floatingScrollbarWrapper.appendChild(floatingScrollbarInner);

            // MUDANÇA PRINCIPAL: Anexa a barra ao container do conteúdo, não ao body.
            appContent.appendChild(floatingScrollbarWrapper);

            // ATUALIZAÇÃO: Define a posição e largura iniciais
            updateScrollbarPosition();

            // Sincroniza a rolagem da barra flutuante para a tabela
            floatingScrollbarWrapper.addEventListener('scroll', () => {
                if (isSyncing) return;
                isSyncing = true;
                tableWrapper.scrollLeft = floatingScrollbarWrapper.scrollLeft;
                isSyncing = false;
            });

            // Sincroniza a rolagem da tabela para a barra flutuante
            tableWrapper.addEventListener('scroll', () => {
                if (isSyncing) return;
                isSyncing = true;
                floatingScrollbarWrapper.scrollLeft = tableWrapper.scrollLeft;
                isSyncing = false;
            });
        }

        // Intersection Observer para mostrar/esconder a barra
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (floatingScrollbarWrapper) {
                    // Se a tabela estiver visível, mostra a barra e atualiza sua posição
                    if (entry.isIntersecting) {
                        floatingScrollbarWrapper.style.visibility = 'visible';
                        updateScrollbarPosition(); // Garante que a posição esteja correta ao reaparecer
                    } else {
                        floatingScrollbarWrapper.style.visibility = 'hidden';
                    }
                }
            });
        }, { threshold: 0.01 }); // Observa quando pelo menos 1% da tabela está visível

        // Começa a observar o contêiner da tabela
        observer.observe(tableWrapper);

        // --- Event Listeners ---

        // Roda a configuração inicial
        setupFloatingScrollbar();

        // Recalcula tudo ao redimensionar a janela
        window.addEventListener('resize', () => {
            // A função setup já remove e recria, garantindo que tudo seja recalculado
            setupFloatingScrollbar();
            // A função updateScrollbarPosition é chamada dentro de setupFloatingScrollbar
        });
        
        // Recalcula se o conteúdo da tabela mudar (ex: após carregar dados AJAX)
        const tabelaBody = document.getElementById('tabela-ordem-producoes');
        if (tabelaBody) {
            const mutationObserver = new MutationObserver(() => {
                console.log('Conteúdo da tabela modificado, reconfigurando a barra de rolagem.');
                setupFloatingScrollbar();
            });
            mutationObserver.observe(tabelaBody, { childList: true, subtree: true });
        }
    });
    
    const formatarData = (data) => {
        if (!data) return 'N/A';
        const dateObj = new Date(data);
        const userTimezoneOffset = dateObj.getTimezoneOffset() * 60000;
        const correctedDate = new Date(dateObj.getTime() + userTimezoneOffset);
        return correctedDate.toLocaleDateString('pt-BR');
    };
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

    // Altere a sua função original para esta versão mais robusta
    async function formatarArrayAssincrono(dados, fetchNomeFn) {
        let idsParaProcessar = [];
        if (Array.isArray(dados)) {
            idsParaProcessar = dados;
        } else if (typeof dados === 'string' && dados) {
            idsParaProcessar = [dados];
        } else {
            return '';
        }
        const nomes = await Promise.all(idsParaProcessar.map(async (id) => {
            const nome = await fetchNomeFn(id);
            return `<span class="badge bg-secondary">${nome}</span>`;
        }));
        return nomes.join('<br>');
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
            const nome = await buscarNomePorId(id, "funcionarios", 'Funcionários');
            return `<span class="badge bg-secondary">${nome}</span>`;
        }));
        return nomes.join('<br>');
    }
    function formatarCPF(cpf) {
        if (!cpf) return '';
        const cleaned = String(cpf).replace(/\D/g, '');
        if (cleaned.length !== 11) return cpf; // Retorna o original se não for um CPF válido
        return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }

    function formatarTelefone(telefone) {
        if (!telefone) return '';
        const cleaned = String(telefone).replace(/\D/g, '');
        const length = cleaned.length;

        if (length === 11) {
            // Formato para celular: (XX) XXXXX-XXXX
            return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        }
        if (length === 10) {
            // Formato para telefone fixo: (XX) XXXX-XXXX
            return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        }
        return telefone; // Retorna o original se não tiver 10 ou 11 dígitos
    }
    function formatarHorario(data){
        if (!data) {
            return 'N/A';
        }
        
        // O construtor new Date() entende a data como UTC (horário zero).
        const dateObj = new Date(data);

        // O método toLocaleString() converte e formata para o horário local do usuário.
        return dateObj.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

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
            const response = await fetch(`/api/${urlBase}/${id}`, {
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


    function verEtapas(etapas) {
        let listaItens = [];
        if (Array.isArray(etapas)) {
            listaItens = etapas;
        } else if (typeof etapas === 'string' && etapas) {
            listaItens = etapas.split('<br>');
        }
        Swal.fire({
            title: 'Etapas',
            customClass: {
            popup: 'swal-etapas'
            },
            html: listaItens.length > 0
            ? `<ol style="text-align: left; list-style-position: inside;">
                ${listaItens.map(item => 
                    `<li style="white-space: nowrap;">${item}</li>`
                ).join('')}
                </ol>`
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
            popup: 'swal-componentes'
            },
            html: listaItens.length > 0
            ? `<ol style="text-align: left; list-style-position: inside;">
                ${listaItens.map(item => 
                    `<li style="white-space: nowrap;">${item}</li>`
                ).join('')}
                </ol>`
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
        console.log('Descrição HTML:', descricaoHtml);
        console.log(typeof descricaoHtml);
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
                html = `<div style="font-size:1.2em; wetapa.departamentoResponsavel-break: break-word">${conteudo || 'Informação não informada.'}</div>`;
        }
        Swal.fire({
            title: titulo,
            html: html,
            icon: 'info',
            confirmButtonText: 'Fechar'
        });
    }
    /**
     * Anexa um evento de filtro a um campo de input para filtrar uma tabela HTML.
     * A busca é feita em uma coluna específica, identificada pelo atributo data-label.
     *
     * @param {string} inputId - O ID do elemento <input> usado para a busca (ex: 'filtro').
     * @param {string} tbodyId - O ID do elemento <tbody> da tabela a ser filtrada (ex: 'tabela-funcionarios').
     * @param {string} colunaAlvo - O valor do atributo 'data-label' da coluna a ser pesquisada (ex: 'Nome').
     */
    function configurarFiltroDeTabela(inputId, tbodyId, colunaAlvo) {
        const inputFiltro = document.getElementById(inputId);
        
        if (inputFiltro) {
            inputFiltro.addEventListener("input", function () {
                const termo = this.value.toLowerCase();
                const linhas = document.querySelectorAll(`#${tbodyId} tr`);

                linhas.forEach(linha => {
                    // Encontra a célula específica na linha usando o data-label
                    const celula = linha.querySelector(`td[data-label="${colunaAlvo}"]`);
                    
                    if (celula) {
                        const textoCelula = celula.textContent.toLowerCase();
                        const corresponde = textoCelula.includes(termo);
                        // Mostra ou esconde a linha inteira (tr)
                        linha.style.display = corresponde ? "" : "none";
                    }
                });
            });
        }
    }
