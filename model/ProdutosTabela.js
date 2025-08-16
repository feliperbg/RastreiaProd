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
    type: String,
    required: true,
  },
  dataValidade: {
    type: String,
  },
  componentesNecessarios: [
    {
      componente: { // O campo que armazena a referência
        type: Schema.Types.ObjectId,
        ref: 'Componentes',
        required: true,
      },
      quantidade: { // O campo que armazena a quantidade
        type: Number,
        required: true,
        min: [1, 'A quantidade mínima deve ser 1.'], // Garante que a quantidade seja sempre positiva
        default: 1 // Define um valor padrão
      }
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