// Arquivo: model/Componente.js
const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const ComponenteSchema = new Schema({
    nome: {
        type: String,
        required: [true, 'O nome do componente é obrigatório.'],
        trim: true,
    },
    codigo: {
        type: String,
        required: [true, 'O código do componente é obrigatório.'],
        unique: true,
        trim: true,
    },
    descricao: {
        type: String,
        trim: true,
    },
    dataEntrada: {
        type: Date,
        default: Date.now,
    },
    dataValidade: {
        type: Date,
    },
    quantidade: {
        type: Number,
        required: true,
        min: [0, 'A quantidade não pode ser negativa.'],
    },
    Lote: {
        type: String,
        trim: true,
    },
    precoUnidade: {
        type: Number,
        required: true,
        min: [0, 'O preço unitário não pode ser negativo.'],
    },
}, {
    timestamps: true,
});

const Componente = model('Componente', ComponenteSchema);

module.exports = Componente;