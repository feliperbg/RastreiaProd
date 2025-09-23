// Arquivo: model/Motivo.js
const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const MotivoSchema = new Schema({
    descricao: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    tipo: {
        type: String,
        required: [true, 'O tipo do motivo é obrigatório.'],
        enum: {
            values: ['PAUSA', 'CANCELAMENTO', 'REFUGO', 'OUTRO'],
            message: 'O tipo "{VALUE}" não é um tipo de motivo válido.'
        },
        trim: true
    },
    ativo: {
        type: Boolean,
        default: true // Permite desativar um motivo sem excluí-lo
    }
}, {
    timestamps: true
});

const Motivo = model('Motivo', MotivoSchema);
module.exports = Motivo;