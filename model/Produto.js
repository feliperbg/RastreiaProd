const mongoose = require('mongoose');
const Produtos = require('./ProdutosTabela'); // Importa o modelo de produtos

/**
 * Classe representando um produto.
 */
class Produto {
    /**
     * Construtor para inicializar os dados de um produto.
     */
    constructor(idProduto, nome, codigo, descricao, dataEntrada, validade, componentesNecessarios, precoMontagem, precoVenda, dimensoes, quantidade, etapas) {
        this._idProduto = idProduto ? mongoose.Types.ObjectId(idProduto) : null; // Usa ObjectId caso o id seja fornecido
        this._nome = nome;
        this._codigo = codigo;
        this._descricao = descricao;
        this._dataEntrada = dataEntrada;
        this._validade = validade;
        this._componentesNecessarios = componentesNecessarios;
        this._precoMontagem = precoMontagem;
        this._precoVenda = precoVenda;
        this._dimensoes = dimensoes;
        this._quantidade = quantidade;
        this._etapas = etapas;
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
                validade: this._validade,
                componentesNecessarios: this._componentesNecessarios,
                precoMontagem: this._precoMontagem,
                precoVenda: this._precoVenda,
                dimensoes: this._dimensoes,
                quantidade: this._quantidade,
                etapas: this._etapas,
            });

            const produtoSalvo = await produto.save();
            this._idProduto = produtoSalvo._id;  // MongoDB cria automaticamente um ObjectId

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
                    validade: this._validade,
                    quantidade: this._quantidade,
                    precoMontagem: this._precoMontagem,
                    precoVenda: this._precoVenda,
                    dimensoes: this._dimensoes
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
                this._validade = produto.validade;
                this._quantidade = produto.quantidade;
                this._precoMontagem = produto.precoMontagem;
                this._precoVenda = produto.precoVenda;
                this._dimensoes = produto.dimensoes;
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

    get dimensoes() {
        return this._dimensoes;
    }
    set dimensoes(dimensoes) {
        this._dimensoes = dimensoes;
    }
}

module.exports = Produto;
