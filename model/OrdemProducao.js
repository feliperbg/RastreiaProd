// Arquivo: model/OrdemProducao.js
const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const OrdemProducaoSchema = new Schema({
    status: {
        type: String,
        required: true,
        enum: ['Pendente', 'Em Andamento', 'Pausada', 'Concluída', 'Cancelada'],
        default: 'Pendente'
    },
    produto: {
        type: Schema.Types.ObjectId,
        ref: 'Produto',
        required: [true, 'O produto é obrigatório.'],
    },
    quantidade: {
        type: Number,
        required: [true, 'A quantidade é obrigatória.'],
        min: [1, 'A quantidade mínima deve ser 1.'],
    },
    dataEntrega: {
        type: Date,
        required: [true, 'A data de entrega é obrigatória.'],
    },
    etapaAtual: [{
        etapa: {
            type: Schema.Types.ObjectId,
            ref: 'Etapa',
        },
        status: {
            type: String,
            default: 'Pendente',
        },
        dataInicio: {
            type: Date,
        },
        dataFim: {
            type: Date,
        },
    }],
    funcionarioAtivo: [{
        funcionario: {
            type: Schema.Types.ObjectId,
            ref: 'Funcionario',
        },
        dataEntrada: {
            type: Date,
        },
    }],
    timestampProducao: {
        inicio: {
            type: Date,
        },
        fim: {
            type: Date,
        },
    },
    pausas: [{
        motivo: {
            type: String,
            required: true
        },
        inicio: {
            type: Date,
            required: true
        },
        fim: {
            type: Date
        }
    }],
    criadoPor: {
        type: Schema.Types.ObjectId,
        ref: 'Funcionario',
        required: true,
    },
    motivoCancelamento: {
        type: String,
        trim: true,
        default: null
    }
}, {
    timestamps: true,
});

const OrdemProducao = model('OrdemProducao', OrdemProducaoSchema);

module.exports = OrdemProducao;