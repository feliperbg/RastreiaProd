// Arquivo: model/OrdemProducao.js (Versão Final Completa)
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
    quantidade_refugo: {
        type: Number,
        required: true,
        default: 0
    },
    dataEntrega: {
        type: Date,
        required: [true, 'A data de entrega é obrigatória.'],
    },
    historicoEtapas: [{
        etapa: { type: Schema.Types.ObjectId, ref: 'Etapa' },
        status: { type: String, required: true, enum: ['Pendente', 'Em Andamento', 'Pausada', 'Concluída'], default: 'Pendente' },
        dataInicio: Date,
        dataFim: Date,
    }],
    funcionarioAtivo: [{
        funcionario: { type: Schema.Types.ObjectId, ref: 'Funcionario' },
        dataEntrada: Date,
    }],
    timestampProducao: {
        inicio: Date,
        fim: Date,
    },
    pausas: [{
        motivo: { type: String, required: true },
        inicio: { type: Date, required: true },
        fim: Date,
        tipo: { type: String, enum: ['Planejada', 'NaoPlanejada'], required: true, default: 'NaoPlanejada' }
    }],
    criadoPor: {
        type: Schema.Types.ObjectId,
        ref: 'Funcionario',
        required: true,
    },
    motivoCancelamento: {
        type: Schema.Types.ObjectId, 
        ref: 'Motivo',
        trim: true,
        required: [
            function() { return this.status === 'Cancelada'; },
            'O motivo do cancelamento é obrigatório.'
        ]
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// VIRTUAIS DE TEMPO
OrdemProducaoSchema.virtual('duracaoTotalMs').get(function() {
    if (this.timestampProducao && this.timestampProducao.inicio && this.timestampProducao.fim) {
        return this.timestampProducao.fim.getTime() - this.timestampProducao.inicio.getTime();
    }
    return 0;
});

OrdemProducaoSchema.virtual('duracaoPausasMs').get(function() {
    if (!this.pausas) return 0;
    return this.pausas.reduce((total, pausa) => {
        if (pausa.inicio && pausa.fim) {
            return total + (pausa.fim.getTime() - pausa.inicio.getTime());
        }
        return total;
    }, 0);
});

OrdemProducaoSchema.virtual('tempoEfetivoMs').get(function() {
    const duracao = this.duracaoTotalMs;
    return duracao > 0 ? duracao - this.duracaoPausasMs : 0;
});

// VIRTUAIS DE QUALIDADE E PERFORMANCE
OrdemProducaoSchema.virtual('quantidade_boa').get(function() {
    return this.quantidade - this.quantidade_refugo;
});

OrdemProducaoSchema.virtual('taxa_qualidade').get(function() {
    if (!this.quantidade || this.quantidade === 0) return 100;
    return parseFloat(((this.quantidade_boa / this.quantidade) * 100).toFixed(2));
});

OrdemProducaoSchema.virtual('taxa_performance').get(function() {
    if (!this.produto || !this.produto.tempo_ciclo_ideal_segundos || this.status !== 'Concluída' || this.quantidade === 0) {
        return 0;
    }
    const tempoIdealTotalSegundos = this.quantidade * this.produto.tempo_ciclo_ideal_segundos;
    const tempoEfetivoSegundos = this.tempoEfetivoMs / 1000;
    if (tempoEfetivoSegundos === 0) return 0;
    const performance = (tempoIdealTotalSegundos / tempoEfetivoSegundos) * 100;
    return parseFloat(performance.toFixed(2));
});

// VIRTUAIS DE CUSTO
OrdemProducaoSchema.virtual('custo_total_material').get(function() {
    if (!this.produto || !this.produto.componentesNecessarios) return 0;
    const custoUnitario = this.produto.componentesNecessarios.reduce((total, item) => {
        const precoComponente = item.componente && item.componente.precoUnidade ? item.componente.precoUnidade : 0;
        return total + (item.quantidade * precoComponente);
    }, 0);
    return custoUnitario * this.quantidade;
});

OrdemProducaoSchema.virtual('custo_total_mao_de_obra').get(function() {
    if (!this.funcionarioAtivo || this.funcionarioAtivo.length === 0 || !this.funcionarioAtivo[0].funcionario) return 0;
    const valorHoraMedio = this.funcionarioAtivo[0].funcionario.valor_hora || 0;
    const tempoEfetivoHoras = this.tempoEfetivoMs / 3600000;
    return valorHoraMedio * tempoEfetivoHoras;
});

OrdemProducaoSchema.virtual('custo_total_op').get(function() {
    return this.custo_total_material + this.custo_total_mao_de_obra;
});

OrdemProducaoSchema.virtual('custo_por_peca_boa').get(function() {
    if (!this.quantidade_boa || this.quantidade_boa === 0) {
        return this.custo_total_op > 0 ? this.custo_total_op : 0;
    }
    return parseFloat((this.custo_total_op / this.quantidade_boa).toFixed(2));
});

OrdemProducaoSchema.virtual('oee').get(function() {
    if (this.status !== 'Concluída') {
        return 0;
    }

    // Calcula a Disponibilidade como um percentual decimal
    const disponibilidade = this.duracaoTotalMs > 0 ? this.tempoEfetivoMs / this.duracaoTotalMs : 0;
    
    // Pega os outros dois componentes (já estão em percentual, então dividimos por 100)
    const performance = this.taxa_performance / 100;
    const qualidade = this.taxa_qualidade / 100;

    const oeeCalculado = disponibilidade * performance * qualidade * 100;

    return parseFloat(oeeCalculado.toFixed(2));
});

const OrdemProducao = model('OrdemProducao', OrdemProducaoSchema);
module.exports = OrdemProducao;