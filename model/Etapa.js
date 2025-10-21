// Arquivo: model/Etapa.js (Corrigido)
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
    componentesConclusao: [{
        componente: {
            type: Schema.Types.ObjectId,
            ref: 'Componente',
            required: true,
        },
        quantidade: {
            type: Number,
            required: true,
            min: [1, 'A quantidade mínima de um componente é 1.'],
            default: 1
        }
    }],
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
// Impede a exclusão de uma Etapa se ela estiver sendo usada em uma Ordem de Produção
EtapaSchema.pre('findOneAndDelete', async function (next) {
    try {
        const etapaId = this.getQuery()['_id'];
        
        // Usamos mongoose.model() para evitar problemas de importação circular
        const OrdemProducao = mongoose.model('OrdemProducao'); 
        
        // Verifica se alguma OP tem essa etapa em seu histórico
        const ordemEmUso = await OrdemProducao.findOne({ 'historicoEtapas.etapa': etapaId });

        if (ordemEmUso) {
            // Impede a exclusão e envia o erro
            throw new Error('Esta etapa não pode ser excluída pois está registrada no histórico de uma Ordem de Produção.');
        }
        
        // Se não houver ordens, permite a exclusão
        next();
    } catch (error) {
        next(error); // Encaminha o erro para o controller
    }
});
const Etapa = model('Etapa', EtapaSchema);
module.exports = Etapa;