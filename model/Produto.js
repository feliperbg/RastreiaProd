const mongoose = require('mongoose');
const Produtos = require('./ProdutosTabela'); // Modelo Mongoose

/**
 * Classe representando um produto.
 */
class Produto {
    /**
     * Construtor para inicializar os dados de um produto.
     */
    constructor(nome, codigo, descricao, dataEntrada, dataValidade, componentesNecessarios, precoMontagem, precoVenda, quantidade, etapas) {
        this._idProduto = null;
        this._nome = nome;
        this._codigo = codigo;
        this._descricao = descricao;
        this._dataEntrada = dataEntrada;
        this._dataValidade = dataValidade;
        this._componentesNecessarios = componentesNecessarios || [];
        this._precoMontagem = precoMontagem;
        this._precoVenda = precoVenda;
        this._quantidade = quantidade;
        this._etapas = etapas || [];
    }

    /**
     * Cria um novo produto no banco de dados.
     */
    async create() {
        try {
            const produto = new Produtos({
                nome: this._nome,
                codigo: this._codigo,
                descricao: this._descricao,
                dataEntrada: this._dataEntrada,
                dataValidade: this._dataValidade,
                componentesNecessarios: this._componentesNecessarios,
                precoMontagem: this._precoMontagem,
                precoVenda: this._precoVenda,
                quantidade: this._quantidade,
                etapas: this._etapas
            });

            const produtoSalvo = await produto.save();
            this._idProduto = produtoSalvo._id;

            return true;
        } catch (error) {
            console.error('Erro ao criar o produto:', error);
            return false;
        }
    }

    /**
     * Deleta um produto pelo ID.
     */
    async delete() {
        try {
            const result = await Produtos.findByIdAndDelete(this._idProduto);
            return result !== null;
        } catch (error) {
            console.error('Erro ao excluir o produto:', error);
            return false;
        }
    }

    /**
     * Atualiza os dados do produto.
     */
    async update() {
        try {
            const result = await Produtos.findByIdAndUpdate(
                this._idProduto,
                {
                    nome: this._nome,
                    codigo: this._codigo,
                    descricao: this._descricao,
                    dataEntrada: this._dataEntrada,
                    dataValidade: this._dataValidade,
                    quantidade: this._quantidade,
                    precoMontagem: this._precoMontagem,
                    precoVenda: this._precoVenda,
                    componentesNecessarios: this._componentesNecessarios,
                    etapas: this._etapas
                },
                { new: true }
            );

            return result !== null;
        } catch (error) {
            console.error('Erro ao atualizar o produto:', error);
            return false;
        }
    }

    /**
     * Retorna todos os produtos cadastrados.
     */
    async readAll() {
        try {
            const produtos = await Produtos.find().sort('nome');
            return produtos;
        } catch (error) {
            console.error('Erro ao buscar produtos:', error);
            return [];
        }
    }

    /**
     * Busca um produto específico pelo ID.
     */
    async readByID(idProduto) {
        this._idProduto = idProduto;

        try {
            const produto = await Produtos.findById(this._idProduto);
            if (produto) {
                this._nome = produto.nome;
                this._codigo = produto.codigo;
                this._descricao = produto.descricao;
                this._dataEntrada = produto.dataEntrada;
                this._dataValidade = produto.dataValidade;
                this._componentesNecessarios = produto.componentesNecessarios;
                this._quantidade = produto.quantidade;
                this._precoMontagem = produto.precoMontagem;
                this._precoVenda = produto.precoVenda;
                this._etapas = produto.etapas;
            }
            return produto;
        } catch (error) {
            console.error('Erro ao buscar produto pelo ID:', error);
            return null;
        }
    }

    // Getters e Setters

    get idProduto() {
        return this._idProduto;
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

    get dataValidade() {
        return this._dataValidade;
    }
    set dataValidade(dataValidade) {
        this._dataValidade = dataValidade;
    }

    get quantidade() {
        return this._quantidade;
    }
    set quantidade(quantidade) {
        this._quantidade = quantidade;
    }

    get precoMontagem() {
        return this._precoMontagem;
    }
    set precoMontagem(precoMontagem) {
        this._precoMontagem = precoMontagem;
    }

    get precoVenda() {
        return this._precoVenda;
    }
    set precoVenda(precoVenda) {
        this._precoVenda = precoVenda;
    }

    get componentesNecessarios() {
        return this._componentesNecessarios;
    }
    set componentesNecessarios(componentesNecessarios) {
        this._componentesNecessarios = componentesNecessarios;
    }

    get etapas() {
        return this._etapas;
    }
    set etapas(etapas) {
        this._etapas = etapas;
    }
}

module.exports = Produto;