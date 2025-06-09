const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const ProdutoTabela = new Schema({
  nome: {
    type: String,
    required: true,
  },
  codigo: {
    type: String,
    required: true,
    unique: true,
  },
  descricao: {
    type: String,
    required: true,
  },
  dataEntrada: {
    type: Date,
    default: Date.now, // Não precisa de required: true porque tem default
  },
  dataValidade: {
    type: Date,
    required: true,
  },
  componentesNecessarios: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Componentes',
      required: true,
    }
  ],
  precoMontagem: {
    type: Number,
    required: true,
  },
  precoVenda: {
    type: Number,
    required: true,
  },
  dimensoes: {
    type: {
      comprimento: {
        type: Number,
        required: true,
      },
      largura: {
        type: Number,
        required: true,
      },
      altura: {
        type: Number,
        required: true,
      },
    },
    required: true,
  },
  quantidade: {
    type: Number,
    required: true,
  },
  etapas: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Etapas', // Certifique-se de que o modelo se chama 'Etapas'
      required: true,
    }
  ],
});

const Produtos = model('Produtos', ProdutoTabela);
module.exports = Produtos;