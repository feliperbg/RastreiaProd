const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const EtapasTabela = new Schema({
    nome: {
        type: String,
        required: true,
    },
    sequencias: [{
        type: String,
    }],
    departamentoResponsavel: {
        type: String,
        required: true,
    },
    procedimentos: [{
        type: String,
        required: true,
    }],
    componenteConclusao: [{
        type: Schema.Types.ObjectId,
        ref: 'componentes',
        required: true,
    }],
    funcionariosResponsaveis: [{
        type: Schema.Types.ObjectId,
        ref: 'funcionarios',
        required: true,
    }]
});

const Etapas = model('Etapas', EtapasTabela);
module.exports = Etapas;
