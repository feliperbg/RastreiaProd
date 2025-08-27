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
    timestamps: true
});

const Departamento = model('Departamento', DepartamentoSchema);
module.exports = Departamento;