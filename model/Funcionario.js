// Arquivo: model/Funcionario.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const { Schema, model } = mongoose;

const FuncionarioSchema = new Schema({
    nome: {
        type: String,
        required: [true, 'O nome do funcionário é obrigatório.'],
        trim: true,
    },
    turno: {
        type: String,
        trim: true,
    },
    senha: {
        type: String,
        required: [true, 'A senha é obrigatória.'],
        select: false,
    },
    CPF: {
        type: String,
        unique: true,
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'O e-mail é obrigatório.'],
        unique: true,
        trim: true,
        lowercase: true,
    },
    telefone: {
        type: String,
        trim: true,
    },
    credencial: {
        type: Number,
        unique: true,
        trim: true,
    },
    dataNascimento: {
        type: Date,
    },
    permissoes: [{
        type: String,
        trim: true,
    }],
    role: {
        type: String,
        trim: true,
    },
    imagemFuncionario: {
        type: String,
        trim: true,
    },
}, {
    timestamps: true,
});

FuncionarioSchema.pre('save', async function (next) {

    if (!this.isModified('senha')) {
        return next();
    }
    try {
        this.senha = await bcrypt.hash(this.senha, 10);
        next();
    } catch (error) {
        next(error);
    }
});

FuncionarioSchema.plugin(AutoIncrement, { inc_field: 'credencial' });
const Funcionario = model('Funcionario', FuncionarioSchema);

module.exports = Funcionario;