const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const OrdemProducaoTabela = new Schema({
    status: {
        type: Number,
        required: true,
    },
    produto: {
        type: Schema.Types.ObjectId,
        ref: 'produtos',
        required: true,
    },
    etapa: [{
        etapa: {
            type: Schema.Types.ObjectId,
            ref: 'etapas',
            required: true,
        },
        observacao: {
            type: String,
        },
        inicio: {
            type: Date,
            default: Date.now,
        },
        fim: {
            type: Date,
            validate: {
                validator: function (value) {
                    return !value || value >= this.inicio;
                },
                message: 'O campo "fim" deve ser maior ou igual ao campo "inicio" da etapa.'
            }
        },
        status: {
            type: String,
        }
    }],
    funcionarioAtivo: [{
        funcionario: {
            type: Schema.Types.ObjectId,
            ref: 'funcionarios',
            required: true,
        },
        inicio: {
            type: Date,
            default: Date.now,
        },
        fim: {
            type: Date,
            validate: {
                validator: function (value) {
                    return !value || value >= this.inicio;
                },
                message: 'O campo "fim" deve ser maior ou igual ao campo "inicio" do funcionário.'
            }
        }
    }],
    timestampProducao: {
        inicio: {
            type: Date,
            default: Date.now,
        },
        fim: {
            type: Date,
            validate: {
                validator: function (value) {
                    return !value || value >= this.inicio;
                },
                message: 'O campo "fim" da produção deve ser maior ou igual ao campo "inicio".'
            }
        }
    }
});

const OrdemProducao = model('OrdemProducao', OrdemProducaoTabela);
module.exports = OrdemProducao;
