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
    historicoEtapas: [{
        etapa: {
            type: Schema.Types.ObjectId,
            ref: 'Etapa',
        },
        status: {
            type: String,
            required: true, // É bom garantir que sempre tenha um status
            enum: ['Pendente', 'Em Andamento', 'Pausada', 'Concluída'],
            default: 'Pendente',
        },
        dataInicio: Date,
        dataFim: Date,  
    }],
    funcionarioAtivo: [{
        funcionario: {
            type: Schema.Types.ObjectId,
            ref: 'Funcionario',
        },
        dataEntrada: Date,
    }],
    timestampProducao: {
        inicio: Date,
        fim: Date,
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
        fim: Date
    }],
    criadoPor: {
        type: Schema.Types.ObjectId,
        ref: 'Funcionario',
        required: true,
    },
   motivoCancelamento: {
        type: String,
        trim: true,
        // Validação customizada
        required: [
            function() { return this.status === 'Cancelada'; },
            'O motivo do cancelamento é obrigatório quando a ordem é cancelada.'
        ]
    }
}, {
    timestamps: true,
});

OrdemProducaoSchema.index({ status: 1 }); // Para filtrar OPs por status (ex: todas as 'Pendentes')
OrdemProducaoSchema.index({ produto: 1 }); // Para encontrar todas as OPs de um determinado produto
OrdemProducaoSchema.index({ dataEntrega: 1 }); // Para ordenar ou filtrar por data de entrega


// 1. Virtual para calcular a duração total em milissegundos
OrdemProducaoSchema.virtual('duracaoTotalMs').get(function() {
    if (this.timestampProducao && this.timestampProducao.inicio && this.timestampProducao.fim) {
        return this.timestampProducao.fim.getTime() - this.timestampProducao.inicio.getTime();
    }
    return 0;
});

// 2. Virtual para calcular o tempo total de pausas em milissegundos
OrdemProducaoSchema.virtual('duracaoPausasMs').get(function() {
    if (!this.pausas || this.pausas.length === 0) {
        return 0;
    }
    return this.pausas.reduce((total, pausa) => {
        // Soma apenas as pausas que já terminaram
        if (pausa.inicio && pausa.fim) {
            return total + (pausa.fim.getTime() - pausa.inicio.getTime());
        }
        return total;
    }, 0);
});

// 3. Virtual para o tempo de produção efetivo
OrdemProducaoSchema.virtual('tempoEfetivoMs').get(function() {
    return this.duracaoTotalMs - this.duracaoPausasMs;
});

// Para incluir os virtuais ao converter o documento para JSON (ex: em res.json(ordem))
OrdemProducaoSchema.set('toJSON', { virtuals: true });
OrdemProducaoSchema.set('toObject', { virtuals: true });
const OrdemProducao = model('OrdemProducao', OrdemProducaoSchema);

module.exports = OrdemProducao;