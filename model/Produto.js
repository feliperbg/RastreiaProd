// Arquivo: model/Produto.js
const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const ProdutoSchema = new Schema({
    nome: {
        type: String,
        required: [true, 'O nome do produto é obrigatório.'],
        trim: true
    },
    codigo: {
        type: String,
        required: [true, 'O código do produto é obrigatório.'],
        unique: true,
        trim: true
    },
    descricao: {
        type: String,
        trim: true
    },
    dataEntrada: {
        type: Date,
        default: Date.now
    },
    dataValidade: {
        type: Date
    },
    quantidade: {
        type: Number,
        required: [true, 'A quantidade em estoque é obrigatória.'],
        min: [0, 'A quantidade não pode ser negativa.'],
        default: 1
    },
    precoMontagem: {
        type: Number,
        required: [true, 'O preço de montagem é obrigatório.'],
        min: [0, 'O preço de montagem não pode ser negativo.'],
        default: 0
    },
    precoVenda: {
        type: Number,
        required: [true, 'O preço de venda é obrigatório.'],
        min: [0, 'O preço de venda não pode ser negativo.'],
        default: 0
    },
    componentesNecessarios: [{
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
    tempo_ciclo_ideal_segundos: {
        type: Number,
        required: true,
        default: 60 // Valor padrão, ex: 60 segundos
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true
});

ProdutoSchema.virtual('etapas', {
  ref: 'Etapa',
  localField: '_id',
  foreignField: 'produto'
});

ProdutoSchema.pre('findOneAndDelete', async function(next) {
    try {
        const produtoId = this.getQuery()['_id'];
        // 1. Verifica se há Ordens de Produção usando este produto
        const ordemPendente = await mongoose.model('OrdemProducao').findOne({ produto: produtoId });
        if (ordemPendente) {
            // Se houver, impede a exclusão
            throw new Error('Este produto não pode ser excluído pois está associado a Ordens de Produção.');
        }
        // 2. Se não houver ordens, exclui as Etapas associadas (Delete Cascade)
        await mongoose.model('Etapa').deleteMany({ produto: produtoId });
        next(); // Permite a exclusão do produto
    } catch (error) {
        next(error); // Envia o erro para o controller
    }
});
const Produto = model('Produto', ProdutoSchema);
module.exports = Produto;