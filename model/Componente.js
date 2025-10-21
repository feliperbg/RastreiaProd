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
ComponenteSchema.pre('findOneAndDelete', async function(next) {
    try {
        const compId = this.getQuery()['_id'];

        // Verifica se o componente está em uso
        const produto = await mongoose.model('Produto').findOne({ 'componentesNecessarios.componente': compId });
        const etapa = await mongoose.model('Etapa').findOne({ 'componentesConclusao.componente': compId });

        if (produto || etapa) {
            throw new Error('Este componente não pode ser excluído pois está em uso em Produtos ou Etapas.');
        }
        
        next();
    } catch (error) {
        next(error);
    }
});
const Componente = model('Componente', ComponenteSchema);
module.exports = Componente;