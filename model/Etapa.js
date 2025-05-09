const mongoose = require('mongoose');
const Etapas = require('./EtapasTabela'); // Importa o modelo de etapas

/**
 * Classe representando uma etapa no processo.
 */
class Etapa {
    /**
     * Construtor para inicializar os dados de uma etapa.
     */
    constructor(idEtapa, nome, sequencias, departamentoResponsavel, procedimentos, componenteConclusao, funcionariosResponsaveis) {
        this._idEtapa = idEtapa ? mongoose.Types.ObjectId(idEtapa) : null; // Usa ObjectId caso o id seja fornecido
        this._nome = nome;
        this._sequencias = sequencias;
        this._departamentoResponsavel = departamentoResponsavel;
        this._procedimentos = procedimentos;
        this._componenteConclusao = componenteConclusao;
        this._funcionariosResponsaveis = funcionariosResponsaveis;
    }

    /**
     * Cria uma nova etapa no banco de dados.
     */
    async create() {
        try {
            const etapa = new Etapas({
                nome: this._nome,
                sequencias: this._sequencias,
                departamentoResponsavel: this._departamentoResponsavel,
                procedimentos: this._procedimentos,
                componenteConclusao: this._componenteConclusao,
                funcionariosResponsaveis: this._funcionariosResponsaveis,
            });

            const etapaSalva = await etapa.save();
            this._idEtapa = etapaSalva._id;  // MongoDB cria automaticamente um ObjectId

            return true;
        } catch (error) {
            console.error('Erro ao criar a etapa:', error);
            return false;
        }
    }

    /**
     * Deleta uma etapa pelo ID.
     */
    async delete() {
        try {
            const result = await Etapas.findByIdAndDelete(this._idEtapa);
            return result !== null;
        } catch (error) {
            console.error('Erro ao excluir a etapa:', error);
            return false;
        }
    }

    /**
     * Atualiza os dados de uma etapa.
     */
    async update() {
        try {
            const result = await Etapas.findByIdAndUpdate(
                this._idEtapa,
                {
                    nome: this._nome,
                    sequencias: this._sequencias,
                    departamentoResponsavel: this._departamentoResponsavel,
                    procedimentos: this._procedimentos,
                    componenteConclusao: this._componenteConclusao,
                    funcionariosResponsaveis: this._funcionariosResponsaveis
                },
                { new: true }
            );

            return result !== null;
        } catch (error) {
            console.error('Erro ao atualizar a etapa:', error);
            return false;
        }
    }

    /**
     * Retorna todas as etapas cadastradas.
     */
    async readAll() {
        try {
            const etapas = await Etapas.find().sort('nome');
            return etapas;
        } catch (error) {
            console.error('Erro ao buscar etapas:', error);
            return [];
        }
    }

    /**
     * Busca uma etapa específica pelo ID.
     */
    async readByID(idEtapa) {
        this._idEtapa = idEtapa;

        try {
            const etapa = await Etapas.findById(this._idEtapa);
            if (etapa) {
                this._nome = etapa.nome;
                this._sequencias = etapa.sequencias;
                this._departamentoResponsavel = etapa.departamentoResponsavel;
                this._procedimentos = etapa.procedimentos;
                this._componenteConclusao = etapa.componenteConclusao;
                this._funcionariosResponsaveis = etapa.funcionariosResponsaveis;
            }
            return etapa;
        } catch (error) {
            console.error('Erro ao buscar etapa pelo ID:', error);
            return null;
        }
    }

    // Getters e Setters

    get idEtapa() {
        return this._idEtapa;
    }

    get nome() {
        return this._nome;
    }
    set nome(nome) {
        this._nome = nome;
    }

    get sequencias() {
        return this._sequencias;
    }
    set sequencias(sequencias) {
        this._sequencias = sequencias;
    }

    get departamentoResponsavel() {
        return this._departamentoResponsavel;
    }
    set departamentoResponsavel(departamentoResponsavel) {
        this._departamentoResponsavel = departamentoResponsavel;
    }

    get procedimentos() {
        return this._procedimentos;
    }
    set procedimentos(procedimentos) {
        this._procedimentos = procedimentos;
    }

    get componenteConclusao() {
        return this._componenteConclusao;
    }
    set componenteConclusao(componenteConclusao) {
        this._componenteConclusao = componenteConclusao;
    }

    get funcionariosResponsaveis() {
        return this._funcionariosResponsaveis;
    }
    set funcionariosResponsaveis(funcionariosResponsaveis) {
        this._funcionariosResponsaveis = funcionariosResponsaveis;
    }
}

module.exports = Etapa;
