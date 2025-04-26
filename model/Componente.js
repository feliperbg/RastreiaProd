const Componentes = require('./ComponentesTabela'); // Importa o modelo de Componentes

/**
 * Classe representando um componente.
 */
class Componente {
    /**
     * Construtor para inicializar os dados de um componente.
     * 
     * @param {string} nome - Nome do componente.
     * @param {string} codigo - Código do componente.
     * @param {string} descricao - Descrição do componente.
     * @param {Date} dataEntrada - Data de entrada do componente.
     * @param {Date} validade - Validade do componente.
     * @param {number} quantidade - Quantidade do componente.
     * @param {number} precoPagoLote - Preço pago pelo lote do componente.
     * @param {number} precoUnidade - Preço por unidade do componente.
     * @param {Object} dimensoes - Dimensões do componente (comprimento, largura, altura).
     */
    constructor(idComponente, nome, codigo, descricao, dataEntrada, validade, quantidade, precoPagoLote, precoUnidade, dimensoes) {
        this._idComponente = idComponente;
        this._nome = nome;
        this._codigo = codigo;
        this._descricao =  descricao;
        this._dataEntrada = dataEntrada;
        this._validade = validade;
        this._quantidade = quantidade;
        this._precoPagoLote = precoPagoLote;
        this._precoUnidade =  precoUnidade;
        this._dimensoes = dimensoes;
    }

    /**
     * Método responsável por criar um novo componente e salvar suas informações no banco de dados.
     * 
     * @returns {boolean} Retorna `true` se o componente foi criado e salvo com sucesso, 
     *                    ou `false` se ocorreu algum erro durante o processo.
     */
    async create() {
        try {
            // Criação de um novo objeto 'Componente' com os dados fornecidos.
            const componente = new Componentes({
                nome: this._nome,
                codigo: this._codigo,
                descricao: this._descricao,
                dataEntrada: this._dataEntrada,
                validade: this._validade,
                quantidade: this._quantidade,
                precoPagoLote: this._precoPagoLote,
                precoUnidade: this._precoUnidade,
                dimensoes: this._dimensoes
            });

            // Salva o componente no banco de dados e aguarda o retorno.
            const componenteSalvo = await componente.save();

            // Atualiza o ID do componente após a inserção no banco de dados.
            this._idComponente = componenteSalvo._id;

            return true; // Retorna 'true' indicando sucesso.
        } catch (error) {
            console.error('Erro ao criar o componente:', error);
            return false; // Retorna 'false' em caso de erro.
        }
    }

    /**
     * Método para excluir um componente pelo seu ID.
     * 
     * @returns {boolean} Retorna `true` se o componente foi excluído com sucesso, 
     *                    ou `false` se ocorreu algum erro ou o componente não foi encontrado.
     */
    async delete() {
        try {
            // Tenta excluir o componente pelo ID
            const result = await Componentes.findByIdAndDelete(this._idComponente);
            return result !== null; // Retorna verdadeiro se o componente foi excluído
        } catch (error) {
            console.error('Erro ao excluir o componente:', error);
            return false; // Retorna falso em caso de erro
        }
    }

    /**
     * Método para atualizar os dados de um componente.
     * 
     * @returns {boolean} Retorna `true` se o componente foi atualizado com sucesso, 
     *                    ou `false` se ocorreu algum erro ou o componente não foi encontrado.
     */
    async update() {
        try {
            // Tenta atualizar os dados do componente no banco de dados
            const result = await Componentes.findByIdAndUpdate(
                this._idComponente,
                {
                    nome: this._nome,
                    codigo: this._codigo,
                    descricao: this._descricao,
                    dataEntrada: this._dataEntrada,
                    validade: this._validade,
                    quantidade: this._quantidade,
                    precoPagoLote: this._precoPagoLote,
                    precoUnidade: this._precoUnidade,
                    dimensoes: this._dimensoes
                },
                { new: true } // Retorna o documento atualizado
            );

            return result !== null; // Retorna verdadeiro se a atualização foi bem-sucedida
        } catch (error) {
            console.error('Erro ao atualizar o componente:', error);
            return false; // Retorna falso em caso de erro
        }
    }

    /**
     * Método para buscar todos os componentes cadastrados.
     * 
     * @returns {Array} Retorna um array contendo todos os componentes cadastrados
     *                  ou um array vazio em caso de erro.
     */
    async readAll() {
        try {
            // Tenta buscar todos os componentes e ordená-los pelo nome
            const componentes = await Componentes.find().sort('nome');
            return componentes; // Retorna a lista de componentes
        } catch (error) {
            console.error('Erro ao buscar componentes:', error);
            return []; // Retorna uma lista vazia em caso de erro
        }
    }

    /**
     * Método para buscar um componente específico pelo ID.
     * 
     * @param {string} idComponente O ID do componente a ser buscado.
     * @returns {Object|null} Retorna o componente encontrado ou `null` caso não encontrado.
     */
    async readByID(idComponente) {
        this._idComponente = idComponente;

        try {
            // Tenta encontrar o componente pelo ID
            const componente = await Componentes.findById(this._idComponente);
            if (componente) {
                // Preenche os dados do componente na instância atual
                this._nome = componente.nome;
                this._codigo = componente.codigo;
                this._descricao = componente.descricao;
                this._dataEntrada = componente.dataEntrada;
                this._validade = componente.validade;
                this._quantidade = componente.quantidade;
                this._precoPagoLote = componente.precoPagoLote;
                this._precoUnidade = componente.precoUnidade;
                this._dimensoes = componente.dimensoes;
            }
            return componente; // Retorna o componente encontrado
        } catch (error) {
            console.error('Erro ao buscar componente pelo ID:', error);
            return null; // Retorna null em caso de erro
        }
    }

    // Getters e Setters

    get idComponente() {
        return this._idComponente;
    }
    set idComponente(idComponente) {
        this._idComponente = idComponente;
    }

    get nome() {
        return this._nome;
    }
    set nome(nome) {
        this._nome = nome;
    }

    get codigo() {
        return this._codigo;
    }
    set codigo(codigo) {
        this._codigo = codigo;
    }

    get descricao() {
        return this._descricao;
    }
    set descricao(descricao) {
        this._descricao = descricao;
    }

    get dataEntrada() {
        return this._dataEntrada;
    }
    set dataEntrada(dataEntrada) {
        this._dataEntrada = dataEntrada;
    }

    get validade() {
        return this._validade;
    }
    set validade(validade) {
        this._validade = validade;
    }

    get quantidade() {
        return this._quantidade;
    }
    set quantidade(quantidade) {
        this._quantidade = quantidade;
    }

    get precoPagoLote() {
        return this._precoPagoLote;
    }
    set precoPagoLote(precoPagoLote) {
        this._precoPagoLote = precoPagoLote;
    }

    get precoUnidade() {
        return this._precoUnidade;
    }
    set precoUnidade(precoUnidade) {
        this._precoUnidade = precoUnidade;
    }

    get dimensoes() {
        return this._dimensoes;
    }
    set dimensoes(dimensoes) {
        this._dimensoes = dimensoes;
    }
}

module.exports = Componente;
