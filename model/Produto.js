// Arquivo: model/Produto.js
// (Substitui e unifica ProdutosTabela.js e o antigo Produto.js)

const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const ProdutoSchema = new Schema({
  nome: {
    type: String,
    required: [true, 'O nome do produto é obrigatório.'],
    trim: true,
  },
  codigo: {
    type: String,
    required: [true, 'O código do produto é obrigatório.'],
    unique: true,
    trim: true,
  },
  descricao: {
    type: String,
    trim: true,
  },
  dataEntrada: {
    type: Date, // Corrigido para Date para melhor manipulação
    default: Date.now,
  },
  dataValidade: {
    type: Date, // Corrigido para Date
  },
  componentesNecessarios: [
    {
      componente: {
        type: Schema.Types.ObjectId,
        ref: 'Componentes',
        required: true,
      },
      quantidade: {
        type: Number,
        required: true,
        min: [1, 'A quantidade mínima de um componente é 1.'],
        default: 1,
      },
    },
  ],
  precoMontagem: {
    type: Number,
    required: true,
    min: [0, 'O preço de montagem não pode ser negativo.'],
  },
  precoVenda: {
    type: Number,
    required: true,
    min: [0, 'O preço de venda não pode ser negativo.'],
  },
  quantidade: {
    type: Number,
    required: true,
    min: [0, 'A quantidade em estoque não pode ser negativa.'],
  },
  etapas: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Etapas',
      required: true,
    },
  ],
}, {
  // Adiciona os campos `createdAt` e `updatedAt` automaticamente
  timestamps: true,
});

// A convenção é usar o nome singular para o modelo.
// O Mongoose criará a coleção no plural "produtos" no banco.
const Produto = model('Produto', ProdutoSchema);

module.exports = Produto;