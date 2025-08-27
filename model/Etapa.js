// Arquivo: model/Etapa.js
const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const EtapaSchema = new Schema({
    nome: {
        type: String,
        required: [true, 'O nome da etapa é obrigatório.'],
        trim: true,
    },
    sequencias: {
        type: Number,
        required: [true, 'A ordem da etapa é obrigatória.'],
    },
    departamentoResponsavel: {
        type: Schema.Types.ObjectId,
        ref: 'Departamento',        
        trim: true,
    },
    procedimentos: {
        type: String,
        trim: true,
    },
    componenteConclusao: {
        type: Schema.Types.ObjectId,
        ref: 'Componente',
    },
    funcionariosResponsaveis: [{
        type: Schema.Types.ObjectId,
        ref: 'Funcionario',
    }],
    produto: {
        type: Schema.Types.ObjectId,
        ref: 'Produto',
        required: true,
    },
}, {
    timestamps: true,
});
EtapaSchema.index({ produto: 1, sequencias: 1 }, { unique: true });
const Etapa = model('Etapa', EtapaSchema);

module.exports = Etapa;