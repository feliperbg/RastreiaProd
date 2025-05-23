const OrdensProducao = require('./OrdemProducaoTabela'); // Importa o schema do Mongoose

/**
 * Classe representando uma ordem de produção.
 */
class OrdemProducao {
    /**
     * Construtor para inicializar os dados de uma ordem de produção.
     * 
     * @param {number} status - Status da ordem (ex: 0 = aberta, 1 = em andamento, 2 = finalizada).
     * @param {ObjectId} produto - ID do produto relacionado.
     * @param {Array} etapa - Lista de etapas com seus dados.
     * @param {Array} funcionarioAtivo - Lista de funcionários ativos na ordem.
     * @param {Object} timestampProducao - Objeto com 'inicio' e 'fim' da produção.
     */
    constructor(status, produto, etapa = [], funcionarioAtivo = [], timestampProducao = {}) {
        this._idOrdem = null;
        this._status = status;
        this._produto = produto;
        this._etapa = etapa;
        this._funcionarioAtivo = funcionarioAtivo;
        this._timestampProducao = timestampProducao;
    }

    /**
     * Cria uma nova ordem de produção no banco de dados.
     */
    async create() {
        try {
            const novaOrdem = new OrdensProducao({
                status: this._status,
                produto: this._produto,
                etapa: this._etapa,
                funcionarioAtivo: this._funcionarioAtivo,
                timestampProducao: this._timestampProducao
            });

            const ordemSalva = await novaOrdem.save();
            this._idOrdem = ordemSalva._id;
            return true;
        } catch (error) {
            console.error('Erro ao criar a ordem de produção:', error);
            return false;
        }
    }

    /**
     * Atualiza uma ordem de produção existente no banco de dados.
     */
    async update() {
        try {
            const result = await OrdensProducao.findByIdAndUpdate(
                this._idOrdem,
                {
                    status: this._status,
                    produto: this._produto,
                    etapa: this._etapa,
                    funcionarioAtivo: this._funcionarioAtivo,
                    timestampProducao: this._timestampProducao
                },
                { new: true }
            );

            return result !== null;
        } catch (error) {
            console.error('Erro ao atualizar a ordem de produção:', error);
            return false;
        }
    }

    /**
     * Remove uma ordem de produção pelo ID.
     */
    async delete() {
        try {
            const result = await OrdensProducao.findByIdAndDelete(this._idOrdem);
            return result !== null;
        } catch (error) {
            console.error('Erro ao deletar a ordem de produção:', error);
            return false;
        }
    }

    /**
     * Busca todas as ordens de produção no banco de dados.
     */
    async readAll() {
        try {
            const ordens = await OrdensProducao.find()
                .populate('produto')
                .sort({ 'timestampProducao.inicio': -1 });
            return ordens;
        } catch (error) {
            console.error('Erro ao buscar ordens de produção:', error);
            return [];
        }
    }

    /**
     * Busca uma ordem de produção pelo ID.
     * 
     * @param {string} idOrdem - ID da ordem de produção.
     */
    async readByID(idOrdem) {
        this._idOrdem = idOrdem;
        try {
            const ordem = await OrdensProducao.findById(this._idOrdem)
                .populate('produto etapa.etapa funcionarioAtivo.funcionario');
            if (ordem) {
                this._status = ordem.status;
                this._produto = ordem.produto;
                this._etapa = ordem.etapa;
                this._funcionarioAtivo = ordem.funcionarioAtivo;
                this._timestampProducao = ordem.timestampProducao;
            }
            return ordem;
        } catch (error) {
            console.error('Erro ao buscar ordem de produção por ID:', error);
            return null;
        }
    }

    // Getters e Setters

    get idOrdem() {
        return this._idOrdem;
    }
    set idOrdem(id) {
        this._idOrdem = id;
    }

    get status() {
        return this._status;
    }
    set status(status) {
        this._status = status;
    }

    get produto() {
        return this._produto;
    }
    set produto(produto) {
        this._produto = produto;
    }

    get etapa() {
        return this._etapa;
    }
    set etapa(etapas) {
        this._etapa = etapas;
    }

    get funcionarioAtivo() {
        return this._funcionarioAtivo;
    }
    set funcionarioAtivo(funcionarios) {
        this._funcionarioAtivo = funcionarios;
    }

    get timestampProducao() {
        return this._timestampProducao;
    }
    set timestampProducao(timestamp) {
        this._timestampProducao = timestamp;
    }
}
module.exports = OrdemProducao;
