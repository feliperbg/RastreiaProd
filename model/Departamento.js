const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const DepartamentoSchema = new Schema({
    nome: {
        type: String,
        required: [true, 'O nome do departamento é obrigatório.'],
        trim: true,
        unique: true
    },
    descricao: {
        type: String,
        trim: true,
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual para contar a quantidade de funcionários no departamento
DepartamentoSchema.virtual('funcionariosCount', {
    ref: 'Funcionario', // O nome do seu model de Funcionário
    localField: '_id',
    foreignField: 'departamento', // O campo no model Funcionario que guarda o ID do departamento
    count: true // Apenas contar os documentos
});

DepartamentoSchema.virtual('etapasCount', {
    ref: 'Etapa', // O nome do seu model de Funcionário
    localField: '_id',
    foreignField: 'departamentoResponsavel', // O campo no model Etapa que guarda o ID do departamento
    count: true // Apenas contar os documentos
});
DepartamentoSchema.pre('findOneAndDelete', async function(next) {
    try {
        const depId = this.getQuery()['_id'];

        // Verifica se há funcionários ou etapas usando este departamento
        const funcionario = await mongoose.model('Funcionario').findOne({ departamento: depId });
        const etapa = await mongoose.model('Etapa').findOne({ departamentoResponsavel: depId });

        if (funcionario || etapa) {
            throw new Error('Este departamento não pode ser excluído pois está em uso por Funcionários ou Etapas.');
        }
        
        next();
    } catch (error) {
        next(error);
    }
});
const Departamento = model('Departamento', DepartamentoSchema);
module.exports = Departamento;